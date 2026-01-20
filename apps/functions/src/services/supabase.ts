import { createClient } from '@supabase/supabase-js';
import { JobListing, SavedJob } from '../types';

// Use environment variables only - no hardcoded keys for security
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing required Supabase environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function saveJobToSupabase(job: JobListing): Promise<void> {
  try {
    // Convert camelCase to snake_case for database columns
    const jobForDb = {
      ...job,
      contract_type: job.contractType,
      salary_range: job.salaryRange,
      salary_min: job.salaryMin,
      salary_max: job.salaryMax,
      posted_at: job.postedAt,
      scraped_at: job.scrapedAt,
    };

    // Remove camelCase fields that were converted
    delete (jobForDb as any).contractType;
    delete (jobForDb as any).salaryRange;
    delete (jobForDb as any).salaryMin;
    delete (jobForDb as any).salaryMax;
    delete (jobForDb as any).postedAt;
    delete (jobForDb as any).scrapedAt;

    const { error } = await supabase.from('job_listings').upsert([jobForDb], {
      onConflict: 'id',
      ignoreDuplicates: false,
    });
    if (error) {
      console.error('Error saving job to Supabase:', error);
    }
  } catch (error) {
    console.error('Error in saveJobToSupabase:', error);
  }
}

export async function getUserSavedJobs(userId: string): Promise<SavedJob[]> {
  try {
    const { data, error } = await supabase.from('saved_jobs').select('*').eq('user_id', userId);

    if (error) {
      console.error('Error fetching saved jobs:', error);
      return [];
    }

    return (data as SavedJob[]) || [];
  } catch (error) {
    console.error('Error in getUserSavedJobs:', error);
    return [];
  }
}
