import { Course } from '../../types';

export interface CourseAdapter {
  getAllCourses(): Promise<Course[]>;
  getCourseById(courseId: string): Promise<Course | undefined>;
  unlockCourse(courseId: string): Promise<void>;
  completeLesson(courseId: string, moduleId: string, lessonId: string): Promise<void>;
  getLessonContent(lessonId: string): Promise<string | null>;
}
