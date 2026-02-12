import { describe, it, expect } from 'vitest';
import { getLessonStatus } from '../useLessonStatus';
import { Course, Lesson } from '../../../../types';

describe('getLessonStatus', () => {
  const mockCourse: Course = {
    id: 'c1',
    title: 'Test Course',
    description: 'Description',
    icon: 'icon',
    totalLessons: 10,
    durationHours: 5,
    price: 100,
    isLocked: false,
    isPublished: true,
    modules: []
  };

  const mockLesson: Lesson = {
    id: 'l1',
    title: 'Lesson 1',
    type: 'text',
    duration: '10 min',
    isCompleted: false,
    moduleId: 'm1',
    isFree: false,
    order: 1
  };

  it('should unlock lesson if course is unlocked and previous lesson is completed', () => {
    const result = getLessonStatus(mockCourse, mockLesson, true);
    expect(result.isUnlocked).toBe(true);
  });

  it('should lock lesson if previous lesson is not completed', () => {
    const result = getLessonStatus(mockCourse, mockLesson, false);
    expect(result.isUnlocked).toBe(false);
  });

  it('should lock lesson if course is locked', () => {
    const lockedCourse = { ...mockCourse, isLocked: true };
    const result = getLessonStatus(lockedCourse, mockLesson, true);
    expect(result.isUnlocked).toBe(false);
  });

  it('should return isCompleted status correctly', () => {
    const completedLesson = { ...mockLesson, isCompleted: true };
    const result = getLessonStatus(mockCourse, completedLesson, true);
    expect(result.isCompleted).toBe(true);
  });
});
