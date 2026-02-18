import React from 'react';
import { Shield, Key, Save } from 'lucide-react';
import Input from '../../../shared/ui/Input';

interface SecuritySectionProps {
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
  passwordData,
  isLoading,
  onInputChange,
  onSave
}) => {
  return (
    <div className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] p-8 rounded-3xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-8">
        <h3 className="text-xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">Schimbare Parolă</h3>
        <Shield className="text-primary h-6 w-6" />
      </div>

      <div className="space-y-6 max-w-lg">
        <Input
          icon={Key}
          label="Parola Curentă"
          name="currentPassword"
          type="password"
          value={passwordData.currentPassword}
          onChange={onInputChange}
          placeholder="••••••••"
        />
        <div className="pt-4 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
          <Input
            icon={Key}
            label="Parola Nouă"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={onInputChange}
            placeholder="Minim 8 caractere"
          />
        </div>
        <Input
          icon={Key}
          label="Confirmă Parola Nouă"
          name="confirmPassword"
          type="password"
          value={passwordData.confirmPassword}
          onChange={onInputChange}
          placeholder="Repetă parola nouă"
        />

        <div className="pt-4">
          <button 
            onClick={onSave}
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary-dark font-bold transition-colors shadow-lg shadow-primary/20 disabled:opacity-70"
          >
            {isLoading ? 'Se procesează...' : <><Save size={20} /> Actualizează Parola</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;
