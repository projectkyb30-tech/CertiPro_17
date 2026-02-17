
/**
 * CertiPro Type Definitions
 * 
 * This file contains all the TypeScript interfaces for the application.
 * It reflects the "Application Domain" (CamelCase), which may differ slightly
 * from the "Database Schema" (snake_case).
 * 
 * The Service Layer is responsible for mapping between these two.
 */

// ==========================================
// USER & PROFILE
// ==========================================

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  birthDate?: string | null; // ISO Date string YYYY-MM-DD
  role?: 'user' | 'admin';
  
  // Gamification Stats
  streak: number;
  xp: number;
  lessonsCompletedToday: number;
  
  // Meta
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// COURSE CATALOG
// ==========================================

export type CourseIconType = 'python' | 'database' | 'network' | string;

export interface Course {
  id: string;
  title: string;
  description: string | null;
  icon: CourseIconType;
  
  // Stats
  totalLessons: number;
  durationHours: number;
  price: number;
  
  // Status
  isPublished: boolean;
  
  // Dynamic properties (populated based on user context)
  isLocked?: boolean; // Derived from enrollment status
  isProcessing?: boolean; // If purchased but not yet enrolled (sync delay)
  progress?: number; // 0-100 calculated from enrollments
  
  // Content
  modules?: CourseModule[];
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export type LessonType = 'text' | 'video' | 'quiz' | 'code' | 'presentation' | 'react';

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  type: LessonType;
  duration: string; // e.g. "10 min"
  content?: string | null; // Markdown or Video URL
  isFree: boolean; // Preview enabled?
  order: number;
  
  // User Context
  isCompleted?: boolean;
  score?: number | null; // For quizzes
}

// ==========================================
// COMMERCE & PROGRESS
// ==========================================

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progressPercent: number;
  isCompleted: boolean;
}

// ==========================================
// EXAMS & ASSESSMENT
// ==========================================

export type ExamStatus = 'locked' | 'pending' | 'passed' | 'failed';

export interface Exam {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  questionsCount: number;
  durationMinutes: number;
  passingScore: number;
  
  // User Context
  status: ExamStatus;
  lastScore?: number | null;
  isUnlocked: boolean; // Based on course completion
  cooldownHours?: number | null; // Hours remaining until next attempt allowed
}

export interface Question {
  id: string;
  text: string;
  points: number;
  type: 'single_choice' | 'multiple_choice' | 'code';
  options?: { id: string, text: string }[]; // JSON array of options if applicable
}

export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  score: number;
  passed: boolean;
  startedAt: string;
  completedAt?: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  providerId?: string; // Stripe ID
  createdAt: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt: string | null;
  score?: number | null;
}
