import { StateCreator } from 'zustand';
import { Course } from '../../types';
import { courseService } from '../../services/courseService';

const COURSES_STALE_MS = 1000 * 60 * 5;
const COURSE_DETAILS_STALE_MS = 1000 * 60 * 10;

export interface CourseSlice {
  courses: Course[];
  isCourseLoading: boolean;
  courseError: string | null;
  lessonContentCache: Record<string, string>; // Cache map: lessonId -> content
  coursesFetchedAt: number | null;
  courseDetailsFetchedAt: Record<string, number>;
  lastUserId: string | null;
  
  fetchCourses: (options?: { force?: boolean }) => Promise<void>;
  fetchCourseDetails: (courseId: string, options?: { force?: boolean }) => Promise<void>;
  unlockCourse: (courseId: string) => Promise<void>;
  completeLesson: (courseId: string, moduleId: string, lessonId: string) => Promise<void>;
  fetchLessonContent: (courseId: string, moduleId: string, lessonId: string) => Promise<void>;
  getCourse: (courseId: string) => Course | undefined;
}

export const createCourseSlice: StateCreator<CourseSlice> = (set, get) => ({
  courses: [],
  isCourseLoading: true,
  courseError: null,
  lessonContentCache: {},
  coursesFetchedAt: null,
  courseDetailsFetchedAt: {},
  lastUserId: null,

  fetchCourses: async (options) => {
    const state = get();
    const currentUserId = (state as { user?: { id?: string } | null }).user?.id ?? null;
    
    if (import.meta.env.DEV) {
      console.log('[CourseSlice] fetchCourses:start', { currentUserId, options, hasCourses: state.courses.length > 0 });
    }

    // 1. Reset if user changed
    // NOTE: We intentionally clear courses if the user ID changes to avoid showing old user data.
    if (state.lastUserId !== currentUserId) {
      // console.log('[CourseSlice] User changed, resetting courses.');
      set({
        courses: [], // CLEAR COURSES ON USER CHANGE
        lessonContentCache: {},
        coursesFetchedAt: null,
        courseDetailsFetchedAt: {},
        lastUserId: currentUserId,
        isCourseLoading: true // Ensure loading state is true when resetting
      });
    }

    // 2. Check cache & loading state
    const hasCourses = get().courses.length > 0;
    const lastFetchedAt = get().coursesFetchedAt ?? 0;
    const isStale = Date.now() - lastFetchedAt > COURSES_STALE_MS;
    const shouldForce = options?.force === true;

    // If we have data, it's fresh, and we are not forced -> STOP.
    // BUT if we just cleared the courses (hasCourses is false), we MUST proceed.
    if (!shouldForce && hasCourses && !isStale) {
        if (state.isCourseLoading) {
          set({ isCourseLoading: false });
        }
        if (import.meta.env.DEV) {
          console.log('[CourseSlice] fetchCourses:skip_fresh', { isCourseLoading: get().isCourseLoading, isStale, hasCourses });
        }
        return;
    }
    
    // If we have an error and not forced, stop.
    if (!shouldForce && state.courseError) {
        if (import.meta.env.DEV) {
          console.log('[CourseSlice] fetchCourses:skip_error', { courseError: state.courseError });
        }
        set({ isCourseLoading: false });
        return;
    }

    // 3. Start Loading
    set({ isCourseLoading: true, courseError: null });
    if (import.meta.env.DEV) {
      console.log('[CourseSlice] fetchCourses:loading_true');
    }

    try {
      // Add a safety timeout to prevent infinite loading state
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Courses request timed out')), 15000)
      );

      const coursesPromise = courseService.getAllCourses();
      
      const courses = await Promise.race([coursesPromise, timeoutPromise]);
      if (import.meta.env.DEV) {
        console.log('[CourseSlice] fetchCourses:success', { count: (courses || []).length });
      }
      set({
        courses: courses || [],
        isCourseLoading: false,
        coursesFetchedAt: Date.now(),
        courseError: null
      });
    } catch (error) {
      console.error('Failed to fetch courses', error);

      const isAbortError =
        error instanceof DOMException && error.name === 'AbortError';

      if (isAbortError) {
        set({ isCourseLoading: false });
        console.error('[CourseSlice] fetchCourses:abort');
        return;
      }

      const hasCachedCourses = get().courses.length > 0;
      const isTimeout =
        error instanceof Error && error.message.includes('Courses request timed out');

      if (isTimeout && hasCachedCourses) {
        set({
          isCourseLoading: false,
          courseError: null
        });
        return;
      }

      set({
        courseError: error instanceof Error ? error.message : 'Failed to fetch courses',
        isCourseLoading: false
      });
    }
  },

  fetchCourseDetails: async (courseId, options) => {
    const state = get();
    const existingCourse = state.courses.find((c) => c.id === courseId);
    const hasModules = !!existingCourse?.modules?.length;
    const lastFetchedAt = state.courseDetailsFetchedAt[courseId] ?? 0;
    const isStale = Date.now() - lastFetchedAt > COURSE_DETAILS_STALE_MS;
    const shouldForce = options?.force === true;

    if (!shouldForce && hasModules && !isStale) return;

    set({ isCourseLoading: !hasModules, courseError: null });
    try {
      const course = await courseService.getCourseById(courseId);
      if (course) {
        set((state) => ({
          courses: state.courses.some((c) => c.id === courseId)
            ? state.courses.map((c) => (c.id === courseId ? course : c))
            : [...state.courses, course],
          isCourseLoading: false,
          courseDetailsFetchedAt: {
            ...state.courseDetailsFetchedAt,
            [courseId]: Date.now()
          }
        }));
      } else {
        set({ isCourseLoading: false });
      }
    } catch (error) {
      console.error('Failed to fetch course details', error);
      set({ courseError: 'Failed to fetch course details', isCourseLoading: false });
    }
  },

  unlockCourse: async (courseId) => {
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === courseId
          ? { ...course, isLocked: false, progress: 0 }
          : course
      ),
    }));

    try {
      await courseService.unlockCourse(courseId);
    } catch (error) {
      console.error('Failed to unlock course on server', error);
    }
  },

  completeLesson: async (courseId, moduleId, lessonId) => {
    // Optimistic Update
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              modules: (course.modules || []).map((mod) =>
                mod.id === moduleId
                  ? {
                      ...mod,
                      lessons: mod.lessons.map((lesson) =>
                        lesson.id === lessonId
                          ? { ...lesson, isCompleted: true }
                          : lesson
                      ),
                    }
                  : mod
              ),
            }
          : course
      ),
    }));

    try {
      await courseService.completeLesson(courseId, moduleId, lessonId);
    } catch (error) {
      console.error('Failed to complete lesson on server', error);
    }
  },

  fetchLessonContent: async (_courseId, _moduleId, lessonId) => {
    const state = get();
    // 1. Check Memory Cache First
    if (state.lessonContentCache[lessonId]) return;

    // 2. Fetch from API if not in cache
    try {
      const fetchedContent = await courseService.getLessonContent(lessonId);
      
      if (fetchedContent) {
        set((s) => ({
          // Update Cache Only (Single Source of Truth)
          lessonContentCache: { ...s.lessonContentCache, [lessonId]: fetchedContent }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch lesson content', error);
    }
  },

  getCourse: (courseId) => get().courses.find((c) => c.id === courseId),
});
