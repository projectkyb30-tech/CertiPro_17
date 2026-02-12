import React from 'react';
import { User, Mail, Phone, Calendar, Edit2, X, Save } from 'lucide-react';
import Input from '../../../shared/ui/Input';
import { UserProfile } from '../../../types';

interface PersonalInfoSectionProps {
  user: UserProfile;
  isEditing: boolean;
  isLoading: boolean;
  formData: {
    fullName: string;
    email: string;
    phone: string;
    birthDate: string;
    bio: string;
  };
  onEditToggle: (isEditing: boolean) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  user,
  isEditing,
  isLoading,
  formData,
  onEditToggle,
  onInputChange,
  onSave,
  onCancel
}) => {
  return (
    <div className="bg-white dark:bg-[#1A1B1D] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Date de Identificare</h3>
        {!isEditing ? (
          <button 
            onClick={() => onEditToggle(true)}
            className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors self-end sm:self-auto"
          >
            <Edit2 size={18} /> Editare
          </button>
        ) : (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={onCancel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors py-2 bg-gray-100 dark:bg-gray-800 rounded-lg sm:bg-transparent sm:dark:bg-transparent"
            >
              <X size={18} /> Anulează
            </button>
            <button 
              onClick={onSave}
              disabled={isLoading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-medium transition-colors shadow-lg shadow-primary/20 disabled:opacity-70"
            >
              {isLoading ? 'Salvare...' : <><Save size={18} /> Salvează</>}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          icon={User}
          label="Nume Complet"
          name="fullName"
          value={isEditing ? formData.fullName : (user.fullName || '')}
          onChange={onInputChange}
          disabled={!isEditing}
          placeholder="Ex: Popescu Ion"
        />
        <Input
          icon={Mail}
          label="Adresă Email"
          name="email"
          type="email"
          value={isEditing ? formData.email : user.email}
          onChange={onInputChange}
          disabled={!isEditing}
          placeholder="Ex: ion@exemplu.ro"
        />
        <Input
          icon={Phone}
          label="Număr Telefon"
          name="phone"
          type="tel"
          value={isEditing ? formData.phone : (user.phone || '-')}
          onChange={onInputChange}
          disabled={!isEditing}
          placeholder="Ex: 07xx xxx xxx"
        />
        <Input
          icon={Calendar}
          label="Data Nașterii"
          name="birthDate"
          type="date"
          value={isEditing ? formData.birthDate : (user.birthDate || '')}
          onChange={onInputChange}
          disabled={!isEditing}
        />
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Despre Mine (Bio)
        </label>
        <textarea
          name="bio"
          value={isEditing ? formData.bio : (user.bio || '')}
          onChange={onInputChange}
          disabled={!isEditing}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-background-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
          placeholder="Spune-ne câteva cuvinte despre tine..."
        />
      </div>
    </div>
  );
};

export default PersonalInfoSection;
