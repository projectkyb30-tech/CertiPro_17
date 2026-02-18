import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { User, CheckCircle, AlertCircle } from 'lucide-react';
import Skeleton from '../shared/ui/Skeleton';

// Components
import ProfileHeader from '../features/profile/components/ProfileHeader';
import PersonalInfoSection from '../features/profile/components/PersonalInfoSection';
import SecuritySection from '../features/profile/components/SecuritySection';

const Profile: React.FC = () => {
  const { user, updateProfile, regenerateAvatar, isLoading: isUserLoading } = useUserStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'security' ? 'security' : 'personal';
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For saving state
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthDate: user?.birthDate || '',
    bio: user?.bio || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!user && !isUserLoading) return null;

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleTabChange = (tab: 'personal' | 'security') => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock upload - create object URL
      const imageUrl = URL.createObjectURL(file);
      updateProfile({ avatarUrl: imageUrl });
      setMessage({ type: 'success', text: 'Fotografia de profil a fost actualizată!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const savePersonalInfo = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      updateProfile(formData);
      setIsEditing(false);
      setIsLoading(false);
      setMessage({ type: 'success', text: 'Datele personale au fost salvate cu succes!' });
      setTimeout(() => setMessage(null), 3000);
    }, 1000);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (!user) return;
    setFormData({
      fullName: user.fullName || '',
      email: user.email,
      phone: user.phone || '',
      birthDate: user.birthDate || '',
      bio: user.bio || ''
    });
  };

  const savePassword = () => {
    setMessage(null);
    
    // Basic Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Toate câmpurile sunt obligatorii.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Parolele noi nu coincid.' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Noua parolă trebuie să aibă cel puțin 8 caractere.' });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Parola a fost schimbată cu succes!' });
      setTimeout(() => setMessage(null), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] flex items-center gap-3">
              <User className="text-primary h-8 w-8" />
              Profilul Meu
            </h1>
            <p className="text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mt-2">
              Gestionează datele personale și securitatea contului tău.
            </p>
          </div>
        </div>

        {/* Feedback Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span className="font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {isUserLoading ? (
              <div className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] rounded-2xl p-6 border border-[var(--color-border)] dark:border-[var(--color-border-dark)] flex flex-col items-center">
                <Skeleton variant="circular" width={128} height={128} className="mb-4" />
                <Skeleton variant="text" width={180} height={28} className="mb-2" />
                <Skeleton variant="text" width={220} height={20} className="mb-6" />
                <div className="w-full space-y-3">
                  <Skeleton variant="rounded" width="100%" height={40} />
                  <Skeleton variant="rounded" width="100%" height={40} />
                </div>
              </div>
            ) : (
              <ProfileHeader 
                user={user!}
                fileInputRef={fileInputRef}
                onAvatarClick={handleAvatarClick}
                onFileChange={handleFileChange}
                onRegenerateAvatar={regenerateAvatar}
              />
            )}
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs */}
            <div className="flex p-1 bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
              {isUserLoading ? (
                <>
                  <Skeleton variant="rounded" className="flex-1 h-10 mx-1" />
                  <Skeleton variant="rounded" className="flex-1 h-10 mx-1" />
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleTabChange('personal')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                      activeTab === 'personal'
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] hover:text-[var(--color-foreground)] dark:hover:text-[var(--color-foreground-dark)] hover:bg-[var(--color-card)] dark:hover:bg-[var(--color-card-dark)]'
                    }`}
                  >
                    Date Personale
                  </button>
                  <button
                    onClick={() => handleTabChange('security')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                      activeTab === 'security'
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] hover:text-[var(--color-foreground)] dark:hover:text-[var(--color-foreground-dark)] hover:bg-[var(--color-card)] dark:hover:bg-[var(--color-card-dark)]'
                    }`}
                  >
                    Securitate
                  </button>
                </>
              )}
            </div>

            {/* Content Area */}
            {isUserLoading ? (
              <div className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] rounded-2xl p-6 border border-[var(--color-border)] dark:border-[var(--color-border-dark)] space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <Skeleton variant="text" width={100} height={20} />
                     <Skeleton variant="rounded" width="100%" height={48} />
                   </div>
                   <div className="space-y-2">
                     <Skeleton variant="text" width={100} height={20} />
                     <Skeleton variant="rounded" width="100%" height={48} />
                   </div>
                   <div className="space-y-2">
                     <Skeleton variant="text" width={100} height={20} />
                     <Skeleton variant="rounded" width="100%" height={48} />
                   </div>
                   <div className="space-y-2">
                     <Skeleton variant="text" width={100} height={20} />
                     <Skeleton variant="rounded" width="100%" height={48} />
                   </div>
                </div>
                <div className="space-y-2">
                   <Skeleton variant="text" width={100} height={20} />
                   <Skeleton variant="rounded" width="100%" height={100} />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                   <Skeleton variant="rounded" width={100} height={40} />
                   <Skeleton variant="rounded" width={120} height={40} />
                </div>
              </div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'personal' ? (
                  <PersonalInfoSection 
                    user={user!}
                    formData={formData}
                    isEditing={isEditing}
                    isLoading={isLoading}
                    onInputChange={handleInputChange}
                    onEditToggle={setIsEditing}
                    onSave={savePersonalInfo}
                    onCancel={cancelEdit}
                  />
                ) : (
                  <SecuritySection 
                    passwordData={passwordData}
                    isLoading={isLoading}
                    onInputChange={handlePasswordChange}
                    onSave={savePassword}
                  />
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
  );
};

export default Profile;
