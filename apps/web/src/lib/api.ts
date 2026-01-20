// Types temporarily defined here until @shared/types is properly configured
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

export const searchJobs = async (query: JobSearchQuery): Promise<JobListing[]> => {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev
      ? 'http://127.0.0.1:5001/job-finder-166c8/us-central1'
      : 'https://europe-west1-job-finder-166c8.cloudfunctions.net';

    const response = await fetch(`${baseUrl}/searchJobsHandler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Search failed');
    }
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw error;
  }
};

export const saveJob = async (
  userId: string,
  jobId: string,
  status?: string,
  notes?: string
): Promise<void> => {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev
      ? 'http://127.0.0.1:5001/job-finder-166c8/us-central1'
      : 'https://europe-west1-job-finder-166c8.cloudfunctions.net';

    const response = await fetch(`${baseUrl}/saveJobHandler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, jobId, status, notes }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to save job');
    }
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
};

export const getSavedJobs = async (userId: string) => {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev
      ? 'http://127.0.0.1:5001/job-finder-166c8/us-central1'
      : 'https://europe-west1-job-finder-166c8.cloudfunctions.net';

    const response = await fetch(`${baseUrl}/getSavedJobsHandler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to get saved jobs');
    }
  } catch (error) {
    console.error('Error getting saved jobs:', error);
    throw error;
  }
};

export const unsaveJob = async (userId: string, jobId: string): Promise<void> => {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev
      ? 'http://127.0.0.1:5001/job-finder-166c8/us-central1'
      : 'https://europe-west1-job-finder-166c8.cloudfunctions.net';

    const response = await fetch(`${baseUrl}/unsaveJobHandler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, jobId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to unsave job');
    }
  } catch (error) {
    console.error('Error unsaving job:', error);
    throw error;
  }
};

export const saveSearchHistory = async (
  userId: string,
  query: JobSearchQuery,
  resultsCount: number
): Promise<void> => {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev
      ? 'http://127.0.0.1:5001/job-finder-166c8/us-central1'
      : 'https://europe-west1-job-finder-166c8.cloudfunctions.net';

    const response = await fetch(`${baseUrl}/saveSearchHistoryHandler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, query, resultsCount }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to save search history');
    }
  } catch (error) {
    console.error('Error saving search history:', error);
    throw error;
  }
};

export const getSearchHistory = async (userId: string): Promise<SearchHistory[]> => {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev
      ? 'http://127.0.0.1:5001/job-finder-166c8/us-central1'
      : 'https://europe-west1-job-finder-166c8.cloudfunctions.net';

    const response = await fetch(`${baseUrl}/getSearchHistoryHandler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to get search history');
    }
  } catch (error) {
    console.error('Error getting search history:', error);
    throw error;
  }
};

export interface UserStats {
  totalSearches: number;
  savedJobs: number;
  applicationsSent: number;
  interviews: number;
  offers: number;
  responseRate: number;
  avgResultsPerSearch: number;
  sources: Record<string, number>;
  recentActivity: SavedJob[];
}

export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev
      ? 'http://127.0.0.1:5001/job-finder-166c8/us-central1'
      : 'https://europe-west1-job-finder-166c8.cloudfunctions.net';

    const response = await fetch(`${baseUrl}/getUserStatsHandler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to get user stats');
    }
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

export interface SearchHistory {
  id: string;
  userId: string;
  query: JobSearchQuery;
  resultsCount: number;
  createdAt: string;
}

export interface SavedJob extends JobListing {
  status: 'à postuler' | 'envoyé' | 'entretien' | 'refusé' | 'accepté';
  notes?: string;
  tags: string[];
  rating?: number;
  savedAt: string;
}
