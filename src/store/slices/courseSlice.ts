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
  isCourseLoading: false,
  courseError: null,
  lessonContentCache: {},
  coursesFetchedAt: null,
  courseDetailsFetchedAt: {},
  lastUserId: null,

  fetchCourses: async (options) => {
    const state = get();
    const currentUserId = (state as { user?: { id?: string } | null }).user?.id ?? null;
    
    // 1. Reset if user changed
    if (state.lastUserId !== currentUserId) {
      set({
        courses: [],
        lessonContentCache: {},
        coursesFetchedAt: null,
        courseDetailsFetchedAt: {},
        lastUserId: currentUserId
      });
    }

    // 2. Check cache & loading state
    const hasCourses = get().courses.length > 0;
    const lastFetchedAt = get().coursesFetchedAt ?? 0;
    const isStale = Date.now() - lastFetchedAt > COURSES_STALE_MS;
    const shouldForce = options?.force === true;

    // Prevent concurrent fetches or redundant fetches
    if (state.isCourseLoading && !shouldForce) return;
    
    // If we have an error, stop (unless forced). This prevents loops.
    if (!shouldForce && state.courseError) return;

    // If we have data and it's fresh, stop.
    if (!shouldForce && hasCourses && !isStale) return;

    // 3. Start Loading
    if (!hasCourses) {
      set({ isCourseLoading: true, courseError: null });
    } else {
      set({ courseError: null });
    }

    try {
      const courses = await courseService.getAllCourses();
      set({
        courses: courses || [],
        isCourseLoading: false,
        coursesFetchedAt: Date.now(),
        courseError: null
      });
    } catch (error) {
      console.error('Failed to fetch courses', error);
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
