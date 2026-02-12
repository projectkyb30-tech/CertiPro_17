import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Input from '../shared/ui/Input';
import { ThemeToggle } from '../shared/ui/ThemeToggle';
import { SocialButton } from '../shared/ui/SocialButton';
import { ROUTES } from '../routes/paths';
import { authApi } from '../features/auth/api/authApi';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot-password'>('register');
  
  // Initialize state from sessionStorage if available (preserves state during theme toggle/refresh)
  const [showOtpInput, setShowOtpInput] = useState(() => {
    try {
      const saved = sessionStorage.getItem('auth_otp_state');
      if (saved) {
        const { showOtpInput } = JSON.parse(saved);
        return !!showOtpInput;
      }
    } catch (e) {
      console.error('Error parsing auth state', e);
    }
    return false;
  });

  const [formData, setFormData] = useState(() => {
    const initialState = {
      email: '',
      password: '',
      confirmPassword: '',
      otp: ''
    };
    try {
      const saved = sessionStorage.getItem('auth_otp_state');
      if (saved) {
        const { email } = JSON.parse(saved);
        return { ...initialState, email: email || '' };
      }
    } catch (e) {
      console.error('Error parsing auth state', e);
    }
    return initialState;
  });

  // Persist OTP state
  React.useEffect(() => {
    if (showOtpInput) {
      sessionStorage.setItem('auth_otp_state', JSON.stringify({
        email: formData.email,
        showOtpInput: true
      }));
    } else {
      sessionStorage.removeItem('auth_otp_state');
    }
  }, [showOtpInput, formData.email]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [resendTimer, setResendTimer] = useState(0);

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      await authApi.resendOtp(formData.email);
      setErrors({ success: 'Codul a fost retrimis! Verifică email-ul.' });
      setResendTimer(60);
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      let message = error instanceof Error ? error.message : 'Eroare la retrimiterea codului.';
      
      if (message.includes('security purposes') || message.includes('rate limit')) {
        message = 'Prea multe încercări. Așteaptă puțin înainte de a retrimite.';
      }
      
      setErrors({ form: message });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (showOtpInput) {
      if (!formData.otp.trim()) {
        newErrors.otp = 'Codul OTP este obligatoriu';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email-ul este obligatoriu';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email invalid';
    }

    if (activeTab === 'forgot-password') {
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (!formData.password) {
      newErrors.password = 'Parola este obligatorie';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Parola trebuie să aibă minim 8 caractere';
    } else if (activeTab === 'register') {
      // Strong password validation for registration
      if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Parola trebuie să conțină cel puțin o literă mare';
      }
      if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Parola trebuie să conțină cel puțin o cifră';
      }
    }

    if (activeTab === 'register') {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Parolele nu coincid';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      if (showOtpInput) {
        await authApi.verifyOtp(formData.email, formData.otp);
        sessionStorage.removeItem('auth_otp_state');
        // Force session check/update if needed, but usually verifyOtp sets the session
        navigate(ROUTES.COMPLETE_PROFILE);
        return;
      }

      if (activeTab === 'forgot-password') {
        await authApi.resetPasswordForEmail(formData.email);
        setErrors({ success: 'Ți-am trimis un email pentru resetarea parolei.' });
        setTimeout(() => {
          setActiveTab('login');
          setErrors({});
        }, 3000);
        return;
      }

      if (activeTab === 'register') {
        await authApi.register(formData.email, formData.password);
        
        // Check if we have an active session after registration
        const { data: { session } } = await import('../services/supabase').then(m => m.supabase.auth.getSession());
        
        if (session) {
          navigate(ROUTES.COMPLETE_PROFILE);
        } else {
          // No session means email verification is required
          setShowOtpInput(true);
          setErrors({ 
            success: 'Cont creat cu succes! Te rugăm să verifici email-ul și să introduci codul OTP primit.' 
          });
        }
      } else {
        await authApi.login(formData.email, formData.password);
        // Login successful - state update handles redirect via AppRoutes protection or we nav manually
        navigate(ROUTES.HOME);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let message = error instanceof Error ? error.message : 'A apărut o eroare la autentificare';
      
      // Show full technical error for debugging purposes if it's not a standard user error
      if (!message.includes('Invalid login credentials') && 
          !message.includes('User already registered') && 
          !message.includes('security purposes') && 
          !message.includes('rate limit')) {
        message = `Eroare tehnică: ${message}`;
      } else {
          // Translate common Supabase errors
          if (message.includes('Invalid login credentials')) {
            message = 'Email sau parolă incorectă.';
          } else if (message.includes('User already registered')) {
            message = 'Acest email este deja înregistrat.';
            setErrors({ 
              form: message,
              info: 'Se pare că ai deja cont. Te-am redirecționat la Login.' 
            });
            // Wait a moment so user sees the error, then switch
            setTimeout(() => {
              setActiveTab('login');
              setErrors({ success: 'Te rugăm să te autentifici.' });
            }, 1500);
            return;
          } else if (message.includes('security purposes')) {
            message = 'Prea multe încercări. Te rugăm să aștepți un minut înainte de a încerca din nou.';
          } else if (message.includes('rate limit')) {
            message = 'Prea multe cereri. Te rugăm să încerci mai târziu.';
          }
      }

      setErrors({ form: message });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = async () => {
    try {
      await authApi.loginWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      setErrors({ form: 'Eroare la autentificarea cu Google' });
    }
  };

  const handleAppleLogin = async () => {
    try {
      await authApi.loginWithApple();
    } catch (error) {
      console.error('Apple login error:', error);
      setErrors({ form: 'Eroare la autentificarea cu Apple' });
    }
  };

  const handleCancelOtp = () => {
    setShowOtpInput(false);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-background-dark flex flex-col items-center p-6 transition-colors duration-300">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-8 pt-4">
        <button 
          onClick={() => {
            if (showOtpInput) {
              handleCancelOtp();
            } else {
              navigate(-1);
            }
          }}
          className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={24} />
        </button>
        <span className="font-bold text-xl text-primary font-mono">CertiExpert</span>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Header Text */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {showOtpInput ? 'Verificare Email' : (
              activeTab === 'login' ? 'Bine ai revenit!' : 
              activeTab === 'register' ? 'Creează cont' : 'Resetare Parolă'
            )}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {showOtpInput 
              ? 'Introdu codul primit pe email. Dacă nu îl găsești, verifică și folderul Spam.'
              : (activeTab === 'login' 
                  ? 'Continuă pentru a accesa cursurile tale' 
                  : activeTab === 'register'
                    ? 'Înregistrează-te pentru a începe învățarea'
                    : 'Introdu adresa de email pentru a primi instrucțiuni')}
          </p>
        </div>

        {!showOtpInput && activeTab !== 'forgot-password' && (
          <>
            {/* Social Auth */}
            <div className="space-y-3">
              <SocialButton provider="google" onClick={handleGoogleLogin} />
              <SocialButton provider="apple" onClick={handleAppleLogin} />
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <span className="relative px-4 text-sm text-gray-500 bg-surface dark:bg-background-dark">
                sau continuă cu email
              </span>
            </div>

            {/* Tabs */}
            <div className="relative flex p-1 bg-gray-100 dark:bg-background-dark border border-transparent dark:border-gray-700 rounded-2xl">
              <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-gray-800 rounded-xl shadow-sm"
                animate={{ x: activeTab === 'login' ? 0 : '100%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 relative z-10 py-3 text-sm font-bold text-center transition-colors ${
                  activeTab === 'login' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 relative z-10 py-3 text-sm font-bold text-center transition-colors ${
                  activeTab === 'register' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Register
              </button>
            </div>
          </>
        )}

        {/* Form */}
        <div className="bg-white dark:bg-background-dark p-8 rounded-3xl shadow-xl shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <AnimatePresence mode="wait">
            <motion.form
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {errors.success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm text-center"
                >
                  {errors.success}
                </motion.div>
              )}

              {errors.form && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center"
                >
                  {errors.form}
                </motion.div>
              )}

              <div className="space-y-4">
                {showOtpInput ? (
                  <div className="space-y-4">
                    <Input
                      label="Cod OTP"
                      name="otp"
                      placeholder="Introdu codul din 6 cifre"
                      value={formData.otp}
                      onChange={handleChange}
                      required
                      autoFocus
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0}
                        className={`text-sm font-medium ${
                          resendTimer > 0 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-primary hover:text-primary-dark'
                        }`}
                      >
                        {resendTimer > 0 
                          ? `Retrimite codul în ${resendTimer}s` 
                          : 'Nu ai primit codul? Retrimite'}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelOtp}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        Anulează
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Input
                      label="Email"
                      type="email"
                      name="email"
                      placeholder="student@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />

                    {activeTab !== 'forgot-password' && (
                      <div className="space-y-2">
                        <Input
                          label="Parolă"
                          type="password"
                          name="password"
                          placeholder="••••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          error={errors.password}
                        />
                        {activeTab === 'login' && (
                          <div className="flex justify-end">
                            <button 
                              type="button" 
                              onClick={() => setActiveTab('forgot-password')}
                              className="text-sm text-primary hover:text-primary-dark font-medium"
                            >
                              Ai uitat parola?
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'register' && (
                      <Input
                        label="Confirmă Parola"
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        required
                      />
                    )}
                  </>
                )}
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 transition-all active:scale-95"
                >
                  {showOtpInput ? 'Verifică Codul' : (
                    activeTab === 'login' ? 'Intră în cont' : 
                    activeTab === 'register' ? 'Creează cont' : 'Resetează Parola'
                  )}
                </button>

                {activeTab === 'forgot-password' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="w-full py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium"
                  >
                    Înapoi la Autentificare
                  </button>
                )}
              </div>
            </motion.form>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Prin continuare, accepți{' '}
          <Link to={ROUTES.TERMS} className="text-primary hover:underline">Termenii și Condițiile</Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;
