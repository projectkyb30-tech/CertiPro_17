import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Timer } from 'lucide-react';
import { ROUTES } from '../routes/paths';

const OTPVerification: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(119); // 1:59

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length === 4) {
      navigate(ROUTES.AUTH);
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-background-dark flex flex-col items-center p-6 transition-colors duration-300">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-12 pt-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-600 hover:text-primary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={24} />
        </button>
        <span className="font-bold text-xl text-primary font-mono">Verificare</span>
        <div className="w-8" />
      </div>

      <div className="w-full max-w-md flex flex-col items-center space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Introdu Codul</h1>
          <p className="text-gray-500">
            Am trimis un cod de 4 cifre la<br />
            <span className="text-gray-900 dark:text-gray-300 font-medium">student@example.com</span>
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex gap-4 my-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-16 h-16 md:w-20 md:h-20 text-center text-3xl font-bold rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-gray-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all caret-primary"
            />
          ))}
        </div>

        {/* Timer & Resend */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-primary font-mono text-lg bg-primary/5 px-4 py-2 rounded-full">
            <Timer size={20} />
            <span>{formatTime(timeLeft)}</span>
          </div>
          
          <button 
            disabled={timeLeft > 0}
            className={`text-sm font-medium transition-colors ${
              timeLeft > 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-primary hover:text-primary-dark'
            }`}
          >
            Retrimite Codul
          </button>
        </div>

        <button
          onClick={handleVerify}
          disabled={otp.some(d => !d)}
          className="w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 transition-all active:scale-95 mt-8"
        >
          Verifică
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;
