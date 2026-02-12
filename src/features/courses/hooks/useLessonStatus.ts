import { Course, Lesson } from '../../../types';

export const getLessonStatus = (
  course: Course,
  lesson: Lesson,
  previousLessonCompleted: boolean
) => {
  const isLessonUnlocked = !course.isLocked && previousLessonCompleted;
  const isLessonCompleted = !!lesson.isCompleted;

  return {
    isUnlocked: isLessonUnlocked,
    isCompleted: isLessonCompleted,
  };
};
