import React from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { UserProfile } from '../../../types';

interface ProfileHeaderProps {
  user: UserProfile;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onAvatarClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRegenerateAvatar: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  fileInputRef,
  onAvatarClick,
  onFileChange,
  onRegenerateAvatar
}) => {
  return (
    <div className="bg-white dark:bg-[#1A1B1D] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
      
      <div className="relative mb-6 group">
        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-[#1A1B1D] shadow-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img 
            src={user.avatarUrl || undefined} 
            alt={user.fullName || 'User Avatar'}
            className="w-full h-full object-cover"
          />
        </div>
        <button 
          onClick={onAvatarClick}
          className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors z-10"
          title="Încarcă poză"
        >
          <Camera size={18} />
        </button>
        <button 
          onClick={onRegenerateAvatar}
          className="absolute bottom-0 left-0 p-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors z-10"
          title="Generează avatar nou"
        >
          <RefreshCw size={18} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {user.fullName || 'User'}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">
        Student • Level {Math.floor(user.xp / 1000) + 1}
      </p>

      <div className="w-full grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.streak}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Streak Zile</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.xp}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total XP</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
