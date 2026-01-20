'use client';

import { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, Users, Clock, Search } from 'lucide-react';

interface Stats {
  totalSearches: number;
  savedJobs: number;
  applicationsSent: number;
  responseRate: number;
}

interface StatsOverviewProps {
  userId: string;
}

export function StatsOverview({ userId }: StatsOverviewProps) {
  const [stats, setStats] = useState<Stats>({
    totalSearches: 0,
    savedJobs: 0,
    applicationsSent: 0,
    responseRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch stats from API
    const mockStats: Stats = {
      totalSearches: 24,
      savedJobs: 18,
      applicationsSent: 12,
      responseRate: 75,
    };

    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 800);
  }, [userId]);

  const statCards = [
    {
      title: 'Total recherches',
      value: stats.totalSearches,
      icon: Search,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Offres sauvegardées',
      value: stats.savedJobs,
      icon: Briefcase,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Candidatures envoyées',
      value: stats.applicationsSent,
      icon: Users,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'Taux de réponse',
      value: `${stats.responseRate}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`w-10 h-10 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className={`text-2xl font-bold ${stat.textColor}`}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}