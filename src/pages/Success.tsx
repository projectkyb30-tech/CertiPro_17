import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { ROUTES } from '../routes/paths';
import { useCourseStore } from '../store/useCourseStore';
import { billingApi } from '../features/billing/api/billingApi';
import { SkeletonSuccess } from '../shared/ui/Skeleton';

const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const { fetchCourses } = useCourseStore();
  const hasSession = !!sessionId;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    () => (hasSession ? 'loading' : 'error')
  );
  const [message, setMessage] = useState(
    () => (hasSession ? 'Se verifică plata...' : 'Sesiune invalidă.')
  );

  useEffect(() => {
    if (!sessionId) return;

    const verifyPayment = async () => {
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const result = await billingApi.verifyPayment(sessionId);

          if (result.ok && result.data.success) {
            setStatus('success');
            // Refresh courses multiple times to ensure UI sync
            fetchCourses({ force: true });
            setTimeout(() => fetchCourses({ force: true }), 1000);
            setTimeout(() => fetchCourses({ force: true }), 3000);
            return; 
          } else {
             // If specific error, maybe don't retry? 
             // But if network/server error, retry.
             if (attempts === maxAttempts - 1) {
                setStatus('error');
                setMessage(result.data.error || 'Verificarea a eșuat.');
             }
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          if (attempts === maxAttempts - 1) {
            setStatus('error');
            setMessage('Eroare de conexiune la server.');
          }
        }
        
        attempts++;
        if (attempts < maxAttempts) await new Promise(r => setTimeout(r, 1500));
      }
    };

    verifyPayment();
  }, [sessionId, fetchCourses]);

  return (
    <div className="min-h-screen bg-surface dark:bg-background-dark flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#1A1B1D] rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100 dark:border-gray-800"
      >
        {status === 'loading' && (
          <SkeletonSuccess />
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Plată Reușită!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Cursul a fost deblocat cu succes. Poți începe să înveți chiar acum.
            </p>
            <button
              onClick={() => navigate(ROUTES.HOME)}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
            >
              Mergi la Cursuri
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Ceva nu a mers bine
            </h2>
            <p className="text-red-500 mb-8">
              {message}
            </p>
            <button
              onClick={() => navigate(ROUTES.HOME)}
              className="w-full py-3 px-6 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Înapoi la Home
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Success;
