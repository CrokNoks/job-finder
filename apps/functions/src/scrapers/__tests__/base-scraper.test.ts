import { BaseScraper } from '../base-scraper';
import { JobSearchQuery, JobListing } from '../../types';

// Create a concrete implementation of BaseScraper for testing
class TestScraper extends BaseScraper {
  readonly source = 'linkedin' as const;

  buildSearchUrl(query: JobSearchQuery): string {
    return `https://linkedin.com/jobs/search?keywords=${query.poste}`;
  }

  extractJobListings(html: string): Partial<JobListing>[] {
    return [
      {
        title: 'Test Job',
        url: 'https://example.com/job/1',
        source: 'linkedin',
      },
    ];
  }

  extractJobDetails(html: string): { company: string; description: string; location: string } {
    return {
      company: 'Test Company',
      description: 'Test description with React and TypeScript skills',
      location: 'Paris',
    };
  }
}

// Mock axios and cheerio
jest.mock('axios', () => ({
  get: jest.fn(),
}));

jest.mock('cheerio', () => ({
  load: jest.fn(),
}));

describe('BaseScraper', () => {
  let scraper: TestScraper;
  const mockAxios = require('axios');
  const mockCheerio = require('cheerio');

  beforeEach(() => {
    scraper = new TestScraper();
    jest.clearAllMocks();
  });

  describe('cleanText', () => {
    it('cleans text with extra spaces', () => {
      const dirtyText = '  Hello    World  ';
      expect(scraper['cleanText'](dirtyText)).toBe('Hello World');
    });

    it('handles null and undefined', () => {
      expect(scraper['cleanText'](null)).toBe('');
      expect(scraper['cleanText'](undefined)).toBe('');
    });

    it('handles empty string', () => {
      expect(scraper['cleanText']('')).toBe('');
    });
  });

  describe('buildFullUrl', () => {
    it('returns full URL when already complete', () => {
      const url = 'https://example.com/full/path';
      const baseUrl = 'https://example.com';
      expect(scraper['buildFullUrl'](url, baseUrl)).toBe(url);
    });

    it('builds full URL from relative path', () => {
      const url = '/relative/path';
      const baseUrl = 'https://example.com';
      expect(scraper['buildFullUrl'](url, baseUrl)).toBe('https://example.com/relative/path');
    });
  });

  describe('generateId', () => {
    it('generates consistent ID for same URL', () => {
      const url = 'https://example.com/job/123';
      const id1 = scraper['generateId'](url);
      const id2 = scraper['generateId'](url);
      expect(id1).toBe(id2);
    });

    it('generates different IDs for different URLs', () => {
      const url1 = 'https://example.com/job/123';
      const url2 = 'https://example.com/job/456';
      const id1 = scraper['generateId'](url1);
      const id2 = scraper['generateId'](url2);
      expect(id1).not.toBe(id2);
    });

    it('produces base64-like IDs', () => {
      const url = 'https://example.com/job/123';
      const id = scraper['generateId'](url);
      expect(id).toMatch(/^[a-zA-Z0-9]+$/);
      expect(id.length).toBe(16);
    });
  });

  describe('extractSalary', () => {
    it('extracts salary range with k notation', () => {
      const text = 'Salary: 50k-70k€ per year';
      const result = scraper['extractSalary'](text);
      expect(result).toEqual({
        min: 50000,
        max: 70000,
        range: '50k-70k€',
      });
    });

    it('extracts single salary with k notation', () => {
      const text = 'Salary: 60k€ per year';
      const result = scraper['extractSalary'](text);
      expect(result).toEqual({
        min: 60000,
        max: 60000,
        range: '60k€',
      });
    });

    it('handles uppercase K', () => {
      const text = 'Salary: 45K-65K per year';
      const result = scraper['extractSalary'](text);
      expect(result).toEqual({
        min: 45000,
        max: 65000,
        range: '45K-65K',
      });
    });

    it('returns empty object when no salary found', () => {
      const text = 'No salary information here';
      const result = scraper['extractSalary'](text);
      expect(result).toEqual({});
    });
  });

  describe('extractTechnologies', () => {
    it('extracts technologies from description and title', () => {
      const description = 'We are looking for a developer with React and Node.js experience';
      const title = 'Senior Vue Developer';
      const result = scraper['extractTechnologies'](description, title);
      expect(result).toContain('react');
      expect(result).toContain('node');
      expect(result).toContain('vue');
      expect(result).toContain('javascript');
    });

    it('is case insensitive', () => {
      const description = 'Experience with REACT and Python required';
      const title = 'Developer job';
      const result = scraper['extractTechnologies'](description, title);
      expect(result).toContain('react');
      expect(result).toContain('python');
    });

    it('returns empty array when no technologies found', () => {
      const description = 'We are looking for a motivated person';
      const title = 'General Manager';
      const result = scraper['extractTechnologies'](description, title);
      expect(result).toEqual([]);
    });
  });

  describe('extractContractType', () => {
    it('extracts CDI from description', () => {
      const description = 'This is a CDI position in Paris';
      expect(scraper['extractContractType'](description)).toBe('CDI');
    });

    it('extracts CDD from description', () => {
      const description = '6 month CDD contract';
      expect(scraper['extractContractType'](description)).toBe('CDD');
    });

    it('extracts alternance from description', () => {
      const description = 'Alternance position for students';
      expect(scraper['extractContractType'](description)).toBe('alternance');
    });

    it('extracts stage from description', () => {
      const description = 'Stage de 3 mois';
      expect(scraper['extractContractType'](description)).toBe('stage');
    });

    it('extracts freelance from description', () => {
      const description = 'Freelance mission';
      expect(scraper['extractContractType'](description)).toBe('freelance');
    });

    it('returns empty string when no contract type found', () => {
      const description = 'Regular job description';
      expect(scraper['extractContractType'](description)).toBe('');
    });
  });

  describe('isRemote', () => {
    it('detects remote keyword in English', () => {
      const description = 'This is a remote position';
      expect(scraper['isRemote'](description)).toBe(true);
    });

    it('detects télétravail keyword in French', () => {
      const description = 'Poste en télétravail';
      expect(scraper['isRemote'](description)).toBe(true);
    });

    it('returns false when no remote keywords found', () => {
      const description = 'Position based in Paris office';
      expect(scraper['isRemote'](description)).toBe(false);
    });
  });

  describe('getJobDetails', () => {
    it('fetches job details and constructs complete job listing', async () => {
      const partialJob = {
        title: 'Test Job',
        url: 'https://example.com/job/1',
        source: 'linkedin' as const,
      };

      const mockHtml = '<html><body>Test job details</body></html>';
      const mockCheerioInstance = {
        html: () => mockHtml,
      };

      mockAxios.get.mockResolvedValue({ data: mockHtml });
      mockCheerio.load.mockReturnValue(mockCheerioInstance);

      const result = await scraper.getJobDetails(partialJob);

      expect(result).toEqual({
        id: expect.any(String),
        title: 'Test Job',
        company: 'Test Company',
        description: 'Test description with React and TypeScript skills',
        url: 'https://example.com/job/1',
        salaryRange: undefined,
        salaryMin: undefined,
        salaryMax: undefined,
        location: 'Paris',
        country: 'France',
        source: 'linkedin',
        technologies: ['react', 'typescript'],
        remote: false,
        contractType: '',
        postedAt: expect.any(String),
        scrapedAt: expect.any(String),
      });
    });

    it('returns null when required fields are missing', async () => {
      const partialJob = {
        title: 'Test Job',
        // Missing url and source
      };

      const result = await scraper.getJobDetails(partialJob);
      expect(result).toBeNull();
    });

    it('handles HTTP errors gracefully', async () => {
      const partialJob = {
        title: 'Test Job',
        url: 'https://example.com/job/1',
        source: 'linkedin' as const,
      };

      mockAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await scraper.getJobDetails(partialJob);
      expect(result).toBeNull();
    });

    it('includes salary information when present in description', async () => {
      const partialJob = {
        title: 'Test Job',
        url: 'https://example.com/job/1',
        source: 'linkedin' as const,
      };

      const mockHtml = '<html><body>Salary: 50k-70k€ per year</body></html>';
      const mockCheerioInstance = {
        html: () => mockHtml,
      };

      // Mock extractJobDetails to return salary info
      scraper.extractJobDetails = jest.fn().mockReturnValue({
        company: 'Test Company',
        description: 'Salary: 50k-70k€ per year',
        location: 'Paris',
      });

      mockAxios.get.mockResolvedValue({ data: mockHtml });
      mockCheerio.load.mockReturnValue(mockCheerioInstance);

      const result = await scraper.getJobDetails(partialJob);

      expect(result?.salaryMin).toBe(50000);
      expect(result?.salaryMax).toBe(70000);
      expect(result?.salaryRange).toBe('50k-70k€');
    });
  });
});
