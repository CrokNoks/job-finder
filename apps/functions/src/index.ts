import * as functions from 'firebase-functions';
import { searchJobs } from './scrapers/job-search';
import { saveJobToSupabase, getUserSavedJobs } from './services/supabase';
import { JobSearchQuery, JobListing } from './types';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';

const supabaseUrl = process.env.SUPABASE_URL || 'https://qctsotskbbwtzavjpyus.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdHNvdHNrYmJ3dHphdmpweXVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzYzMjI4NSwiZXhwIjoyMDc5MjA4Mjg1fQ.aCkBNS6kD24DykF1UGrIb6H7tn7_-l2g-qXHL7_NSSw';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHandler = cors({ origin: true });

export const searchJobsHandler = functions.https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    if (request.method !== 'POST') {
      response.status(405).send('Method not allowed');
      return;
    }

    try {
      const data = request.body as JobSearchQuery;
      const results = await searchJobs(data);

      // Save results to Supabase for tracking
      for (const job of results) {
        await saveJobToSupabase(job);
      }

      response.status(200).json({
        success: true,
        data: results,
        count: results.length,
      });
    } catch (error) {
      functions.logger.error('Job search failed:', error);
      response.status(500).json({
        success: false,
        error: 'Failed to search jobs',
      });
    }
  });
});

export const unsaveJobHandler = functions.https.onCall(async (request: any) => {
  const data = request.data as { userId: string; jobId: string };
  try {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', data.userId)
      .eq('id', data.jobId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    functions.logger.error('Unsave job failed:', error);
    throw new functions.https.HttpsError('internal', 'Failed to unsave job', error);
  }
});

export const saveSearchHistoryHandler = functions.https.onCall(async (request: any) => {
  const { userId, query, resultsCount } = request.data;
  try {
    await supabase.from('search_history').insert({
      user_id: userId,
      query: JSON.stringify(query),
      results_count: resultsCount,
      created_at: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    functions.logger.error('Failed to save search history:', error);
    throw new functions.https.HttpsError('internal', 'Failed to save search history', error);
  }
});

export const getSearchHistoryHandler = functions.https.onCall(async (request: any) => {
  const { userId } = request.data;
  try {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Parse JSON query strings back to objects
    const parsedData =
      data?.map((item) => ({
        ...item,
        query: JSON.parse(item.query),
      })) || [];

    return { success: true, data: parsedData };
  } catch (error) {
    functions.logger.error('Failed to get search history:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get search history', error);
  }
});

// V2 scheduled function - disabled for now
// export const scheduledJobSearch = onSchedule(
//   {
//     schedule: 'every 1 hours',
//     timeZone: 'Europe/Paris',
//   },
//   async (event) => {
//     functions.logger.info('Running scheduled job search');
//     // Implementation for automatic job searches and notifications
//     return null;
//   }
// );
