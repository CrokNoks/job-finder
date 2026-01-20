export interface JobSearchQuery {
    sources: Array<'linkedin' | 'indeed' | 'welcometothejungle'>;
    poste: string;
    technologies: string[];
    location?: string;
    excludeTerms: string[];
    remoteOnly: boolean;
    salaryMin?: number;
}
export interface JobListing {
    id: string;
    title: string;
    company: string;
    description: string;
    url: string;
    salaryRange?: string;
    salaryMin?: number;
    salaryMax?: number;
    location: string;
    country: string;
    source: 'linkedin' | 'indeed' | 'welcometothejungle';
    technologies: string[];
    remote: boolean;
    contractType?: string;
    postedAt: string;
    scrapedAt: string;
}
export interface SavedJob extends JobListing {
    status: 'à postuler' | 'envoyé' | 'entretien' | 'refusé' | 'accepté';
    notes?: string;
    tags: string[];
    rating?: number;
    savedAt: string;
}
export interface User {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    preferredTechnologies: string[];
    preferredLocations: string[];
    salaryMin?: number;
    remotePreference: boolean;
    createdAt: string;
}
export interface JobAlert {
    id: string;
    userId: string;
    query: JobSearchQuery;
    frequency: 'hourly' | 'daily' | 'weekly';
    isActive: boolean;
    lastRun?: string;
    createdAt: string;
}
export interface SearchHistory {
    id: string;
    userId: string;
    query: JobSearchQuery;
    resultsCount: number;
    createdAt: string;
}
//# sourceMappingURL=types.d.ts.map