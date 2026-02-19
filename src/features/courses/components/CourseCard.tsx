import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Course } from '../../../types';
import { ROUTES } from '../../../routes/paths';
import { useUserStore } from '../../../store/useUserStore';
import { billingApi } from '../../billing/api/billingApi';
import { Terminal, Database, Globe, Lock, ArrowRight, Clock, BookOpen, ShieldCheck } from 'lucide-react';
import Card, { CardContent } from '../../../shared/ui/Card';
import Button from '../../../shared/ui/Button';
import LoadingDots from '../../../shared/ui/LoadingDots';

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
    <motion.div whileHover={{ y: -4 }} className="relative">
      <Card className="h-full p-6 shadow-lg shadow-gray-100/50 dark:shadow-none overflow-hidden">
        <CardContent className="p-0">
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl ${getColor()}`}>
              {getIcon()}
            </div>
            {course.isLocked && (
              <div className="p-2 bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] rounded-full text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                <Lock className="w-4 h-4" />
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] mb-2">
            {course.title}
          </h3>
          <p className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mb-6 line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center gap-4 mb-6 text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{course.totalLessons} Lecții</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{course.durationHours} ore</span>
            </div>
          </div>

          {course.isLocked ? (
            <div className="pt-4 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                  Versiune Demo
                </span>
                <span className="text-lg font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                  €{course.price.toFixed(2)}
                </span>
              </div>
              <Button
                onClick={handleAction}
                disabled={isProcessing}
                fullWidth
                size="lg"
              >
                {course.isProcessing ? (
                  <>
                    <LoadingDots />
                    Verifică Activarea
                  </>
                ) : isProcessing ? (
                  <>
                    <LoadingDots />
                    Se procesează...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Deblochează Cursul Complet
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                  Progres
                </span>
                <span className="font-bold text-primary">{course.progress}%</span>
              </div>
              <div className="h-2 w-full bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${course.progress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <Button
                onClick={handleAction}
                fullWidth
                size="md"
              >
                Continuă <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
