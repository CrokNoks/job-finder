'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { JobSearchQuery } from '@shared/types';
import { searchJobs } from '@/lib/api';

const jobSearchSchema = z.object({
  sources: z.array(z.enum(['linkedin', 'indeed', 'welcometothejungle'])).min(1),
  poste: z.string().min(1, 'Le poste est requis'),
  technologies: z.array(z.string()).optional(),
  location: z.string().optional(),
  excludeTerms: z.array(z.string()).optional(),
  remoteOnly: z.boolean().default(false),
  salaryMin: z.number().optional(),
});

type JobSearchFormData = z.infer<typeof jobSearchSchema>;

export function JobSearchForm() {
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<JobSearchFormData>({
    resolver: zodResolver(jobSearchSchema),
    defaultValues: {
      sources: ['linkedin', 'indeed', 'welcometothejungle'],
      technologies: [],
      excludeTerms: [],
      remoteOnly: false,
    },
  });

  const watchedSources = watch('sources');
  const watchedTechnologies = watch('technologies') || [];
  const watchedExcludeTerms = watch('excludeTerms') || [];

  const onSubmit = async (data: JobSearchFormData) => {
    setIsSearching(true);
    
    try {
      const results = await searchJobs(data);
      toast.success(`Trouvé ${results.length} offres d'emploi!`);
      
      // TODO: Navigate to results page
      console.log('Search results:', results);
    } catch (error) {
      toast.error('Erreur lors de la recherche. Veuillez réessayer.');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addTechnology = (tech: string) => {
    if (tech && !watchedTechnologies.includes(tech)) {
      setValue('technologies', [...watchedTechnologies, tech]);
    }
  };

  const removeTechnology = (tech: string) => {
    setValue(
      'technologies',
      watchedTechnologies.filter((t) => t !== tech)
    );
  };

  const addExcludeTerm = (term: string) => {
    if (term && !watchedExcludeTerms.includes(term)) {
      setValue('excludeTerms', [...watchedExcludeTerms, term]);
    }
  };

  const removeExcludeTerm = (term: string) => {
    setValue(
      'excludeTerms',
      watchedExcludeTerms.filter((t) => t !== term)
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Sources */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sources
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'linkedin', label: 'LinkedIn Jobs', color: 'bg-blue-500' },
              { value: 'indeed', label: 'Indeed', color: 'bg-blue-600' },
              {
                value: 'welcometothejungle',
                label: 'Welcome to the Jungle',
                color: 'bg-orange-500',
              },
            ].map((source) => (
              <label
                key={source.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  {...register('sources')}
                  value={source.value}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${source.color}`} />
                  <span className="text-sm text-gray-700">{source.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Poste */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Poste recherché *
          </label>
          <input
            type="text"
            {...register('poste')}
            placeholder="ex: développeur react, designer UX..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.poste && (
            <p className="mt-1 text-sm text-red-600">{errors.poste.message}</p>
          )}
        </div>

        {/* Advanced Options Toggle */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Filter className="w-4 h-4" />
            <span>{showAdvanced ? 'Masquer' : 'Afficher'} les options avancées</span>
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-6 pt-6 border-t border-gray-200">
            {/* Technologies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technologies
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {watchedTechnologies.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ajouter une technologie"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTechnology((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addTechnology(input.value);
                    input.value = '';
                  }}
                  className="btn-secondary"
                >
                  Ajouter
                </button>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localisation
              </label>
              <input
                type="text"
                {...register('location')}
                placeholder="ex: Paris, Lyon, Remote..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Exclude Terms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Termes à exclure
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {watchedExcludeTerms.map((term) => (
                  <span
                    key={term}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                  >
                    {term}
                    <button
                      type="button"
                      onClick={() => removeExcludeTerm(term)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ajouter un terme à exclure"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addExcludeTerm((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addExcludeTerm(input.value);
                    input.value = '';
                  }}
                  className="btn-secondary"
                >
                  Ajouter
                </button>
              </div>
            </div>

            {/* Remote Only */}
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('remoteOnly')}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Télétravail uniquement</span>
              </label>
            </div>

            {/* Salary Min */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salaire minimum annuel (€)
              </label>
              <input
                type="number"
                {...register('salaryMin', { valueAsNumber: true })}
                placeholder="ex: 45000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSearching || watchedSources.length === 0}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4" />
            <span>{isSearching ? 'Recherche en cours...' : 'Lancer la recherche'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}