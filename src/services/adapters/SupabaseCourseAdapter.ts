
import { CourseAdapter } from './CourseAdapter';
import { Course, CourseModule, LessonType } from '../../types';
import { supabase } from '../supabase';

type CourseRow = {
  id: string;
  title: string;
  description: string;
  icon: string;
  total_lessons: number;
  duration_hours: number;
  price: number;
  is_published: boolean;
};

type LessonRow = {
  id: string;
  module_id: string;
  title: string;
  type: string;
  duration: string;
  summary: string | null;
  is_free: boolean;
  order: number;
};

type ModuleRow = {
  id: string;
  course_id: string;
  title: string;
  order: number;
  lessons?: LessonRow[] | null;
};

const withTimeout = async <T,>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    return await new Promise<T>((resolve, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`${label} timed out`));
      }, ms);
      promise.then(resolve, reject);
    });
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const toLessonType = (value: string): LessonType => {
  if (value === 'video' || value === 'quiz' || value === 'code' || value === 'presentation' || value === 'react') {
    return value;
  }
  return 'text';
};

/**
 * Supabase implementation of the CourseAdapter.
 * Handles data fetching from Supabase tables (courses, modules, lessons, enrollments).
 * 
 * @implements CourseAdapter
 */
export class SupabaseCourseAdapter implements CourseAdapter {
  
