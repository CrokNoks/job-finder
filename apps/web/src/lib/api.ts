import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { JobSearchQuery, JobListing } from '@shared/types';

export const searchJobs = async (query: JobSearchQuery): Promise<JobListing[]> => {
  const searchJobsFunction = httpsCallable(functions, 'searchJobsHandler');
  
  try {
    const result = await searchJobsFunction(query);
    
    if (result.data?.success) {
      return result.data.data;
    } else {
      throw new Error(result.data?.error || 'Search failed');
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
  const saveJobFunction = httpsCallable(functions, 'saveJobHandler');
  
  try {
    await saveJobFunction({ userId, jobId, status, notes });
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
};

export const getSavedJobs = async (userId: string) => {
  const getSavedJobsFunction = httpsCallable(functions, 'getSavedJobsHandler');
  
  try {
    const result = await getSavedJobsFunction({ userId });
    
    if (result.data?.success) {
      return result.data.data;
    } else {
      throw new Error(result.data?.error || 'Failed to get saved jobs');
    }
  } catch (error) {
    console.error('Error getting saved jobs:', error);
    throw error;
  }
};