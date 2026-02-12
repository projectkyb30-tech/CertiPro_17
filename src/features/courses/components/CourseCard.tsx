import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Course } from '../../../types';
import { ROUTES } from '../../../routes/paths';
import { useUserStore } from '../../../store/useUserStore';
import { billingApi } from '../../billing/api/billingApi';
import { Terminal, Database, Globe, Lock, ArrowRight, Clock, BookOpen, ShieldCheck, Loader2 } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const getIcon = () => {
    switch (course.icon) {
      case 'python': return <Terminal className="w-6 h-6" />;
      case 'database': return <Database className="w-6 h-6" />;
      case 'network': return <Globe className="w-6 h-6" />;
      default: return <Terminal className="w-6 h-6" />;
    }
  };

  // Strictly using Blue, Gray, and Dark colors
  const getColor = () => {
    return 'text-primary bg-primary/10 border-primary/20';
  };

  const handleAction = async () => {
    // Handling Locked State
    if (course.isLocked) {
      if (!user) {
        alert('Te rugăm să te autentifici pentru a cumpăra cursul.');
        return;
      }

      setIsProcessing(true);

      // CASE 1: Processing State (User paid, but enrollment missing)
      if (course.isProcessing) {
        try {
           console.log('Syncing purchase for course:', course.id);
           const result = await billingApi.syncPurchase({
              courseId: course.id,
              userId: user.id
           });
           
           if (result.data.success) {
             alert('Contul a fost actualizat cu succes! Reîmprospătează pagina.');
             window.location.reload();
           } else {
             alert(result.data.message || 'Nu s-a putut verifica plata.');
           }
        } catch (error) {
           console.error('Sync error:', error);
           alert('Eroare la verificare. Încearcă din nou.');
        } finally {
          setIsProcessing(false);
        }
        return;
      }

      // CASE 2: New Purchase
      try {
        console.log('Initiating purchase for course:', course.id);
        const data = await billingApi.createCheckoutSession({
          courseId: course.id,
          userId: user.id,
          email: user.email,
        });

        if (data.url) {
          window.location.href = data.url;
        } else {
          alert('Inițiere eșuată');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Purchase error:', error);
        alert('Eroare de conexiune la serverul de plăți.');
        setIsProcessing(false);
      }
    } else {
      // For now, redirect to a generic lessons page or specific course page
      navigate(ROUTES.LESSONS);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`relative bg-white dark:bg-background-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg shadow-gray-100/50 dark:shadow-none transition-all duration-300 overflow-hidden`}
    >
      {/* Icon & Status */}
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${getColor()}`}>
          {getIcon()}
        </div>
        {course.isLocked && (
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400">
            <Lock className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {course.title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">
        {course.description}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" />
          <span>{course.totalLessons} Lecții</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{course.durationHours} ore</span>
        </div>
      </div>

      {/* Locked / Purchase UI */}
      {course.isLocked ? (
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Versiune Demo
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              €{course.price.toFixed(2)}
            </span>
          </div>
          <button 
            onClick={handleAction}
            disabled={isProcessing}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {course.isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifică Activarea
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Se procesează...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Deblochează Cursul Complet
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">Progres</span>
            <span className="font-bold text-primary">{course.progress}%</span>
          </div>
          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${course.progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <button 
            onClick={handleAction}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors"
          >
            Continuă <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default CourseCard;
