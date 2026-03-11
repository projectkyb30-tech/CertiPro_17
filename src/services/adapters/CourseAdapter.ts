import { Course } from '../../types';

export interface CourseAdapter {
  getAllCourses(userId?: string | null): Promise<Course[]>;
  getCourseById(courseId: string, userId?: string | null): Promise<Course | undefined>;
  unlockCourse(courseId: string): Promise<void>;
  completeLesson(courseId: string, moduleId: string, lessonId: string): Promise<void>;
  getLessonContent(lessonId: string): Promise<string | null>;
}
