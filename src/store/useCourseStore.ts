import { useAppStore } from './useAppStore';

// Re-export selector hook for backward compatibility
export const useCourseStore = () => {
  const courses = useAppStore((state) => state.courses);
  // Map new names to old names
  const isLoading = useAppStore((state) => state.isCourseLoading);
  const error = useAppStore((state) => state.courseError);
  
  const fetchCourses = useAppStore((state) => state.fetchCourses);
  const fetchCourseDetails = useAppStore((state) => state.fetchCourseDetails);
  const unlockCourse = useAppStore((state) => state.unlockCourse);
  const completeLesson = useAppStore((state) => state.completeLesson);
  const fetchLessonContent = useAppStore((state) => state.fetchLessonContent);
  const getCourse = useAppStore((state) => state.getCourse);
  const lessonContentCache = useAppStore((state) => state.lessonContentCache);

  return {
    courses,
    isLoading,
    error,
    fetchCourses,
    fetchCourseDetails,
    unlockCourse,
    completeLesson,
    fetchLessonContent,
    getCourse,
    lessonContentCache
  };
};
