import React, { useRef, useState, useEffect } from 'react';
import { Award, FileText, ClipboardList, Calendar, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { examApi } from '../features/exams/api/examApi';
import { Exam } from '../types';
import { SkeletonExamCard } from '../shared/ui/Skeleton';

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/paths';

import { Planner } from '../features/planner/components/Planner';

const ExamCenter: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'finals' | 'chapters' | 'planner'>('finals');
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  
  const finalsLoadedRef = useRef(false);
  const tabs: { id: 'finals' | 'chapters' | 'planner'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'finals', label: 'Simulări Oficiale', icon: Award },
    { id: 'chapters', label: 'Teste pe Capitole', icon: FileText },
    { id: 'planner', label: 'Notițe & Plan', icon: Calendar }
  ];

  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoading(true);
        const data = await examApi.getExams();
        setExams(data);
      } catch (error) {
        console.error('Failed to load exams:', error);
      } finally {
        finalsLoadedRef.current = true;
        setLoading(false);
      }
    };

    if (activeTab === 'finals' && !finalsLoadedRef.current) {
      loadExams();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-primary" />
              Centrul de Examinare
            </h1>
            <p className="text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mt-1">
              Simulări oficiale, teste de verificare și planificare studiu.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] text-primary shadow-sm'
                  : 'text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] hover:text-[var(--color-foreground)] dark:hover:text-[var(--color-foreground-dark)]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          
          {/* 1. FINAL EXAMS TAB */}
          {activeTab === 'finals' && (
            loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <SkeletonExamCard key={i} />
                ))}
              </div>
            ) : exams.length === 0 ? (
              <div className="text-center text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] py-10">
                Nu există simulări oficiale încă.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map((exam) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative group bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border rounded-2xl p-6 transition-all hover:shadow-lg ${
                      exam.status === 'locked'
                        ? 'border-[var(--color-border)] dark:border-[var(--color-border-dark)] opacity-75'
                        : 'border-[var(--color-border)] dark:border-[var(--color-border-dark)]'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      exam.title.toLowerCase().includes('python') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                      exam.title.toLowerCase().includes('data') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                      'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                    }`}>
                      <Award className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] mb-2">
                      {exam.title}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mb-6">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {exam.durationMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {exam.questionsCount} întrebări
                      </span>
                    </div>

                    <button
                      disabled={exam.status === 'locked'}
                      onClick={() => navigate(`${ROUTES.EXAM_TAKE}/${exam.id}`)}
                      className={`w-full py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                        exam.status === 'locked'
                          ? 'bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] cursor-not-allowed'
                          : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white'
                      }`}
                    >
                      {exam.status === 'locked' ? (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          Blocat
                        </>
                      ) : (
                        <>
                          Start Simulare
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            )
          )}

          {/* 2. CHAPTER TESTS TAB (no data yet) */}
          {activeTab === 'chapters' && (
            <div className="text-center text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] py-10">
              Nu există teste pe capitole încă.
            </div>
          )}

          {/* 3. PLANNER & NOTES TAB */}
          {activeTab === 'planner' && (
            <Planner />
          )}

        </div>
      </div>
  );
};

export default ExamCenter;
