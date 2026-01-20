'use client';

import { useState } from 'react';
import { JobListing } from '@/lib/api';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

interface JobFiltersProps {
  jobs: JobListing[];
  onFilter: (filters: {
    sources: string[];
    remoteOnly: boolean;
    salaryMin?: number;
    technologies: string[];
  }) => void;
}

export function JobFilters({ jobs, onFilter }: JobFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get unique values from jobs
  const sources = Array.from(new Set(jobs.map((job) => job.source)));
  const technologies = Array.from(new Set(jobs.flatMap((job) => job.technologies)));
  const maxSalary = Math.max(
    ...jobs.filter((job) => job.salaryMax).map((job) => job.salaryMax || 0)
  );

  const [selectedSources, setSelectedSources] = useState<string[]>(sources);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [salaryMin, setSalaryMin] = useState<number>();
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);

  const applyFilters = () => {
    onFilter({
      sources: selectedSources,
      remoteOnly,
      salaryMin,
      technologies: selectedTechnologies,
    });
  };

  const resetFilters = () => {
    setSelectedSources(sources);
    setRemoteOnly(false);
    setSalaryMin(undefined);
    setSelectedTechnologies([]);
    onFilter({
      sources: sources,
      remoteOnly: false,
      salaryMin: undefined,
      technologies: [],
    });
  };

  const toggleSource = (source: string) => {
    const newSources = selectedSources.includes(source)
      ? selectedSources.filter((s) => s !== source)
      : [...selectedSources, source];
    setSelectedSources(newSources);
  };

  const toggleTechnology = (tech: string) => {
    const newTechs = selectedTechnologies.includes(tech)
      ? selectedTechnologies.filter((t) => t !== tech)
      : [...selectedTechnologies, tech];
    setSelectedTechnologies(newTechs);
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

  if (jobs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Sources */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Sources</h4>
            <div className="space-y-2">
              {sources.map((source) => (
                <label key={source} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source)}
                    onChange={() => toggleSource(source)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getSourceColor(source)}`} />
                    <span className="text-sm text-gray-700">{getSourceLabel(source)}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Remote Work */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Work Type</h4>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Remote only</span>
            </label>
          </div>

          {/* Salary Range */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Minimum Salary</h4>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={maxSalary}
                step="5000"
                value={salaryMin || 0}
                onChange={(e) => setSalaryMin(Number(e.target.value) || undefined)}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>€0</span>
                <span>€{salaryMin?.toLocaleString() || 'Any'}</span>
                <span>€{maxSalary.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Technologies */}
          {technologies.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Technologies</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {technologies.slice(0, 20).map((tech) => (
                  <label key={tech} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTechnologies.includes(tech)}
                      onChange={() => toggleTechnology(tech)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{tech}</span>
                  </label>
                ))}
                {technologies.length > 20 && (
                  <p className="text-xs text-gray-500">... and {technologies.length - 20} more</p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <button onClick={applyFilters} className="w-full btn-primary text-sm">
              Apply Filters
            </button>
            <button onClick={resetFilters} className="w-full btn-secondary text-sm">
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
