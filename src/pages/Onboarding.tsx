import React, { useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Terminal, 
  ArrowRight,
  ArrowLeft,
  Users,
  Target,
  Rocket,
  Hand
} from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { ROUTES } from '../routes/paths';

interface Slide {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Platforma Ta de Excelență în IT",
    description: "CertiPro este ecosistemul complet de învățare dedicat elevilor care aspiră la cariere de succes în tehnologie.",
    icon: GraduationCap,
    color: "text-primary",
    bgGradient: "from-blue-500/20 to-blue-600/5"
  },
  {
    id: 2,
    title: "Cine Suntem Noi?",
    description: "Suntem o echipă de experți și educatori pasionați, uniți de misiunea de a transforma educația tehnică într-o experiență interactivă și relevantă.",
    icon: Users,
    color: "text-violet-500",
    bgGradient: "from-violet-500/20 to-violet-600/5"
  },
  {
    id: 3,
    title: "Scopul Nostru",
    description: "Misiunea noastră este să te ajutăm să obții certificările internaționale Certiport și să îți asigurăm succesul la examenul de Bacalaureat.",
    icon: Target,
    color: "text-rose-500",
    bgGradient: "from-rose-500/20 to-rose-600/5"
  },
  {
    id: 4,
    title: "Ce Îți Oferim?",
    description: "Acces nelimitat la cursuri de Python, SQL și Networking, asistent AI personalizat 24/7 și simulări de examen în timp real.",
    icon: Terminal,
    color: "text-emerald-500",
    bgGradient: "from-emerald-500/20 to-emerald-600/5"
  },
  {
    id: 5,
    title: "Ești Gata să Începi?",
    description: "Alătură-te miilor de elevi care au ales deja performanța. Drumul tău spre o carieră în IT începe chiar aici.",
    icon: Rocket,
    color: "text-amber-500",
    bgGradient: "from-amber-500/20 to-amber-600/5"
  }
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setHasSeenOnboarding } = useUserStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const completeOnboarding = () => {
    setHasSeenOnboarding(true);
    navigate(ROUTES.AUTH);
  };

  const handleNext = () => {
    setDirection(1);
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrev = () => {
    setDirection(-1);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Swipe handlers
  const onDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  // Removed unused swipeDirection const


  return (
    <div className="min-h-screen bg-surface dark:bg-background-dark flex flex-col justify-between py-6 md:py-12 px-6 overflow-hidden transition-colors duration-300 relative">
      
      {/* Top Bar */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between mb-8 relative z-10">
        
        {/* Desktop Progress Bar */}
        <div className="hidden md:flex gap-2 flex-1 mr-4">
          {slides.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                idx <= currentIndex ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800'
              }`}
            />
          ))}
        </div>

        {/* Skip Button - Always visible, auto margin to push right if needed */}
        <button 
          onClick={completeOnboarding}
          className="ml-auto text-sm font-medium text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
        >
          Sari peste
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={onDragEnd}
            className="w-full text-center cursor-grab active:cursor-grabbing touch-pan-y"
          >
            {/* Icon Circle */}
            <div className="relative w-48 h-48 mx-auto mb-12 flex items-center justify-center pointer-events-none select-none">
              <div className={`absolute inset-0 bg-gradient-to-tr ${slides[currentIndex].bgGradient} rounded-full blur-3xl animate-pulse`} />
              <div className="relative bg-white dark:bg-[#1A1B1D] p-8 rounded-full shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800">
                {React.createElement(slides[currentIndex].icon, {
                  size: 64,
                  className: slides[currentIndex].color
                })}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 select-none">
              {slides[currentIndex].title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed select-none">
              {slides[currentIndex].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Mobile Swipe Hint Animation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="md:hidden absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        >
          <div className="relative w-12 h-12">
            <motion.div
              animate={{ x: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <Hand className="w-8 h-8 text-gray-300 dark:text-gray-600 rotate-12" />
            </motion.div>
          </div>
          <span className="text-xs text-gray-400 font-medium">Swipe</span>
        </motion.div>
      </div>

      {/* Desktop Footer Actions */}
      <div className="hidden md:flex w-full max-w-md mx-auto mt-12 items-center justify-between relative">
        <button 
          onClick={handlePrev}
          className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium transition-colors px-4 py-2 flex items-center gap-2 ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Înapoi
        </button>

        {/* Mobile Dots Indicator (Visible only on mobile bottom) */}
        <div className="md:hidden flex gap-2">
           {slides.map((_, idx) => (
            <div 
              key={idx}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-primary w-4' : 'bg-gray-200 dark:bg-gray-800'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="group flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95"
        >
          {currentIndex === slides.length - 1 ? 'Începe' : 'Continuă'}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      {/* Mobile Bottom Indicator (Dots only) */}
      <div className="md:hidden flex justify-center pb-8">
        <div className="flex gap-2">
           {slides.map((_, idx) => (
            <div 
              key={idx}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-primary w-6' : 'bg-gray-200 dark:bg-gray-800'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
