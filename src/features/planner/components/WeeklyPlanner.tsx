import React, { useState } from 'react';
import { usePlannerStore } from '../../../store/usePlannerStore';
import { PlannerEvent } from '../types';
import { CheckCircle2, Circle, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const WeeklyPlanner: React.FC<{ userId: string }> = ({ userId }) => {
  const { events, addEvent, updateEvent, deleteEvent } = usePlannerStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newEventInput, setNewEventInput] = useState<{ [key: string]: string }>({});

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const handlePrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const handleAddEvent = (dateStr: string) => {
    const title = newEventInput[dateStr];
    if (!title?.trim()) return;

    const newEvent: PlannerEvent = {
      id: crypto.randomUUID(),
      userId,
      title,
      date: dateStr,
      type: 'study',
      isCompleted: false
    };

    addEvent(newEvent);
    setNewEventInput(prev => ({ ...prev, [dateStr]: '' }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, dateStr: string) => {
    if (e.key === 'Enter') {
      handleAddEvent(dateStr);
    }
  };

  const getDayEvents = (dateStr: string) => {
    return events.filter(e => e.date === dateStr);
  };

  const dayNames = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'];

  return (
    <div className="bg-white dark:bg-[#1A1B1D] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📅 Planificator Săptămânal
        </h2>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrevWeek}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-medium text-gray-600 dark:text-gray-300">
            {startOfWeek.toLocaleDateString('ro-RO', { month: 'long', day: 'numeric' })} - {' '}
            {new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('ro-RO', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <button 
            onClick={handleNextWeek}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((date, index) => {
          const dateStr = formatDate(date);
          const isToday = formatDate(new Date()) === dateStr;
          const dayEvents = getDayEvents(dateStr);

          return (
            <div 
              key={dateStr}
              className={`flex flex-col h-full min-h-[300px] rounded-xl p-3 border transition-colors ${
                isToday 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800'
              }`}
            >
              <div className="text-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700/50">
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                  {dayNames[index]}
                </div>
                <div className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                  {date.getDate()}
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar mb-2">
                <AnimatePresence>
                  {dayEvents.map(event => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`group flex items-start gap-2 p-2 rounded-lg text-sm bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all ${
                        event.isCompleted ? 'opacity-50' : ''
                      }`}
                    >
                      <button
                        onClick={() => updateEvent(event.id, { isCompleted: !event.isCompleted })}
                        className={`mt-0.5 ${event.isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-primary'}`}
                      >
                        {event.isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      </button>
                      <span className={`flex-1 break-words ${event.isCompleted ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {event.title}
                      </span>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="relative mt-auto">
                <input
                  type="text"
                  placeholder="Adaugă..."
                  value={newEventInput[dateStr] || ''}
                  onChange={(e) => setNewEventInput(prev => ({ ...prev, [dateStr]: e.target.value }))}
                  onKeyDown={(e) => handleKeyDown(e, dateStr)}
                  className="w-full pl-3 pr-8 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  onClick={() => handleAddEvent(dateStr)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary-dark"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
