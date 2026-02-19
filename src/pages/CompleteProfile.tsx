import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, ChevronDown, ArrowRight, ArrowLeft, Check, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Input from '../shared/ui/Input';
import { useUserStore } from '../store/useUserStore';
import { ROUTES } from '../routes/paths';
import { COUNTRY_CODES, detectCountry } from '../shared/data/countries';
import { UserProfile } from '../types';
import LoadingDots from '../shared/ui/LoadingDots';

type CountryCode = (typeof COUNTRY_CODES)[number];

const buildDateParts = (birthDate?: string | null) => {
  if (!birthDate) {
    return { day: '', month: '', year: '' };
  }
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return { day: '', month: '', year: '' };
  }
  return {
    year: parseInt(match[1], 10).toString(),
    month: parseInt(match[2], 10).toString(),
    day: parseInt(match[3], 10).toString()
  };
};

const buildFormData = (user: UserProfile | null, detected: CountryCode) => {
  let phoneBody = user?.phone || '';
  if (phoneBody.startsWith(detected.dialCode)) {
    phoneBody = phoneBody.replace(detected.dialCode, '').trim();
  }
  return {
    fullName: user?.fullName || '',
    phoneBody,
    bio: user?.bio || ''
  };
};

const CompleteProfileContent: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile, regenerateAvatar } = useUserStore();
  
  // Steps: 1=Name, 2=Phone, 3=BirthDate, 4=Bio, 5=Avatar, 6=Success
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      position: 'absolute' as const // Absolute position for overlap
    }),
    center: {
      x: 0,
      opacity: 1,
      position: 'relative' as const,
      zIndex: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      position: 'absolute' as const,
      zIndex: 0
    })
  };
  const [error, setError] = useState<string | null>(null);

  // Date Selector State
  const currentYear = new Date().getFullYear();
  const detectedCountry = detectCountry();
  const [dateParts, setDateParts] = useState(() => buildDateParts(user?.birthDate));

  // Country Selector State
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(detectedCountry);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [formData, setFormData] = useState(() => buildFormData(user, detectedCountry));

  // Validation & Navigation
  const handleNext = () => {
    setError(null);
    setDirection(1);
    
    if (step === 1) {
      if (!formData.fullName.trim()) {
        setError(t('profile_wizard.step1.error_required'));
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.phoneBody || formData.phoneBody.length < 4) {
        setError(t('profile_wizard.step2.error_short'));
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!dateParts.day || !dateParts.month || !dateParts.year) {
        setError(t('profile_wizard.step3.error_required'));
        return;
      }
      setStep(4);
    } else if (step === 4) {
      // Bio is optional
      setStep(5);
    }
  };

  const handlePrev = () => {
    setError(null);
    setDirection(-1);
    if (step > 1) setStep(step - 1);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const fullPhone = `${selectedCountry.dialCode}${formData.phoneBody.replace(/\D/g, '')}`;
    const birthDate = `${dateParts.year}-${dateParts.month.padStart(2, '0')}-${dateParts.day.padStart(2, '0')}`;
    
    try {
      console.log('Saving profile...', { fullName: formData.fullName, phone: fullPhone, birthDate });

      // Create a timeout promise to prevent infinite hanging (extended for slower networks)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out. Please check your connection.')), 45000)
      );

      // Save all profile data including current avatarUrl from store
      await Promise.race([
        updateProfile({
          fullName: formData.fullName,
          phone: fullPhone,
          bio: formData.bio,
          birthDate: birthDate,
          avatarUrl: user?.avatarUrl // Persist the currently selected/generated avatar
        }),
        timeoutPromise
      ]);
      
      console.log('Profile saved successfully');
      
      // Move to success step
      setStep(6);
      
      // Redirect after animation
      setTimeout(() => {
        navigate(ROUTES.HOME, { replace: true });
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      const message = error instanceof Error ? error.message : 'A apărut o eroare. Încearcă din nou.';
      setError(message);
      setLoading(false);
    }
  };

  // Helpers
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ];
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 14 - i);

  return (
    <div className="min-h-screen bg-surface dark:bg-background-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((step - 1) / 5) * 100}%` }}
        />
      </div>

      <div className="w-full max-w-md relative">
        <AnimatePresence initial={false} custom={direction}>
          
          {/* STEP 1: NAME */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('profile_wizard.step1.title')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('profile_wizard.step1.subtitle')}
                </p>
              </div>

              <div className="bg-white dark:bg-[#1A1B1D] p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                <Input
                  icon={User}
                  type="text"
                  placeholder={t('profile_wizard.step1.placeholder')}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  label={t('profile_wizard.step1.label')}
                  autoFocus
                />
                
                {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}

                <button
                  onClick={handleNext}
                  className="w-full mt-6 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {t('profile_wizard.nav.next')} <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PHONE */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('profile_wizard.step2.title')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('profile_wizard.step2.subtitle')}
                </p>
              </div>

              <div className="bg-white dark:bg-[#1A1B1D] p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-6">
                 <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('profile_wizard.step2.label')}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="h-[50px] px-3 flex items-center gap-2 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary transition-colors min-w-[100px]"
                        >
                          <span className="text-xl">{selectedCountry.flag}</span>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {selectedCountry.dialCode}
                          </span>
                          <ChevronDown size={16} className="text-gray-400" />
                        </button>

                        {showCountryDropdown && (
                          <div className="absolute top-full left-0 mt-2 w-64 max-h-60 overflow-y-auto bg-white dark:bg-[#1A1B1D] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50">
                            {COUNTRY_CODES.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(country);
                                  setShowCountryDropdown(false);
                                }}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                              >
                                <span className="text-xl">{country.flag}</span>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {country.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {country.dialCode}
                                    </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                         <Input
                            type="tel"
                            placeholder="7xx xxx xxx"
                            value={formData.phoneBody}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setFormData({ ...formData, phoneBody: val });
                            }}
                            autoFocus
                            fullWidth={true}
                            icon={Phone}
                            className="h-[50px]" 
                         />
                      </div>
                    </div>
                  </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handlePrev}
                    className="px-6 py-4 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    {t('profile_wizard.nav.back')}
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {t('profile_wizard.nav.next')} <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: BIRTHDATE */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('profile_wizard.step3.title')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('profile_wizard.step3.subtitle')}
                </p>
              </div>

              <div className="bg-white dark:bg-[#1A1B1D] p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('profile_wizard.step3.label')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={dateParts.day}
                      onChange={(e) => setDateParts({ ...dateParts, day: e.target.value })}
                      className="px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-background-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none text-center"
                    >
                      <option value="">{t('profile_wizard.step3.day')}</option>
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <select
                      value={dateParts.month}
                      onChange={(e) => setDateParts({ ...dateParts, month: e.target.value })}
                      className="px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-background-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none text-center"
                    >
                      <option value="">{t('profile_wizard.step3.month')}</option>
                      {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>

                    <select
                      value={dateParts.year}
                      onChange={(e) => setDateParts({ ...dateParts, year: e.target.value })}
                      className="px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-background-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none text-center"
                    >
                      <option value="">{t('profile_wizard.step3.year')}</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handlePrev}
                    className="px-6 py-4 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    {t('profile_wizard.nav.back')}
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {t('profile_wizard.nav.next')} <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: BIO */}
          {step === 4 && (
            <motion.div
              key="step4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('profile_wizard.step4.title')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('profile_wizard.step4.subtitle')}
                </p>
              </div>

              <div className="bg-white dark:bg-[#1A1B1D] p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-6">
                <textarea
                  placeholder={t('profile_wizard.step4.placeholder')}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full h-32 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-background-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none resize-none"
                  autoFocus
                />
                
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="flex gap-3 pt-2">
                   <button
                    onClick={handlePrev}
                    className="px-4 py-4 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setDirection(1);
                      setStep(5);
                    }}
                    className="px-6 py-4 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium whitespace-nowrap"
                  >
                    {t('profile_wizard.step4.skip')}
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {t('profile_wizard.nav.next')} <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: AVATAR */}
          {step === 5 && (
            <motion.div
              key="step5"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('profile_wizard.step5.title')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('profile_wizard.step5.subtitle')}
                </p>
              </div>

              <div className="bg-white dark:bg-[#1A1B1D] p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center space-y-8">
                
                {/* Avatar Display */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-gray-50 dark:bg-gray-800 shadow-lg">
                    {user?.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User size={48} />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={regenerateAvatar}
                    className="absolute bottom-0 right-0 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-transform hover:scale-110 active:scale-95"
                    title={t('profile_wizard.step5.regenerate')}
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="flex gap-3 w-full pt-2">
                   <button
                    onClick={handlePrev}
                    className="px-4 py-4 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <LoadingDots /> : t('profile_wizard.step5.confirm')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: SUCCESS */}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 rounded-full" />
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center relative">
                   <motion.div
                     initial={{ pathLength: 0, opacity: 0 }}
                     animate={{ pathLength: 1, opacity: 1 }}
                     transition={{ duration: 0.5, delay: 0.2 }}
                   >
                     <Check className="w-12 h-12 text-green-500" strokeWidth={3} />
                   </motion.div>
                </div>
              </div>
              
              <h2 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">
                {t('profile_wizard.step6.title')}
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {t('profile_wizard.step6.subtitle')}
              </p>
              
              <motion.div 
                className="mt-8 w-48 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden"
              >
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5 }}
                />
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

const CompleteProfile: React.FC = () => {
  const { user } = useUserStore();
  const userKey = user?.id ?? 'guest';
  return <CompleteProfileContent key={userKey} />;
};

export default CompleteProfile;
