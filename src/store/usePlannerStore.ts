import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note, PlannerEvent } from '../features/planner/types';

interface PlannerState {
  notes: Note[];
  events: PlannerEvent[];
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addEvent: (event: PlannerEvent) => void;
  updateEvent: (id: string, updates: Partial<PlannerEvent>) => void;
  deleteEvent: (id: string) => void;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      notes: [],
      events: [],
      addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)),
      })),
      deleteNote: (id) => set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
      addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
      updateEvent: (id, updates) => set((state) => ({
        events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      })),
      deleteEvent: (id) => set((state) => ({ events: state.events.filter((e) => e.id !== id) })),
    }),
    {
      name: 'planner-storage',
    }
  )
);
