import { saveJobToSupabase, getUserSavedJobs } from '../supabase';
import { JobListing, SavedJob } from '../../types';

// Create a more appropriate interface for saved job entries in the database
interface SavedJobEntry {
  id: string;
  user_id: string;
  job_id: string;
  saved_at: string;
}

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      upsert: jest.fn(),
      select: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  })),
}));

describe('Supabase Service', () => {
  const mockJobListing: JobListing = {
    id: 'test-job-1',
    title: 'React Developer',
    company: 'Tech Corp',
    description: 'Job description',
    url: 'https://example.com/job/1',
    location: 'Paris',
    country: 'France',
    source: 'linkedin',
    remote: true,
    contractType: 'CDI',
    technologies: ['React', 'TypeScript'],
    postedAt: '2024-01-15T10:00:00Z',
    scrapedAt: '2024-01-15T10:00:00Z',
    salaryMin: 50000,
    salaryMax: 70000,
    salaryRange: '50k-70k€',
  };

  const mockSavedJobs: SavedJobEntry[] = [
    {
      id: 'saved-1',
      user_id: 'user-123',
      job_id: 'job-123',
      saved_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 'saved-2',
      user_id: 'user-123',
      job_id: 'job-456',
      saved_at: '2024-01-14T15:30:00Z',
    },
  ];

  describe('saveJobToSupabase', () => {
    let mockSupabase: any;
    let mockFrom: jest.Mock;
    let mockUpsert: jest.Mock;

    beforeEach(() => {
      const { createClient } = require('@supabase/supabase-js');
      mockUpsert = jest.fn();
      mockFrom = jest.fn(() => ({
        upsert: mockUpsert,
      }));
      mockSupabase = {
        from: mockFrom,
      };
      createClient.mockReturnValue(mockSupabase);
    });

    it('saves job with camelCase to snake_case conversion', async () => {
      mockUpsert.mockResolvedValue({ error: null });

      await saveJobToSupabase(mockJobListing);

      expect(mockSupabase.from).toHaveBeenCalledWith('job_listings');
      expect(mockUpsert).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            id: 'test-job-1',
            title: 'React Developer',
            company: 'Tech Corp',
            contract_type: 'CDI',
            salary_range: '50k-70k€',
            salary_min: 50000,
            salary_max: 70000,
            posted_at: '2024-01-15T10:00:00Z',
            scraped_at: '2024-01-15T10:00:00Z',
          }),
        ],
        {
          onConflict: 'id',
          ignoreDuplicates: false,
        }
      );
    });

    it('removes camelCase fields from database payload', async () => {
      mockUpsert.mockResolvedValue({ error: null });

      await saveJobToSupabase(mockJobListing);

      const [[payload]] = mockUpsert.mock.calls;

      expect(payload).not.toHaveProperty('contractType');
      expect(payload).not.toHaveProperty('salaryRange');
      expect(payload).not.toHaveProperty('salaryMin');
      expect(payload).not.toHaveProperty('salaryMax');
      expect(payload).not.toHaveProperty('postedAt');
      expect(payload).not.toHaveProperty('scrapedAt');

      expect(payload).toHaveProperty('contract_type');
      expect(payload).toHaveProperty('salary_range');
      expect(payload).toHaveProperty('salary_min');
      expect(payload).toHaveProperty('salary_max');
      expect(payload).toHaveProperty('posted_at');
      expect(payload).toHaveProperty('scraped_at');
    });

    it('handles Supabase errors gracefully', async () => {
      const mockError = new Error('Database error');
      mockUpsert.mockResolvedValue({ error: mockError });

      // Should not throw but should log error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await saveJobToSupabase(mockJobListing);

      expect(consoleSpy).toHaveBeenCalledWith('Error saving job to Supabase:', mockError);

      consoleSpy.mockRestore();
    });

    it('handles network errors gracefully', async () => {
      mockUpsert.mockRejectedValue(new Error('Network error'));

      // Should not throw but should log error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await saveJobToSupabase(mockJobListing);

      expect(consoleSpy).toHaveBeenCalledWith('Error in saveJobToSupabase:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('converts job without optional fields correctly', async () => {
      const jobWithoutOptionalFields = {
        ...mockJobListing,
        salaryMin: undefined,
        salaryMax: undefined,
        salaryRange: undefined,
        contractType: undefined,
      };

      mockUpsert.mockResolvedValue({ error: null });

      await saveJobToSupabase(jobWithoutOptionalFields);

      const [[payload]] = mockUpsert.mock.calls;

      expect(payload).toHaveProperty('salary_min', undefined);
      expect(payload).toHaveProperty('salary_max', undefined);
      expect(payload).toHaveProperty('salary_range', undefined);
      expect(payload).toHaveProperty('contract_type', undefined);
    });
  });

  describe('getUserSavedJobs', () => {
    let mockSupabase: any;
    let mockFrom: jest.Mock;
    let mockSelect: jest.Mock;
    let mockEq: jest.Mock;

    beforeEach(() => {
      const { createClient } = require('@supabase/supabase-js');
      mockEq = jest.fn().mockResolvedValue({
        data: mockSavedJobs,
        error: null,
      });
      mockSelect = jest.fn(() => ({
        eq: mockEq,
      }));
      mockFrom = jest.fn(() => ({
        select: mockSelect,
      }));
      mockSupabase = {
        from: mockFrom,
      };
      createClient.mockReturnValue(mockSupabase);
    });

    it('fetches saved jobs for a user', async () => {
      const userId = 'user-123';

      const result = await getUserSavedJobs(userId);

      expect(mockSupabase.from).toHaveBeenCalledWith('saved_jobs');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', userId);
      expect(result).toEqual(mockSavedJobs);
    });

    it('returns empty array when no saved jobs found', async () => {
      mockEq.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getUserSavedJobs('user-456');

      expect(result).toEqual([]);
    });

    it('handles Supabase errors gracefully', async () => {
      const mockError = new Error('Database error');
      mockEq.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getUserSavedJobs('user-123');

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching saved jobs:', mockError);
      expect(result).toEqual([]);

      consoleSpy.mockRestore();
    });

    it('handles network errors gracefully', async () => {
      mockEq.mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getUserSavedJobs('user-123');

      expect(consoleSpy).toHaveBeenCalledWith('Error in getUserSavedJobs:', expect.any(Error));
      expect(result).toEqual([]);

      consoleSpy.mockRestore();
    });

    it('handles null data response', async () => {
      mockEq.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getUserSavedJobs('user-123');

      expect(result).toEqual([]);
    });

    it('handles undefined data response', async () => {
      mockEq.mockResolvedValue({
        data: undefined,
        error: null,
      });

      const result = await getUserSavedJobs('user-123');

      expect(result).toEqual([]);
    });
  });
});
