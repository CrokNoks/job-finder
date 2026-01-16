import * as functions from 'firebase-functions';
import {searchJobs} from './scrapers/job-search';
import {saveJobToSupabase, getUserSavedJobs} from './services/supabase';
import {JobSearchQuery, JobListing} from '@shared/types';

export const searchJobsHandler = functions.https.onCall(
  {memory: '4GiB', timeoutSeconds: 540},
  async (data: JobSearchQuery) => {
    try {
      const results = await searchJobs(data);
      
      // Save results to Supabase for tracking
      for (const job of results) {
        await saveJobToSupabase(job);
      }
      
      return {
        success: true,
        data: results,
        count: results.length,
      };
    } catch (error) {
      functions.logger.error('Job search failed:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to search jobs',
        error
      );
    }
  }
);

export const saveJobHandler = functions.https.onCall(
  async (data: {userId: string; jobId: string; status?: string; notes?: string}) => {
    try {
      // Implementation for saving a job to user's saved jobs
      return {success: true};
    } catch (error) {
      functions.logger.error('Save job failed:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to save job',
        error
      );
    }
  }
);

export const getSavedJobsHandler = functions.https.onCall(
  async (data: {userId: string}) => {
    try {
      const savedJobs = await getUserSavedJobs(data.userId);
      return {
        success: true,
        data: savedJobs,
      };
    } catch (error) {
      functions.logger.error('Get saved jobs failed:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to get saved jobs',
        error
      );
    }
  }
);

export const scheduledJobSearch = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    functions.logger.info('Running scheduled job search');
    // Implementation for automatic job searches and notifications
    return null;
  });