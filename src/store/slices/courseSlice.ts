import { StateCreator } from 'zustand';
import { Course } from '../../types';
import { courseApi } from '../../features/courses/api/courseApi';

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
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const coursesPromise = courseApi.getAllCourses();
      const courses = await Promise.race([coursesPromise, timeoutPromise]) as Course[];
      
      set({ courses, isCourseLoading: false, coursesFetchedAt: Date.now() });
    } catch (error) {
      console.error('Failed to fetch courses', error);
      set({ courseError: 'Failed to fetch courses', isCourseLoading: false });
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
      const course = await courseApi.getCourseById(courseId);
      if (course) {
        // OPTIMIZATION: Re-apply cached content to the new course object
        // This prevents content from being wiped out when refreshing course details
        const cache = get().lessonContentCache;
        if (course.modules) {
          course.modules.forEach(m => {
            m.lessons.forEach(l => {
              if (!l.content && cache[l.id]) {
                l.content = cache[l.id];
              }
            });
          });
        }

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
      await courseApi.unlockCourse(courseId);
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
      await courseApi.completeLesson(courseId, moduleId, lessonId);
    } catch (error) {
      console.error('Failed to complete lesson on server', error);
    }
  },

  fetchLessonContent: async (courseId, moduleId, lessonId) => {
    const state = get();
    // 1. Check Memory Cache First
    let content = state.lessonContentCache[lessonId];
    
    // 2. Check Session Storage if not in Memory
    if (!content) {
        const cached = sessionStorage.getItem(`lesson_content_${lessonId}`);
        if (cached) {
            content = cached;
            // Update memory cache to avoid hitting session storage again
            set((s) => ({ lessonContentCache: { ...s.lessonContentCache, [lessonId]: content } }));
        }
    }

    if (content) {
        // If we have it in cache, ensure it's in the course object too
        // (This covers cases where cache exists but course object was reset)
        const course = state.courses.find(c => c.id === courseId);
        const module = course?.modules?.find(m => m.id === moduleId);
        const lesson = module?.lessons?.find(l => l.id === lessonId);
        
        if (lesson && (!lesson.content || lesson.content.length < 200)) {
             set((s) => ({
                courses: s.courses.map((c) =>
                    c.id === courseId ? {
                        ...c,
                        modules: (c.modules || []).map((m) =>
                            m.id === moduleId ? {
                                ...m,
                                lessons: m.lessons.map((l) =>
                                    l.id === lessonId ? { ...l, content: content } : l
                                )
                            } : m
                        )
                    } : c
                )
             }));
        }
        return;
    }

    // 3. Fetch from API if not in cache
    try {
      const fetchedContent = await courseApi.getLessonContent(lessonId);
      
      if (fetchedContent) {
        // Save to Session Storage
        try {
            sessionStorage.setItem(`lesson_content_${lessonId}`, fetchedContent);
        } catch (error) {
            console.warn('Session storage full, cannot cache lesson content', error);
        }

        set((s) => ({
          // Update Cache
          lessonContentCache: { ...s.lessonContentCache, [lessonId]: fetchedContent },
          // Update Course Object
          courses: s.courses.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  modules: (c.modules || []).map((m) =>
                    m.id === moduleId
                      ? {
                          ...m,
                          lessons: m.lessons.map((l) =>
                            l.id === lessonId
                              ? { ...l, content: fetchedContent }
                              : l
                          ),
                        }
                      : m
                  ),
                }
              : c
          ),
        }));
      }
    } catch (error) {
      console.error('Failed to fetch lesson content', error);
    }
  },

  getCourse: (courseId) => get().courses.find((c) => c.id === courseId),
});
