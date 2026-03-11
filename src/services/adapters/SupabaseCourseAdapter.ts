
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
  async getAllCourses(userId?: string | null): Promise<Course[]> {
    try {
      if (import.meta.env.DEV) {
        console.log('[CourseAdapter] getAllCourses:start', { userId });
      }

      // 1. Prepare parallel fetches
      const coursesPromise = withTimeout(
        supabase
          .from('courses')
          .select('id, title, description, icon, total_lessons, duration_hours, price, is_published')
          .eq('is_published', true)
          .order('price', { ascending: true }),
        10000,
        'courses.select'
      );

      const enrollmentsPromise = userId 
        ? withTimeout(
            supabase
              .from('enrollments')
              .select('course_id, progress_percent')
              .eq('user_id', userId),
            8000,
            'enrollments.select'
          )
        : Promise.resolve({ data: [] });

      const purchasesPromise = userId
        ? withTimeout(
            supabase
              .from('user_purchases')
              .select('course_id')
              .eq('user_id', userId),
            8000,
            'purchases.select'
          )
        : Promise.resolve({ data: [] });

      // 2. Execute all in parallel
      const [coursesRes, enrollmentsRes, purchasesRes] = await Promise.all([
        coursesPromise,
        enrollmentsPromise,
        purchasesPromise
      ]);

      if (coursesRes.error) throw coursesRes.error;
      const typedCourses = (coursesRes.data ?? []) as CourseRow[];

      const enrollmentMap = new Map<string, { progress: number }>();
      const purchaseSet = new Set<string>();

      if (enrollmentsRes.data) {
        enrollmentsRes.data.forEach((e: any) => {
          enrollmentMap.set(e.course_id, { progress: e.progress_percent });
        });
      }

      if (purchasesRes.data) {
        purchasesRes.data.forEach((p: any) => {
          purchaseSet.add(p.course_id);
        });
      }

      return typedCourses.map((c) => {
        const enrollment = enrollmentMap.get(c.id);
        const hasPurchased = purchaseSet.has(c.id);
        const isEnrolled = !!enrollment;
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
          isLocked: !isEnrolled,
          isProcessing: isProcessing,
          progress: enrollment ? enrollment.progress : 0,
          modules: []
        };
      });
    } catch (error) {
      console.error('[CourseAdapter] getAllCourses:failed', error);
      throw error;
    }
  }

  /**
   * Fetches a specific course by ID, including its modules and lessons.
   * Verifies access rights (isLocked) based on enrollment.
   */
  async getCourseById(courseId: string, userId?: string | null): Promise<Course | undefined> {
    try {
      // 1. Fetch core course data, modules and user status in parallel
      const coursePromise = supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      const modulesPromise = supabase
        .from('modules')
        .select('id, course_id, title, order, lessons (id, module_id, title, type, duration, summary, is_free, order)')
        .eq('course_id', courseId)
        .order('order', { ascending: true });

      const enrollmentPromise = userId
        ? supabase
            .from('enrollments')
            .select('progress_percent')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .maybeSingle()
        : Promise.resolve({ data: null });

      const purchasePromise = userId
        ? supabase
            .from('user_purchases')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .maybeSingle()
        : Promise.resolve({ data: null });

      const [courseRes, modulesRes, enrollmentRes, purchaseRes] = await Promise.all([
        coursePromise,
        modulesPromise,
        enrollmentPromise,
        purchasePromise
      ]);

      const { data: courseData, error: courseError } = courseRes;
      const { data: modulesData, error: modulesError } = modulesRes;

      if (courseError || !courseData) return undefined;
      if (modulesError) throw modulesError;

      const modulesRows = (modulesData || []) as ModuleRow[];
      
      // 2. Fetch progress if user is enrolled
      let isEnrolled = !!enrollmentRes.data;
      let isProcessing = !isEnrolled && !!purchaseRes.data;
      let currentProgress = enrollmentRes.data?.progress_percent ?? 0;
      const completedLessonIds = new Set<string>();

      if (isEnrolled && userId) {
        const lessonIds = modulesRows.flatMap((m) => (m.lessons || []).map((l) => l.id));
        if (lessonIds.length > 0) {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', userId)
            .eq('is_completed', true)
            .in('lesson_id', lessonIds);
          
          if (progressData) {
            (progressData as { lesson_id: string }[]).forEach((p) => completedLessonIds.add(p.lesson_id));
          }
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
