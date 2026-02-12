import React, { useState, useEffect } from 'react';
import { usePlannerStore } from '../../../store/usePlannerStore';
import { useCourseStore } from '../../../store/useCourseStore';
import { Note, DEFAULT_TAGS } from '../types';
import { exportNoteToPDF } from '../utils/pdfExport';
import { Save, Tag, X, Clock, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface NoteEditorProps {
  note?: Note | null;
  onClose: () => void;
  userId: string;
  courseId?: string;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onClose, userId, courseId }) => {
  const { addNote, updateNote } = usePlannerStore();
  const { courses } = useCourseStore();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(note?.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const handleSave = React.useCallback((silent = false) => {
    if (!title.trim() && !content.trim()) return;

    setIsSaving(true);
    const now = new Date().toISOString();

    if (note) {
      updateNote(note.id, {
        title,
        content,
        tags: selectedTags,
        updatedAt: now
      });
    } else {
      const newNote: Note = {
        id: crypto.randomUUID(),
        userId,
        title: title || 'Notiță fără titlu',
        content,
        courseId,
        tags: selectedTags,
        isPinned: false,
        createdAt: now,
        updatedAt: now
      };
      addNote(newNote);
      if (!silent) onClose();
    }
    
    setLastSaved(new Date().toLocaleTimeString());
    setTimeout(() => setIsSaving(false), 500);
  }, [title, content, selectedTags, note, updateNote, addNote, userId, courseId, onClose]);

  // Auto-save debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only auto-save if we have an existing note (edit mode)
      // For new notes, we wait for explicit save to create the ID
      if (note && (title !== note.title || content !== note.content)) {
        handleSave(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, content, note, handleSave]);

  const handleExportPDF = () => {
    const noteToExport = note || {
      id: 'temp',
      userId,
      title: title || 'Notiță fără titlu',
      content,
      tags: selectedTags,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const courseTitle = courses.find(c => c.id === (note?.courseId || courseId))?.title;
    exportNoteToPDF(noteToExport, courseTitle);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId) 
        : [...prev, tagId]
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white dark:bg-[#1A1B1D] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl h-[80vh] flex flex-col"
    >
      <div className="flex justify-between items-start mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titlu notiță..."
          className="text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 w-full text-gray-900 dark:text-white placeholder-gray-400"
        />
        <div className="flex items-center gap-2">
           <button
            onClick={handleExportPDF}
            className="p-2 text-gray-400 hover:text-primary transition-colors"
            title="Export PDF"
          >
            <Download size={20} />
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <Tag size={16} className="text-gray-400 flex-shrink-0" />
        {DEFAULT_TAGS.map(tag => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              selectedTags.includes(tag.id)
                ? tag.color + ' ring-2 ring-offset-1 ring-offset-white dark:ring-offset-[#1A1B1D] ring-gray-200'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Scrie notițele tale aici..."
        className="flex-1 w-full resize-none bg-transparent border-none focus:ring-0 p-0 text-gray-700 dark:text-gray-300 leading-relaxed text-lg"
      />

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          {lastSaved && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              Salvat la {lastSaved}
            </span>
          )}
          {isSaving && <span className="text-primary animate-pulse">Se salvează...</span>}
        </div>

        <button
          onClick={() => handleSave(false)}
          className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all active:scale-95"
        >
          <Save size={18} />
          Salvează
        </button>
      </div>
    </motion.div>
  );
};
