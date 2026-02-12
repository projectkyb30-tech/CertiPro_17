import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Maximize2, Minimize2 } from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  content: string;
  image?: string;
  code?: string;
}

interface SlideDeckProps {
  configUrl?: string; // URL to fetch JSON config
  data?: { slides: Slide[] }; // Direct data injection
}

export const SlideDeck: React.FC<SlideDeckProps> = ({ configUrl, data }) => {
  const [slides, setSlides] = useState<Slide[]>(data?.slides || []);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(!!configUrl && !data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (configUrl && !data) {
      fetch(configUrl)
        .then(res => res.json())
        .then(jsonData => {
          if (jsonData.slides) {
            setSlides(jsonData.slides);
          } else {
            setError("Invalid slide format");
          }
        })
        .catch(() => setError("Failed to load slides"))
        .finally(() => setLoading(false));
    }
  }, [configUrl, data]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(prev => prev + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading presentation...</div>;
  if (error) return <div className="p-12 text-center text-red-500">{error}</div>;
  if (slides.length === 0) return <div className="p-12 text-center text-gray-500">No slides available</div>;

  const slide = slides[currentSlide];

  return (
    <div className={`relative bg-white dark:bg-[#1a1b1d] rounded-xl overflow-hidden shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-video'}`}>
      
      {/* Header / Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent text-white">
        <div className="text-sm font-medium opacity-80">
          Slide {currentSlide + 1} / {slides.length}
        </div>
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* Slide Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-16 text-center">
        <div className="max-w-4xl w-full animate-fadeIn">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
            {slide.title}
          </h2>
          
          {slide.image && (
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="max-h-[300px] mx-auto rounded-lg shadow-lg mb-8 object-contain"
            />
          )}
          
          <div className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {slide.content}
          </div>

          {slide.code && (
            <div className="mt-8 bg-gray-900 rounded-lg p-4 text-left overflow-x-auto max-w-2xl mx-auto shadow-inner">
              <pre className="text-sm font-mono text-green-400">
                {slide.code}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-t from-black/50 to-transparent">
        <button 
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white disabled:opacity-30 transition-all"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} 
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white disabled:opacity-30 transition-all"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};
