import { LinkedInScraper } from '../linkedin-scraper';
import { JobSearchQuery } from '../../types';

describe('LinkedInScraper', () => {
  let scraper: LinkedInScraper;

  beforeEach(() => {
    scraper = new LinkedInScraper();
    jest.resetModules();
    // Mock cheerio properly
    const cheerio = require('cheerio');
    cheerio.load = jest.fn().mockReturnValue({
      find: jest.fn().mockReturnValue({
        text: jest.fn().mockReturnValue(''),
        attr: jest.fn().mockReturnValue(''),
        each: jest.fn(),
        first: jest.fn().mockReturnValue({
          text: jest.fn().mockReturnValue(''),
        }),
      }),
      text: jest.fn().mockReturnValue(''),
    });
  });

  describe('buildSearchUrl', () => {
    it('builds URL with basic query parameters', () => {
      const query: JobSearchQuery = {
        sources: ['linkedin'],
        poste: 'React Developer',
        technologies: [],
        excludeTerms: [],
        remoteOnly: false,
      };

      const url = scraper.buildSearchUrl(query);
      const urlObj = new URL(url);

      expect(urlObj.origin).toBe('https://www.linkedin.com');
      expect(urlObj.pathname).toBe('/jobs/search/');
      expect(urlObj.searchParams.get('keywords')).toBe('React Developer');
      expect(urlObj.searchParams.get('location')).toBe('France');
      expect(urlObj.searchParams.get('f_TPR')).toBe('r86400');
    });

    it('includes technologies in keywords', () => {
      const query: JobSearchQuery = {
        sources: ['linkedin'],
        poste: 'Developer',
        technologies: ['React', 'TypeScript'],
        excludeTerms: [],
        remoteOnly: false,
      };

      const url = scraper.buildSearchUrl(query);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('keywords')).toBe('Developer React TypeScript');
    });

    it('includes remote filter when remoteOnly is true', () => {
      const query: JobSearchQuery = {
        sources: ['linkedin'],
        poste: 'Developer',
        technologies: [],
        excludeTerms: [],
        remoteOnly: true,
      };

      const url = scraper.buildSearchUrl(query);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('f_WT')).toBe('2');
    });

    it('uses custom location when provided', () => {
      const query: JobSearchQuery = {
        sources: ['linkedin'],
        poste: 'Developer',
        technologies: [],
        excludeTerms: [],
        remoteOnly: false,
        location: 'Paris',
      };

      const url = scraper.buildSearchUrl(query);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('location')).toBe('Paris');
    });

    it('handles empty technologies array', () => {
      const query: JobSearchQuery = {
        sources: ['linkedin'],
        poste: 'Developer',
        technologies: [],
        excludeTerms: [],
        remoteOnly: false,
      };

      const url = scraper.buildSearchUrl(query);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('keywords')).toBe('Developer');
    });
  });

  describe('extractJobListings', () => {
    it('extracts job listings from LinkedIn HTML structure', () => {
      const mockHtml = `
        <div class="jobs-search__results-list">
          <li>
            <h3 class="base-card__full-link">Senior React Developer</h3>
            <a class="base-card__full-link" href="/jobs/view/12345/"></a>
            <span class="base-search-card__subtitle">
              <a>Tech Corp</a>
            </span>
            <span class="job-card-container__metadata-item">Paris, France</span>
          </li>
          <li>
            <h3 class="base-card__full-link">Frontend Developer</h3>
            <a class="base-card__full-link" href="/jobs/view/67890/"></a>
            <span class="base-search-card__subtitle">
              <a>StartupXYZ</a>
            </span>
            <span class="job-card-container__metadata-item">Remote</span>
          </li>
        </div>
      `;

      const results = scraper.extractJobListings(mockHtml);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        url: 'https://www.linkedin.com/jobs/view/12345/',
        title: 'Senior React Developer',
        company: 'Tech Corp',
        location: 'Paris, France',
        source: 'linkedin',
      });
      expect(results[1]).toEqual({
        url: 'https://www.linkedin.com/jobs/view/67890/',
        title: 'Frontend Developer',
        company: 'StartupXYZ',
        location: 'Remote',
        source: 'linkedin',
      });
    });

    it('handles alternative HTML selectors', () => {
      const mockHtml = `
        <div>
          <div data-automation-id="job-card">
            <h3 data-automation-id="job-title">Backend Developer</h3>
            <a data-automation-id="job-title" href="/jobs/view/11111/"></a>
            <span data-automation-id="company-name">DevInc</span>
            <span data-automation-id="location">Lyon</span>
          </div>
        </div>
      `;

      const results = scraper.extractJobListings(mockHtml);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        url: 'https://www.linkedin.com/jobs/view/11111/',
        title: 'Backend Developer',
        company: 'DevInc',
        location: 'Lyon',
        source: 'linkedin',
      });
    });

    it('skips listings without title or URL', () => {
      const mockHtml = `
        <div class="jobs-search__results-list">
          <li>
            <span class="base-search-card__subtitle">
              <a>Tech Corp</a>
            </span>
          </li>
          <li>
            <h3 class="base-card__full-link">Some Job</h3>
          </li>
        </div>
      `;

      const results = scraper.extractJobListings(mockHtml);

      expect(results).toHaveLength(0);
    });

    it('handles empty HTML gracefully', () => {
      const results = scraper.extractJobListings('');
      expect(results).toHaveLength(0);
    });

    it('handles malformed HTML gracefully', () => {
      const mockHtml = '<div>Invalid HTML content</div>';
      const results = scraper.extractJobListings(mockHtml);
      expect(results).toHaveLength(0);
    });
  });

  describe('extractJobDetails', () => {
    it('extracts job details from LinkedIn job page HTML', () => {
      const mockHtml = `
        <div class="top-card-layout__card">
          <h2>Tech Company</h2>
        </div>
        <div class="description__text">
          <p>We are looking for a skilled React developer with experience in TypeScript and Node.js.</p>
          <p>This is a full-time position offering competitive salary.</p>
        </div>
        <div class="top-card-layout__secondary-text">
          <span>Paris, Île-de-France, France</span>
        </div>
      `;

      const details = scraper.extractJobDetails(mockHtml);

      expect(details.company).toBe('Tech Company');
      expect(details.description).toContain('skilled React developer');
      expect(details.description).toContain('TypeScript and Node.js');
      expect(details.location).toBe('Paris, Île-de-France, France');
    });

    it('handles alternative job detail selectors', () => {
      const mockHtml = `
        <div>
          <div data-automation-id="companyName">Alternate Company</div>
          <div class="show-more-less-html__markup">
            Job description with React skills required
          </div>
          <div data-automation-id="location">Marseille, France</div>
        </div>
      `;

      const details = scraper.extractJobDetails(mockHtml);

      expect(details.company).toBe('Alternate Company');
      expect(details.description).toContain('Job description with React skills');
      expect(details.location).toBe('Marseille, France');
    });

    it('provides fallback values when elements are missing', () => {
      const mockHtml = '<div>No job details here</div>';

      const details = scraper.extractJobDetails(mockHtml);

      expect(details.company).toBe('Company not found');
      expect(details.description).toBe('Description not available');
      expect(details.location).toBe('Location not specified');
    });

    it('handles empty HTML gracefully', () => {
      const details = scraper.extractJobDetails('');

      expect(details.company).toBe('Company not found');
      expect(details.description).toBe('Description not available');
      expect(details.location).toBe('Location not specified');
    });

    it('extracts partial information when some elements are present', () => {
      const mockHtml = `
        <div>
          <div class="top-card-layout__card">Available Company</div>
        </div>
      `;

      const details = scraper.extractJobDetails(mockHtml);

      expect(details.company).toBe('Available Company');
      expect(details.description).toBe('Description not available');
      expect(details.location).toBe('Location not specified');
    });
  });

  describe('integration with BaseScraper', () => {
    it('has correct source identifier', () => {
      expect(scraper.source).toBe('linkedin');
    });

    it('inherits BaseScraper methods', () => {
      expect(typeof scraper['cleanText']).toBe('function');
      expect(typeof scraper['buildFullUrl']).toBe('function');
      expect(typeof scraper['generateId']).toBe('function');
      expect(typeof scraper['extractSalary']).toBe('function');
      expect(typeof scraper['extractTechnologies']).toBe('function');
      expect(typeof scraper['extractContractType']).toBe('function');
      expect(typeof scraper['isRemote']).toBe('function');
      expect(typeof scraper.getJobDetails).toBe('function');
    });
  });
});
