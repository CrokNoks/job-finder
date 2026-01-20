'use client';

import { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, Users, Clock, Search } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { getUserStats, UserStats } from '@/lib/api';

interface StatsOverviewProps {
  userId: string;
}

export function StatsOverview({ userId }: StatsOverviewProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const userStats = await getUserStats(user.uid);
        setStats(userStats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Set default values on error
        setStats({
          totalSearches: 0,
          savedJobs: 0,
          applicationsSent: 0,
          interviews: 0,
          offers: 0,
          responseRate: 0,
          avgResultsPerSearch: 0,
          sources: {},
          recentActivity: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const statCards = [
    {
      title: 'Total recherches',
      value: stats?.totalSearches || 0,
      icon: Search,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Offres sauvegardées',
      value: stats?.savedJobs || 0,
      icon: Briefcase,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Candidatures envoyées',
      value: stats?.applicationsSent || 0,
      icon: Users,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'Taux de réponse',
      value: `${stats?.responseRate || 0}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
  ];

  if (loading || !stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Vos Statistiques</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-2 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Vos Statistiques</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="text-center">
            <div
              className={`w-10 h-10 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2`}
            >
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Activité récente</h4>
            <p className="text-sm text-gray-600">Vos dernières interactions avec les offres</p>
          </div>
          <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
            Voir tout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="text-center">
            <div
              className={`w-10 h-10 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2`}
            >
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
