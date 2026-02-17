import React, { useEffect, useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../routes/paths';
import { Shield, Users, BookOpen, AlertCircle, DollarSign } from 'lucide-react';
import { adminService, AdminStats } from '../services/adminService';

const AdminDashboard: React.FC = () => {
  const { user } = useUserStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const statsPromise = adminService.getStats();
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout la încărcarea datelor admin')), 8000)
        );
        const data = await Promise.race([statsPromise, timeout]);
        setStats(data);
      } catch (err: any) {
        console.error('Failed to fetch admin stats:', err);
        setError(err.message || 'Eroare la încărcarea datelor');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  // Admin check
  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-500 animate-pulse">Se încarcă datele administrative...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-2xl text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-lg font-bold text-red-900 dark:text-red-400">Eroare</h3>
        <p className="text-red-700 dark:text-red-300 mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
        >
          Reîncearcă
        </button>
      </div>
    );
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
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Utilizatori Totali</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats?.totalUsers.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-[#1A1B1D] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
              <BookOpen size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Cursuri Active</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats?.activeCourses}</p>
        </div>

        <div className="bg-white dark:bg-[#1A1B1D] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
              <DollarSign size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Venit Total</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats?.totalRevenue.toLocaleString()} €</p>
        </div>

        <div className="bg-white dark:bg-[#1A1B1D] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
              <AlertCircle size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Activități</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats?.recentActivity.length || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1A1B1D] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Activitate Recentă</h3>
          <div className="space-y-4">
            {stats?.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold">
                  {activity.user[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-xs text-gray-500">{new Date(activity.time).toLocaleString('ro-RO')}</p>
                </div>
              </div>
            ))}
            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
              <p className="text-gray-500 text-sm text-center py-4">Nicio activitate recentă.</p>
            )}
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
