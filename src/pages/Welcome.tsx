import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/paths';
import { ChevronRight } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import CodeRain from '../shared/ui/CodeRain';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const fullText = 'CertiExpert';
  const [showButton, setShowButton] = useState(false);
  useThemeStore();

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) {
        clearInterval(interval);
        setTimeout(() => setShowButton(true), 500);
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden transition-colors duration-500">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-surface dark:bg-background-dark transition-colors duration-500" />
        
        {/* Code Rain Effect */}
        <div className="absolute inset-0 opacity-40 dark:opacity-60">
          <CodeRain />
        </div>

        {/* Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#0066FF 1px, transparent 1px), linear-gradient(90deg, #0066FF 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        {/* Soft Glow Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-primary/5 dark:bg-primary/10 blur-3xl rounded-full opacity-50 pointer-events-none" />
      </div>

      <div className="z-10 flex flex-col items-center gap-10 p-6">
        {/* Logo Typing Animation */}
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-bold font-mono tracking-tighter text-gray-900 dark:text-white">
              {text}
              <motion.span 
                animate={{ opacity: [0, 1, 0] }} 
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block ml-1 w-3 h-10 md:h-16 bg-primary align-middle"
              />
            </h1>
            {/* Glow effect behind text in dark mode */}
            <div className="absolute inset-0 bg-primary/20 blur-2xl -z-10 opacity-0 dark:opacity-100 transition-opacity duration-500" />
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium text-center max-w-md"
          >
            Platforma ta completă pentru certificări IT
          </motion.p>
        </motion.div>

        {/* Action Button */}
        <AnimatePresence>
          {showButton && (
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(ROUTES.ONBOARDING)}
              className="group flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40"
            >
              Start Journey
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer / Copyright */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 text-sm text-gray-400 dark:text-gray-600 font-mono"
      >
        © 2026 CertiExpert. All rights reserved.
      </motion.div>
    </div>
  );
};

export default Welcome;
