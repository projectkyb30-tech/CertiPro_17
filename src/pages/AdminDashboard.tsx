import React from 'react';
import { useUserStore } from '../store/useUserStore';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../routes/paths';
import { Shield, Users, BookOpen, Activity, AlertCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useUserStore();

  // Admin check
  const isAdmin = user?.email === 'admin@certipro.com' || user?.email?.toLowerCase().includes('admin') || user?.email === 'daniilchifeac@gmail.com';

  if (!isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="text-primary" />
            Panou Administrare
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestionează utilizatorii, cursurile și setările aplicației.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1A1B1D] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <Users size={24} />
            </div>
            <span className="text-xs font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
              +12%
            </span>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Utilizatori Totali</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">1,234</p>
        </div>

        <div className="bg-white dark:bg-[#1A1B1D] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
              <BookOpen size={24} />
            </div>
            <span className="text-xs font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
              +5%
            </span>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Cursuri Active</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">42</p>
        </div>

        <div className="bg-white dark:bg-[#1A1B1D] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
              <Activity size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
              24h
            </span>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Rată Completare</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">78%</p>
        </div>

        <div className="bg-white dark:bg-[#1A1B1D] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
              <AlertCircle size={24} />
            </div>
            <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">
              3
            </span>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Raportări</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">15</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1A1B1D] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Activitate Recentă</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold">
                  U{i}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Utilizator nou înregistrat</p>
                  <p className="text-xs text-gray-500">Acum {i * 10} minute</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1B1D] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Acțiuni Rapide</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
              Adaugă Curs Nou
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
              Gestionează Utilizatori
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
              Vezi Rapoarte Sistem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
