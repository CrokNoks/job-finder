'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { JobListing, saveJob, unsaveJob } from '@/lib/api';
import {
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Monitor,
  Building,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface JobCardProps {
  job: JobListing;
  saved?: boolean;
  onSave?: (jobId: string) => void;
  onUnsave?: (jobId: string) => void;
}

export function JobCard({ job, saved = false, onSave, onUnsave }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(saved);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;

    const user = auth.currentUser;
    if (!user) {
      toast.error('Please login to save jobs');
      return;
    }

    try {
      setIsSaving(true);

      if (isSaved) {
        await unsaveJob(user.uid, job.id);
        onUnsave?.(job.id);
        setIsSaved(false);
        toast.success('Job removed from saved');
      } else {
        await saveJob(user.uid, job.id);
        onSave?.(job.id);
        setIsSaved(true);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      console.error('Save/unsave error:', error);
      toast.error('Failed to save job');
    } finally {
      setIsSaving(false);
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'linkedin':
        return 'bg-blue-500';
      case 'indeed':
        return 'bg-blue-600';
      case 'welcometothejungle':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'linkedin':
        return 'LinkedIn';
      case 'indeed':
        return 'Indeed';
      case 'welcometothejungle':
        return 'Welcome to the Jungle';
      default:
        return source;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div className="job-card group">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                {job.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Building className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 font-medium">{job.company}</span>
              </div>
            </div>

            {/* Source Badge */}
            <div className="flex items-center space-x-2 ml-4">
              <div className={`w-2 h-2 rounded-full ${getSourceColor(job.source)}`} />
              <span className="text-xs text-gray-500">{getSourceLabel(job.source)}</span>
            </div>
          </div>

          {/* Key Details */}
          <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-gray-600">
            {/* Location */}
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>

            {/* Remote */}
            {job.remote && (
              <div className="flex items-center space-x-1 text-green-600">
                <Monitor className="w-4 h-4" />
                <span>Remote</span>
              </div>
            )}

            {/* Contract Type */}
            {job.contractType && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                {job.contractType}
              </span>
            )}

            {/* Salary */}
            {(job.salaryRange || job.salaryMin || job.salaryMax) && (
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>
                  {job.salaryRange ||
                    (job.salaryMin && job.salaryMax
                      ? `${job.salaryMin.toLocaleString()}€ - ${job.salaryMax.toLocaleString()}€`
                      : job.salaryMin
                        ? `From ${job.salaryMin.toLocaleString()}€`
                        : `Up to ${job.salaryMax?.toLocaleString()}€`)}
                </span>
              </div>
            )}

            {/* Posted Time */}
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(job.postedAt)}</span>
            </div>
          </div>

          {/* Technologies */}
          {job.technologies && job.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {job.technologies.slice(0, 8).map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-medium"
                >
                  {tech}
                </span>
              ))}
              {job.technologies.length > 8 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                  +{job.technologies.length - 8} more
                </span>
              )}
            </div>
          )}

          {/* Description Preview */}
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{job.description}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={() => window.open(job.url, '_blank', 'noopener,noreferrer')}
            className="btn-primary text-sm flex items-center space-x-1"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Apply</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary-600 transition-colors disabled:opacity-50"
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-primary-600" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
