import React, { useState } from 'react';
import { usePlannerStore } from '../../../store/usePlannerStore';
import { Note, DEFAULT_TAGS } from '../types';
import { Trash2, Pin, Search, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotesListProps {
  courseId?: string;
  onEdit: (note: Note) => void;
}

export const NotesList: React.FC<NotesListProps> = ({ courseId, onEdit }) => {
  const { notes, deleteNote, updateNote } = usePlannerStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = notes
    .filter(note => {
      if (courseId && note.courseId !== courseId) return false;
      if (searchTerm && !note.title.toLowerCase().includes(searchTerm.toLowerCase()) && !note.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Sigur vrei să ștergi această notiță?')) {
      deleteNote(id);
    }
  };

  const handlePin = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    updateNote(note.id, { isPinned: !note.isPinned });
  };

  const getTagColor = (tagId: string) => {
    return DEFAULT_TAGS.find(t => t.id === tagId)?.color || 'bg-gray-100 text-gray-500';
  };

  const getTagName = (tagId: string) => {
    return DEFAULT_TAGS.find(t => t.id === tagId)?.label || tagId;
  };

  if (filteredNotes.length === 0 && !searchTerm) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="mb-4 text-6xl">📝</div>
        <p className="text-lg">Nu ai încă notițe.</p>
        <p className="text-sm">Începe să scrii pentru a-ți organiza ideile!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Caută în notițe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1A1B1D] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => onEdit(note)}
              className="group cursor-pointer bg-white dark:bg-[#1A1B1D] border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-lg transition-all relative overflow-hidden"
            >
              {note.isPinned && (
                <div className="absolute top-0 right-0 p-2 bg-yellow-500/10 text-yellow-600 rounded-bl-xl">
                  <Pin size={14} fill="currentColor" />
                </div>
              )}

              <h3 className="font-bold text-gray-900 dark:text-white mb-2 pr-8 line-clamp-1">
                {note.title}
              </h3>
              
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-3 h-15">
                {note.content || <span className="italic opacity-50">Fără conținut...</span>}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {note.tags.map(tagId => (
                  <span
                    key={tagId}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getTagColor(tagId)}`}
                  >
                    {getTagName(tagId)}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handlePin(e, note)}
                    className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${note.isPinned ? 'text-yellow-500' : 'text-gray-400'}`}
                    title={note.isPinned ? "Unpin" : "Pin"}
                  >
                    <Pin size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, note.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                    title="Șterge"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
