import { useState, useEffect, useRef } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import { useUserStore } from '../../../store/useUserStore';

export interface DashboardStats {
  level: string;
  nextExam: string;
  progressToExam: number;
  courseName: string;
  progressToCompletion: number;
  activityData: {
    week: { label: string; value: number; height: string }[];
    month: { label: string; value: number; height: string }[];
    all: { label: string; value: number; height: string }[];
  };
  stats: {
    week: { total: string; average: string };
    month: { total: string; average: string };
    all: { total: string; average: string };
  };
}

type DashboardGraphPoint = { label: string; value: number };
type DashboardStatsResponse = {
  level: string;
  lessons_today: number;
  week_graph: DashboardGraphPoint[];
  month_graph: DashboardGraphPoint[];
  all_graph: DashboardGraphPoint[];
  recent_enrollment?: {
    course_title?: string | null;
    progress_percent?: number | null;
  } | null;
};

const CACHE_KEY = 'dashboard_stats_cache';
const CACHE_TTL_MS = 1000 * 60 * 10;

const loadCachedStats = (): { stats: DashboardStats; timestamp: number } | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { stats: DashboardStats; timestamp: number };
    if (!parsed?.stats || !parsed?.timestamp) return null;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
};

const saveCachedStats = (stats: DashboardStats) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ stats, timestamp: Date.now() }));
  } catch {
    return;
  }
};

// Helper to generate empty structure for charts
const generateEmptyStats = (): DashboardStats => {
  const today = new Date();
  const daysMap = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  
  // Week: Last 7 days labels
  const weekData = [];
  for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      weekData.push({ label: daysMap[d.getDay()], value: 0, height: '5%' });
  }

  // Month: Last 4 weeks labels
  const monthData = [];
  for (let i = 3; i >= 0; i--) {
      monthData.push({ label: `S${4-i}`, value: 0, height: '5%' });
  }

  // All: Last 6 months labels
  const allData = [];
  for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(today.getMonth() - i);
      const monthName = d.toLocaleString('ro-RO', { month: 'short' });
      allData.push({ 
          label: monthName.charAt(0).toUpperCase() + monthName.slice(1), 
          value: 0, 
          height: '5%' 
      });
  }

  return {
      level: 'Începător',
      nextExam: 'Niciun Examen',
      progressToExam: 0,
      courseName: 'Niciun Curs',
      progressToCompletion: 0,
      activityData: { week: weekData, month: monthData, all: allData },
      stats: {
          week: { total: '0h', average: '0h' },
          month: { total: '0h', average: '0h' },
          all: { total: '0h', average: '0h' }
      }
  };
};

export const useDashboardStats = () => {
  const { user } = useUserStore();
  const cached = loadCachedStats();
  const hasCacheRef = useRef(!!cached);
  const [stats, setStats] = useState<DashboardStats>(cached?.stats || generateEmptyStats());
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, hasCacheRef.current ? 1000 : 1500);

    if (!user) {
        setLoading(false);
        clearTimeout(safetyTimeout);
        return;
    }

    const fetchStats = async () => {
      try {
        setLoading(!hasCacheRef.current);
        setError(null);

        // OPTIMIZED: Use Server-Side Aggregation (RPC)
        // Instead of fetching thousands of rows, we get a single lightweight JSON
        const data = await dashboardApi.getDashboardStats() as DashboardStatsResponse | null;
        if (data) {
             // Helper to add height property
             const addHeight = (arr: DashboardGraphPoint[]) => {
                 const max = Math.max(...arr.map(i => i.value), 1);
                 return arr.map(i => ({
                     ...i,
                     height: `${Math.max((i.value / max) * 100, 5)}%` // Min 5% height
                 }));
             };

             const progressPercent = data.recent_enrollment?.progress_percent ?? 0;
             const nextStats = {
                level: data.level,
                nextExam: 'Examen ' + (data.recent_enrollment?.course_title || '...'),
                progressToExam: Math.min(progressPercent + 20, 100),
                courseName: data.recent_enrollment?.course_title || 'Niciun Curs',
                progressToCompletion: progressPercent,
                
                activityData: {
                    week: addHeight(data.week_graph),
                    month: addHeight(data.month_graph),
                    all: addHeight(data.all_graph)
                },
                
                // Keep these for internal usage or expand interface if needed
                // xp: data.xp, 
                // streak: data.streak,
                stats: {
                    week: { total: `${data.lessons_today} lecții`, average: 'Zilnic' }, // Simplified mapping
                    month: { total: `${data.month_graph.reduce((acc, item) => acc + item.value, 0)} lecții`, average: 'Săptămânal' },
                    all: { total: `${data.all_graph.reduce((acc, item) => acc + item.value, 0)} lecții`, average: 'Lunar' }
                }
             };
             setStats(nextStats);
             saveCachedStats(nextStats);
        }

      } catch (err) {
        console.error('Error fetching dashboard stats:', err);

        const isAbortError =
          err instanceof DOMException && err.name === 'AbortError';

        if (!isAbortError) {
          setError('Failed to load stats');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    return () => clearTimeout(safetyTimeout);
  }, [user]);

  return { stats, loading, error };
};
