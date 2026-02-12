import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '../../store/useThemeStore';

const CodeRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useThemeStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Handle HiDPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>[]{}/*-+=@#$%^&';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = new Array(columns).fill(1);

    // Throttling frame rate to ~30fps for performance style "Matrix"
    let lastTime = 0;
    const fps = 30;
    const interval = 1000 / fps;

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      const deltaTime = currentTime - lastTime;
      if (deltaTime < interval) return;

      lastTime = currentTime - (deltaTime % interval);

      // Fade effect based on theme
      // Dark mode: fade with dark color (creates trails)
      // Light mode: fade with light color
      if (theme === 'dark') {
        ctx.fillStyle = 'rgba(26, 27, 29, 0.1)'; // #1A1B1D with opacity
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; // White with opacity
      }
      
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "JetBrains Mono"`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Color logic
        const isBright = Math.random() > 0.95;
        
        if (theme === 'dark') {
          if (isBright) {
            ctx.fillStyle = '#3385FF'; // Light blue
          } else {
            ctx.fillStyle = '#0066FF'; // Primary blue
          }
        } else {
           // In light mode, use darker blues for contrast
          if (isBright) {
            ctx.fillStyle = '#0052CC'; // Darker blue
          } else {
            ctx.fillStyle = '#0066FF'; // Primary blue
          }
        }
        
        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]); // Re-run when theme changes

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default CodeRain;
