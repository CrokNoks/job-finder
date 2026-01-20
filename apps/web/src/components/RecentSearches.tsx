'use client';

import { useState, useEffect } from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { SearchHistory, getSearchHistory } from '@/lib/api';

interface RecentSearchesProps {
  userId: string;
}

export function RecentSearches({ userId }: RecentSearchesProps) {
  const [searches, setSearches] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchHistory = async () => {
      try {
        const result = await getSearchHistory(userId);
        setSearches(result || []);
      } catch (error) {
        console.error('Failed to fetch search history:', error);
        // Fallback to empty array instead of mock data
        setSearches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchHistory();
  }, [userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const handleDelete = (searchId: string) => {
    setSearches(searches.filter((s) => s.id !== searchId));
    // TODO: Call API to delete search
  };

  const handleReplay = (query: SearchHistory['query']) => {
    // TODO: Implement replay search functionality
    console.log('Replaying search:', query);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Aucune recherche récente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searches.map((search) => (
        <div
          key={search.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{search.query.poste}</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {search.query.sources.map((source) => (
                  <span
                    key={source}
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                      ${source === 'linkedin' ? 'bg-blue-100 text-blue-800' : ''}
                      ${source === 'indeed' ? 'bg-blue-600 text-white' : ''}
                      ${source === 'welcometothejungle' ? 'bg-orange-100 text-orange-800' : ''}
                    `}
                  >
                    {source}
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{search.resultsCount} résultats</span>
                <span>{formatDate(search.createdAt)}</span>
              </div>
              {search.query.technologies && search.query.technologies.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {search.query.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => handleReplay(search.query)}
                className="text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                Relancer
              </button>
              <button
                onClick={() => handleDelete(search.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