  /**
   * Fetches all published courses from the database.
   * Includes dynamic 'isLocked' status based on the current user's enrollments.
   */
  async getAllCourses(): Promise<Course[]> {
    try {
      console.error('[CourseAdapter] getAllCourses:start');
      const { data: coursesData, error: coursesError } = await withTimeout(
        supabase
          .from('courses')
          .select('id, title, description, icon, total_lessons, duration_hours, price, is_published')
          .eq('is_published', true)
          .order('price', { ascending: true }),
        8000,
        'courses.select'
      );

      if (coursesError) throw coursesError;
      if (!coursesData) return [];
      console.error('[CourseAdapter] getAllCourses:courses_ok', { count: coursesData.length });

      let user: { id: string } | null = null;
      try {
        const { data } = await withTimeout(supabase.auth.getSession(), 6000, 'auth.getSession');
        user = data.session?.user ?? null;
        console.error('[CourseAdapter] getAllCourses:session_ok', { hasUser: !!user });
      } catch (authError) {
        console.error('[CourseAdapter] getAllCourses:session_error', authError);
      }

      const enrollmentMap = new Map<string, { progress: number }>();
      const purchaseSet = new Set<string>();

      if (user) {
        try {
          const [enrollmentsRes, purchasesRes] = await withTimeout(
            Promise.all([
              supabase
                .from('enrollments')
                .select('course_id, progress_percent')
                .eq('user_id', user.id),
              supabase
                .from('user_purchases')
                .select('course_id')
                .eq('user_id', user.id)
            ]),
            8000,
            'user_course_data'
          );

          if (enrollmentsRes.data) {
            enrollmentsRes.data.forEach((e) => {
              enrollmentMap.set(e.course_id, { progress: e.progress_percent });
            });
          }

          if (purchasesRes.data) {
            purchasesRes.data.forEach((p) => {
              purchaseSet.add(p.course_id);
            });
          }
        } catch (userDataError) {
          console.error('[CourseAdapter] getAllCourses:user_data_error', userDataError);
        }
      }

      const courses = (coursesData || []) as CourseRow[];
      console.error('[CourseAdapter] getAllCourses:map', { count: courses.length, hasUser: !!user });
      return courses.map((c) => {
        const enrollment = enrollmentMap.get(c.id);
        const hasPurchased = purchaseSet.has(c.id);
        const isEnrolled = !!enrollment;
        
        // Logic:
        // isLocked: strictly based on enrollment (because RLS enforces it).
        // isProcessing: purchased but not enrolled (trigger failure/delay).
        const isProcessing = hasPurchased && !isEnrolled;

        return {
          id: c.id,
          title: c.title,
          description: c.description,
          icon: c.icon,
          totalLessons: c.total_lessons,
          durationHours: c.duration_hours,
          price: c.price,
          isPublished: c.is_published,
          isLocked: !isEnrolled, // Strict RLS alignment
          isProcessing: isProcessing,
          progress: enrollment ? enrollment.progress : 0,
          modules: [] // Modules are lazy-loaded in getCourseById
        };
      });

    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  /**
   * Fetches a specific course by ID, including its modules and lessons.
   * Verifies access rights (isLocked) based on enrollment.
   */
  async getCourseById(courseId: string): Promise<Course | undefined> {
    try {
      // 1. Fetch course details and modules in parallel
      const [courseRes, modulesRes] = await Promise.all([
        supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single(),
        supabase
          .from('modules')
          .select('id, course_id, title, order, lessons (id, module_id, title, type, duration, summary, is_free, order)')
          .eq('course_id', courseId)
          .order('order', { ascending: true })
      ]);

      const { data: courseData, error: courseError } = courseRes;
      const { data: modulesData, error: modulesError } = modulesRes;

      if (courseError || !courseData) return undefined;
      if (modulesError) throw modulesError;

      const modulesRows = (modulesData || []) as ModuleRow[];

      // 2. Check enrollment status, progress, and purchase in parallel
      let isEnrolled = false;
      let isProcessing = false;
      let currentProgress = 0;
      const completedLessonIds = new Set<string>();

      // 3. Try to get current user session
      let user: { id: string } | null = null;
      try {
        const { data } = await supabase.auth.getSession();
        user = data.session?.user ?? null;
      } catch (authError) {
        console.warn(`Supabase auth session check failed while fetching course ${courseId}:`, authError);
        user = null;
      }

      if (user) {
        const lessonIds = modulesRows.flatMap((m) => (m.lessons || []).map((l) => l.id));

        try {
          const [enrollmentRes, purchaseRes, progressRes] = await Promise.all([
            supabase
              .from('enrollments')
              .select('progress_percent')
              .eq('user_id', user.id)
              .eq('course_id', courseId)
              .maybeSingle(),
            supabase
              .from('user_purchases')
              .select('id')
              .eq('user_id', user.id)
              .eq('course_id', courseId)
              .maybeSingle(),
            lessonIds.length > 0 
              ? supabase
                  .from('user_progress')
                  .select('lesson_id')
                  .eq('user_id', user.id)
                  .eq('is_completed', true)
                  .in('lesson_id', lessonIds)
              : Promise.resolve({ data: [] })
          ]);
          
          if (enrollmentRes.data) {
            isEnrolled = true;
            currentProgress = enrollmentRes.data.progress_percent;
          } else if (purchaseRes.data) {
            isProcessing = true;
          }

          if (progressRes.data) {
            (progressRes.data as { lesson_id: string }[]).forEach((p) => completedLessonIds.add(p.lesson_id));
          }
        } catch (userDataError) {
          console.error(`Failed to fetch user specific data for course ${courseId}:`, userDataError);
        }
      }

      // 4. Map to Application Types
      const modules: CourseModule[] = modulesRows.map((m) => ({
        id: m.id,
        courseId: m.course_id,
        title: m.title,
        order: m.order,
        // Sort lessons by order
        lessons: (m.lessons || [])
          .sort((a, b) => a.order - b.order)
          .map((l) => ({
            id: l.id,
            moduleId: l.module_id,
            title: l.title,
            type: toLessonType(l.type),
            duration: l.duration,
            content: l.summary || null, // Only load summary/preview initially
            isFree: l.is_free,
            order: l.order,
            isCompleted: completedLessonIds.has(l.id)
          }))
      }));

      return {
        id: courseData.id,
        title: courseData.title,
        description: courseData.description,
        icon: courseData.icon,
        totalLessons: courseData.total_lessons,
        durationHours: courseData.duration_hours,
        price: courseData.price,
        isPublished: courseData.is_published,
        isLocked: !isEnrolled,
        isProcessing: isProcessing,
        progress: currentProgress,
        modules: modules
      };

    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      return undefined;
    }
  }

  /**
   * Securely fetches the full lesson content on demand.
   * Uses RPC to verify access rights server-side.
   */
  async getLessonContent(lessonId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('get_secure_lesson_content', { 
        p_lesson_id: lessonId 
      });

      if (error) {
        console.error('Error fetching lesson content:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getLessonContent:', error);
      return null;
    }
  }

  /**
   * Unlocks a course by calling the secure server-side enrollment function.
   * This respects RLS and business rules (e.g. only free courses can be unlocked directly).
   */
  async unlockCourse(courseId: string): Promise<void> {
    const { error } = await supabase.rpc('enroll_in_course', { course_id_param: courseId });
    
    if (error) {
      console.error('Enrollment failed:', error);
      throw error;
    }
  }

  /**
   * Marks a lesson as completed using secure server-side logic.
   */
  async completeLesson(courseId: string, moduleId: string, lessonId: string): Promise<void> {
    const { error } = await supabase.rpc('complete_lesson', {
      course_id_param: courseId,
      module_id_param: moduleId,
      lesson_id_param: lessonId
    });

    if (error) {
      console.error('Failed to complete lesson:', error);
      throw error;
    }
  }
}
