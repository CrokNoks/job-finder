'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { JobSearchForm } from '@/components/JobSearchForm';
import { RecentSearches } from '@/components/RecentSearches';
import { StatsOverview } from '@/components/StatsOverview';
import { SavedJobsPreview } from '@/components/SavedJobsPreview';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Job Finder</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <img
                src={user.photoURL || ''}
                alt={user.displayName || ''}
                className="h-8 w-8 rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Search */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Nouvelle recherche</h2>
              <JobSearchForm />
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recherche précédentes</h2>
              <RecentSearches userId={user.uid} />
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vos statistiques</h2>
              <StatsOverview userId={user.uid} />
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Offres sauvegardées</h2>
              <SavedJobsPreview userId={user.uid} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
