export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  courseId?: string; // Subject
  chapterId?: string; // Module/Chapter
  tags: string[]; // Tag IDs
  color?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlannerEvent {
  id: string;
  userId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  type: 'study' | 'exam' | 'deadline' | 'other';
  description?: string;
  isCompleted: boolean;
}

export interface NoteTag {
  id: string;
  label: string;
  color: string;
}

export const DEFAULT_TAGS: NoteTag[] = [
  { id: 'important', label: 'Important', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { id: 'review', label: 'De Revizuit', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { id: 'idea', label: 'Idee', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { id: 'question', label: 'Întrebare', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
];
