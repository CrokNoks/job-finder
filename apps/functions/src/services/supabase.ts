import {createClient} from '@supabase/supabase-js';
import {JobListing, SavedJob} from '@shared/types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function saveJobToSupabase(job: JobListing): Promise<void> {
  try {
    // Check if job already exists
    const {data: existingJob} = await supabase
      .from('job_listings')
      .select('id')
      .eq('url', job.url)
      .single();

    if (existingJob) {
      return; // Job already exists
    }

    // Insert new job
    const {error} = await supabase
      .from('job_listings')
      .insert({
        id: job.id,
        title: job.title,
        company: job.company,
        description: job.description,
        url: job.url,
        salary_range: job.salaryRange,
        salary_min: job.salaryMin,
        salary_max: job.salaryMax,
        location: job.location,
        country: job.country,
        source: job.source,
        technologies: job.technologies,
        remote: job.remote,
        contract_type: job.contractType,
        posted_at: job.postedAt,
        scraped_at: job.scrapedAt,
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving job to Supabase:', error);
    throw error;
  }
}

export async function getUserSavedJobs(userId: string): Promise<SavedJob[]> {
  try {
    const {data, error} = await supabase
      .from('saved_jobs')
      .select(`
        *,
        job_listings (
          id,
          title,
          company,
          description,
          url,
          salary_range,
          salary_min,
          salary_max,
          location,
          source,
          technologies,
          remote,
          contract_type,
          posted_at,
          scraped_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', {ascending: false});

    if (error) {
      throw error;
    }

    return data.map(savedJob => ({
      id: savedJob.id,
      title: savedJob.job_listings.title,
      company: savedJob.job_listings.company,
      description: savedJob.job_listings.description,
      url: savedJob.job_listings.url,
      salaryRange: savedJob.job_listings.salary_range,
      salaryMin: savedJob.job_listings.salary_min,
      salaryMax: savedJob.job_listings.salary_max,
      location: savedJob.job_listings.location,
      country: 'France',
      source: savedJob.job_listings.source,
      technologies: savedJob.job_listings.technologies,
      remote: savedJob.job_listings.remote,
      contractType: savedJob.job_listings.contract_type,
      postedAt: savedJob.job_listings.posted_at,
      scrapedAt: savedJob.job_listings.scraped_at,
      status: savedJob.status,
      notes: savedJob.notes,
      tags: savedJob.tags,
      rating: savedJob.rating,
      savedAt: savedJob.created_at,
    }));
  } catch (error) {
    console.error('Error getting user saved jobs:', error);
    throw error;
  }
}

export async function saveUserJob(
  userId: string,
  jobId: string,
  status?: string,
  notes?: string,
  tags?: string[],
  rating?: number
): Promise<void> {
  try {
    const {error} = await supabase
      .from('saved_jobs')
      .insert({
        user_id: userId,
        job_id: jobId,
        status: status || 'à postuler',
        notes,
        tags: tags || [],
        rating,
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving user job:', error);
    throw error;
  }
}

export async function updateUserJob(
  savedJobId: string,
  updates: {
    status?: string;
    notes?: string;
    tags?: string[];
    rating?: number;
  }
): Promise<void> {
  try {
    const {error} = await supabase
      .from('saved_jobs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', savedJobId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating user job:', error);
    throw error;
  }
}