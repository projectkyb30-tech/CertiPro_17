import React from 'react';

interface SocialButtonProps {
  provider: 'google' | 'apple';
  onClick?: () => void;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ provider, onClick }) => {
  const isGoogle = provider === 'google';
  
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 px-3 py-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-sm hover:bg-[var(--color-surface)] transition-all active:scale-[0.98] group"
      style={{ boxShadow: '0 1px 2px 0 rgba(15, 23, 42, 0.05)' }}
    >
      {isGoogle ? (
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="var(--color-google-blue)"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="var(--color-google-green)"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="var(--color-google-yellow)"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="var(--color-google-red)"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24.02-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.06 2.77.83 3.55 1.95-3.13 1.84-2.58 5.76.62 7.06-.57 1.55-1.32 2.95-2.76 4.02zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
      )}
      <span className="text-[var(--color-foreground)] font-medium text-[15px] leading-5 tracking-tight font-sans">
        Continuă cu {isGoogle ? 'Google' : 'Apple'}
      </span>
    </button>
  );
};
