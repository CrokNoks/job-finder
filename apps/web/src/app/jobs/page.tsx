'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { JobListing } from '@/lib/api';
import { searchJobs } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { JobFilters } from '@/components/JobFilters';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Search, Briefcase, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

function JobsPageContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // Parse search query from URL params
  useEffect(() => {
    const queryParam = searchParams.get('q');
    const sourcesParam = searchParams.get('sources');

    if (queryParam) {
      try {
        const searchQuery = JSON.parse(decodeURIComponent(queryParam));
        setQuery(searchQuery.poste || '');
        performSearch(searchQuery);
      } catch (error) {
        toast.error('Invalid search parameters');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: any) => {
    try {
      setLoading(true);
      const results = await searchJobs(searchQuery);
      setJobs(results);
      setFilteredJobs(results);
    } catch (error) {
      toast.error('Failed to load job results');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: {
    sources: string[];
    remoteOnly: boolean;
    salaryMin?: number;
    technologies: string[];
  }) => {
    let filtered = [...jobs];

    // Filter by sources
    if (filters.sources.length > 0) {
      filtered = filtered.filter((job) => filters.sources.includes(job.source));
    }

    // Filter by remote
    if (filters.remoteOnly) {
      filtered = filtered.filter((job) => job.remote);
    }

    // Filter by salary
    if (filters.salaryMin) {
      filtered = filtered.filter((job) => {
        if (job.salaryMin) return job.salaryMin >= filters.salaryMin!;
        if (job.salaryMax) return job.salaryMax >= filters.salaryMin!;
        return false;
      });
    }

    // Filter by technologies
    if (filters.technologies.length > 0) {
      filtered = filtered.filter((job) =>
        filters.technologies.some((tech) =>
          job.technologies.some((jobTech) => jobTech.toLowerCase().includes(tech.toLowerCase()))
        )
      );
    }

    setFilteredJobs(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-primary-600">
              <Search className="w-6 h-6 animate-pulse" />
              <span className="text-lg font-medium">Searching for jobs...</span>
            </div>
          </div>

          {/* Skeleton loaders */}
          <div className="mt-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="job-card">
                <div className="space-y-3">
                  <div className="skeleton h-6 w-3/4"></div>
                  <div className="skeleton h-4 w-1/2"></div>
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-4 w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="flex items-center space-x-2">
                <Briefcase className="w-6 h-6 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  {query ? `Results for "${query}"` : 'Job Search Results'}
                </h1>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <JobFilters jobs={jobs} onFilter={handleFilter} />
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">
                  {jobs.length === 0
                    ? 'Try adjusting your search criteria.'
                    : 'Try adjusting your filters to see more results.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-primary-600">
                  <Search className="w-6 h-6 animate-pulse" />
                  <span className="text-lg font-medium">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <JobsPageContent />
      </Suspense>
    </ErrorBoundary>
  );
}
