
import { CourseAdapter } from './adapters/CourseAdapter';
import { SupabaseCourseAdapter } from './adapters/SupabaseCourseAdapter';

export const courseService: CourseAdapter = new SupabaseCourseAdapter();
