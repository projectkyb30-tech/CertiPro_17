import { useState, useEffect } from 'react';
import { useCourseStore } from '../../../store/useCourseStore';
import { useUserStore } from '../../../store/useUserStore';
import { WeeklyPlanner } from './WeeklyPlanner';
import { NotesList } from './NotesList';
import { NoteEditor } from './NoteEditor';
import { Note } from '../types';
import { BookOpen, Layout, Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export const Planner = () => {
  const { courses, fetchCourses } = useCourseStore();
  const { user, isLoading } = useUserStore();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingNote(null);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!user) {
    return <div className="text-center py-10 text-gray-500">Te rugăm să te autentifici pentru a accesa planificatorul.</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Sidebar - Subjects */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
        <div className="bg-white dark:bg-[#1A1B1D] rounded-2xl p-4 border border-gray-200 dark:border-gray-800 sticky top-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            Materii
          </h3>
          
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCourseId(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCourseId === null
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Toate Notițele
            </button>
            
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors truncate ${
                  selectedCourseId === course.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {course.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <WeeklyPlanner userId={user.id} />

        <div className="bg-white dark:bg-[#1A1B1D] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layout size={20} className="text-primary" />
              {selectedCourseId 
                ? `Notițe - ${courses.find(c => c.id === selectedCourseId)?.title}` 
                : 'Toate Notițele'}
            </h2>
            
            <button
              onClick={handleCreateNote}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/30 transition-all active:scale-95"
            >
              <Plus size={18} />
              Notiță Nouă
            </button>
          </div>

          <NotesList 
            courseId={selectedCourseId || undefined} 
            onEdit={handleEditNote} 
          />
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl">
              <NoteEditor 
                note={editingNote} 
                onClose={handleCloseEditor}
                userId={user.id}
                courseId={selectedCourseId || undefined}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
