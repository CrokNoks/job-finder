'use client';

import { useState, useEffect } from 'react';
import { Briefcase, ExternalLink, Plus } from 'lucide-react';
import { SavedJob } from '@/lib/api';

interface SavedJobsPreviewProps {
  userId: string;
}

export function SavedJobsPreview({ userId }: SavedJobsPreviewProps) {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch saved jobs from API
    const mockJobs: SavedJob[] = [
      {
        id: '1',
        title: 'Développeur React Senior',
        company: 'TechCorp',
        description: 'Nous recherchons un développeur React senior pour rejoindre notre équipe...',
        url: 'https://example.com/job1',
        salaryRange: '50k€ - 65k€',
        salaryMin: 50000,
        salaryMax: 65000,
        location: 'Paris',
        country: 'France',
        source: 'linkedin',
        technologies: ['react', 'typescript', 'nodejs'],
        remote: true,
        contractType: 'CDI',
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        scrapedAt: new Date().toISOString(),
        status: 'à postuler',
        notes: '',
        tags: [],
        rating: undefined,
        savedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
      {
        id: '2',
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        description:
          'Rejoignez notre startup en pleine croissance en tant que développeur full stack...',
        url: 'https://example.com/job2',
        salaryRange: '45k€ - 60k€',
        salaryMin: 45000,
        salaryMax: 60000,
        location: 'Lyon',
        country: 'France',
        source: 'indeed',
        technologies: ['javascript', 'python', 'mongodb'],
        remote: false,
        contractType: 'CDI',
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        scrapedAt: new Date().toISOString(),
        status: 'envoyé',
        notes: 'Entretien prévu la semaine prochaine',
        tags: ['prioritaire'],
        rating: 4,
        savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
    ];

    setTimeout(() => {
      setSavedJobs(mockJobs.slice(0, 3)); // Show only 3 most recent
      setLoading(false);
    }, 600);
  }, [userId]);

  const getStatusColor = (status: SavedJob['status']) => {
    switch (status) {
      case 'à postuler':
        return 'bg-blue-100 text-blue-800';
      case 'envoyé':
        return 'bg-yellow-100 text-yellow-800';
      case 'entretien':
        return 'bg-purple-100 text-purple-800';
      case 'refusé':
        return 'bg-red-100 text-red-800';
      case 'accepté':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source: SavedJob['source']) => {
    switch (source) {
      case 'linkedin':
        return 'bg-blue-100 text-blue-800';
      case 'indeed':
        return 'bg-blue-600 text-white';
      case 'welcometothejungle':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Aujourd'hui";
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (savedJobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">Aucune offre sauvegardée</p>
        <button className="btn-primary text-sm">
          <Plus className="w-4 h-4 inline mr-2" />
          Nouvelle recherche
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedJobs.map((job) => (
        <div key={job.id} className="job-card cursor-pointer hover:border-primary-300">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900 line-clamp-1 flex-1">{job.title}</h3>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <p className="text-sm text-gray-600 mb-2">{job.company}</p>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{job.location}</span>
              {job.salaryRange && (
                <>
                  <span>•</span>
                  <span>{job.salaryRange}</span>
                </>
              )}
            </div>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                job.status
              )}`}
            >
              {job.status}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded ${getSourceColor(job.source)}`}
              >
                {job.source}
              </span>
              {job.remote && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Remote
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">{formatDate(job.savedAt)}</span>
          </div>

          {/* Technologies */}
          {job.technologies && job.technologies.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {job.technologies.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {tech}
                  </span>
                ))}
                {job.technologies.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    +{job.technologies.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Rating */}
          {job.rating && (
            <div className="mt-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-sm ${star <= job.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {job.notes && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 italic">{job.notes}</p>
            </div>
          )}
        </div>
      ))}

      {/* View All Link */}
      <div className="text-center pt-2">
        <button className="btn-primary text-sm">Voir toutes les offres ({savedJobs.length})</button>
      </div>
    </div>
  );
}
