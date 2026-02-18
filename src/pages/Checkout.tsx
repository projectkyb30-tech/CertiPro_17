import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseStore } from '../store/useCourseStore';
import { useUserStore } from '../store/useUserStore';
import { ROUTES } from '../routes/paths';
import { billingApi } from '../features/billing/api/billingApi';
import { motion } from 'framer-motion';
import { ShieldCheck, Check, Lock, ArrowLeft, CreditCard } from 'lucide-react';
import { SkeletonCheckout } from '../shared/ui/Skeleton';

const Checkout: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { getCourse, isLoading } = useCourseStore();
  const { user } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step] = useState<'summary' | 'success'>('summary'); // Removed 'payment' step

  const course = getCourse(courseId || '');

  if (isLoading) {
    return <SkeletonCheckout />;
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] dark:bg-[var(--color-background-dark)] text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Cursul nu a fost găsit</h1>
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="text-primary hover:underline"
          >
            Înapoi la Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handlePurchase = async () => {
    if (!user || !courseId) {
      console.error('Missing user or courseId');
      return;
    }

    setIsProcessing(true);

    try {
      const data = await billingApi.createCheckoutSession({
        courseId,
        userId: user.id,
        email: user.email,
      });

      if (data.url) {
        // Redirect to Stripe Hosted Page
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
      
    } catch (error) {
      console.error('Purchase failed:', error);
      setIsProcessing(false);
      const message = error instanceof Error ? error.message : 'Eroare la procesarea plății. Te rugăm să încerci din nou.';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] dark:bg-[var(--color-background-dark)] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(ROUTES.HOME)}
          className="flex items-center gap-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] dark:text-[var(--color-muted-foreground-dark)] dark:hover:text-[var(--color-foreground-dark)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Înapoi la Cursuri
        </button>

        <div className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] px-8 py-6 border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <span className="text-sm font-bold text-primary uppercase tracking-wider">Secured Checkout</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              Deblocare Curs Complet
            </h1>
          </div>

          <div className="p-8">
            {step !== 'success' ? (
              <div className="grid md:grid-cols-2 gap-12">
                {/* Order Summary */}
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] mb-4">Sumar Comandă</h2>
                  
                  <div className="flex items-start gap-4 p-4 bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] rounded-2xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
                    <div className="p-3 bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] rounded-xl shadow-sm">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">{course.title}</h3>
                      <p className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mt-1">Acces complet pe viață</p>
                      <p className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">{course.totalLessons} lecții • {course.durationHours} ore</p>
                    </div>
                  </div>

                  <div className="border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)] pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                      <span>Preț Curs</span>
                      <span>€{course.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                      <span>Reducere Demo</span>
                      <span className="text-green-500">-€0.00</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] pt-2">
                      <span>Total</span>
                      <span>€{course.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Secure Payment Call to Action */}
                <div className="flex flex-col justify-center space-y-6">
                  <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl border border-primary/10">
                     <h3 className="font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] mb-2 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary"/>
                        Plată Securizată
                     </h3>
                     <p className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mb-4">
                        Vei fi redirecționat către Stripe pentru a finaliza plata în siguranță. Nu stocăm datele cardului tău.
                     </p>

                     {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                     )}
                     
                     <button 
                        onClick={handlePurchase}
                        disabled={isProcessing}
                        className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            Plătește €{course.price.toFixed(2)}
                          </>
                        )}
                      </button>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 opacity-50 grayscale">
                    {/* Simple icons representation or text */}
                    <span className="text-xs font-bold">VISA</span>
                    <span className="text-xs font-bold">Mastercard</span>
                    <span className="text-xs font-bold">Amex</span>
                  </div>
                </div>
              </div>
            ) : (
              // Success State
              <div className="text-center py-12">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-12 h-12 text-green-500" />
                </motion.div>
                
                <h2 className="text-3xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] mb-4">
                  Plată Confirmată!
                </h2>
                <p className="text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mb-8 max-w-md mx-auto">
                  Felicitări! Ai deblocat accesul complet la cursul <strong>{course.title}</strong>. Poți începe să înveți chiar acum.
                </p>
                
                <button 
                  onClick={() => navigate(ROUTES.HOME)}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-colors"
                >
                  Începe Cursul
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
