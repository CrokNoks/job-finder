import { createClient } from '@supabase/supabase-js';
import { JobListing, SavedJob } from '../types';

// Use environment variables from firebase.json or fallback to hardcoded
const supabaseUrl = process.env.SUPABASE_URL || 'https://qctsotskbbwtzavjpyus.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdHNvdHNrYmJ3dHphdmpweXVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzYzMjI4NSwiZXhwIjoyMDc5MjA4Mjg1fQ.aCkBNS6kD24DykF1UGrIb6H7tn7_-l2g-qXHL7_NSSw';

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
