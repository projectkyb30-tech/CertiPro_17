import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/useThemeStore';
import { useUserStore } from '../store/useUserStore';
import { ROUTES } from '../routes/paths';
import { motion } from 'framer-motion';
import { 
  User, 
  Moon, 
  Sun, 
  Shield, 
  LogOut, 
  ChevronRight, 
  Mail, 
  Smartphone,
  Globe,
  HelpCircle,
  LucideIcon
} from 'lucide-react';

interface SettingsItem {
  icon: LucideIcon;
  label: string;
  value?: string;
  action?: () => void;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: () => void;
  isDestructive?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { 
    user, 
    setHasSeenAppTutorial,
    setTutorialStepIndex,
    setTutorialRunning 
  } = useUserStore();
  
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  const handleLogout = async () => {
    navigate(ROUTES.LOGOUT);
  };

  if (!user) return null;

  const sections: SettingsSection[] = [
    {
      title: 'Profil',
      items: [
        {
          icon: User,
          label: 'Date Personale',
          value: 'Vezi detalii',
          action: () => navigate(ROUTES.PROFILE),
        }
      ]
    },
    {
      title: 'Securitate',
      items: [
        {
          icon: Shield,
          label: 'Parolă și Autentificare',
          value: 'Schimbă parola',
          action: () => navigate(`${ROUTES.PROFILE}?tab=security`),
        }
      ]
    },
    {
      title: 'Aplicație',
      items: [
        {
          icon: theme === 'dark' ? Moon : Sun,
          label: 'Mod Întunecat',
          value: theme === 'dark' ? 'Activat' : 'Dezactivat',
          isToggle: true,
          toggleValue: theme === 'dark',
          onToggle: toggleTheme,
        },
        {
          icon: Globe,
          label: 'Limbă',
          value: 'Română',
          action: () => {}, // Future: Language modal
        },
        {
          icon: HelpCircle,
          label: 'Tutorial Aplicație',
          value: 'Reluare',
          action: () => {
            setHasSeenAppTutorial(false);
            setTutorialStepIndex(0);
            setTutorialRunning(true);
            navigate(ROUTES.HOME);
          },
        }
      ]
    },
    {
      title: 'Notificări',
      items: [
        {
          icon: Mail,
          label: 'Notificări Email',
          isToggle: true,
          toggleValue: emailNotifs,
          onToggle: () => setEmailNotifs(!emailNotifs),
        },
        {
          icon: Smartphone,
          label: 'Notificări Push',
          isToggle: true,
          toggleValue: pushNotifs,
          onToggle: () => setPushNotifs(!pushNotifs),
        }
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-20 md:pb-0 relative">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
            Setări
          </h1>
          <p className="text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
            Gestionează preferințele contului și ale aplicației
          </p>
        </div>

        <div className="grid gap-8">
          {sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] rounded-3xl p-6 border border-[var(--color-border)] dark:border-[var(--color-border-dark)]"
            >
              <h2 className="text-lg font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] mb-6">
                {section.title}
              </h2>

              <div className="space-y-6">
                {section.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <button
                        onClick={() => {
                          if (!item.isToggle && item.action) {
                            item.action();
                          }
                        }}
                        className={`flex items-center justify-between flex-1 group ${
                          !item.isToggle ? 'cursor-pointer' : ''
                        } text-left`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl transition-colors ${
                            item.isDestructive 
                              ? 'bg-red-50 dark:bg-red-900/10 text-red-500' 
                              : 'bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] group-hover:text-primary group-hover:bg-primary/10'
                          }`}>
                            <item.icon size={20} />
                          </div>
                          <div>
                            <p className={`font-medium ${
                              item.isDestructive ? 'text-red-500' : 'text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]'
                            }`}>
                              {item.label}
                            </p>
                            {item.value && (
                              <p className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mt-0.5">
                                {item.value}
                              </p>
                            )}
                          </div>
                        </div>

                        {!item.isToggle && (
                          <ChevronRight size={18} className="text-gray-400 ml-auto" />
                        )}
                      </button>

                      {item.isToggle && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            item.onToggle?.();
                          }}
                          className={`w-12 h-6 rounded-full transition-colors relative ml-auto ${
                            item.toggleValue ? 'bg-primary' : 'bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)]'
                          }`}
                        >
                          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            item.toggleValue ? 'translate-x-6' : 'translate-x-0'
                          }`} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Explicit Logout Section to avoid mapping issues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] rounded-3xl p-6 border border-[var(--color-border)] dark:border-[var(--color-border-dark)]"
          >
            <h2 className="text-lg font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] mb-6">
              Cont
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 w-full">
                <button
                  onClick={(e) => { e.preventDefault(); handleLogout(); }}
                  className="flex items-center justify-between flex-1 group cursor-pointer text-left w-full"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl transition-colors bg-red-50 dark:bg-red-900/10 text-red-500">
                      <LogOut size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-red-500">
                        Deconectare
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 ml-auto" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default Settings;
