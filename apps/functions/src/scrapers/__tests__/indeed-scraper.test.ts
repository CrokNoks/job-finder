import { IndeedScraper } from '../indeed-scraper';
import { JobSearchQuery } from '../../types';

describe('IndeedScraper', () => {
  let scraper: IndeedScraper;

  beforeEach(() => {
    scraper = new IndeedScraper();
  });

  describe('buildSearchUrl', () => {
    it('builds URL with basic query parameters', () => {
      const query: JobSearchQuery = {
        sources: ['indeed'],
        poste: 'React Developer',
        technologies: [],
        excludeTerms: [],
        remoteOnly: false,
      };

      const url = scraper.buildSearchUrl(query);
      const urlObj = new URL(url);

      expect(urlObj.origin).toBe('https://www.indeed.fr');
      expect(urlObj.pathname).toBe('/jobs');
      expect(urlObj.searchParams.get('q')).toBe('React Developer');
      expect(urlObj.searchParams.get('l')).toBe('France');
      expect(urlObj.searchParams.get('sort')).toBe('date');
      expect(urlObj.searchParams.get('fromage')).toBe('1');
    });

    it('includes technologies in keywords', () => {
      const query: JobSearchQuery = {
        sources: ['indeed'],
        poste: 'Developer',
        technologies: ['React', 'TypeScript'],
        excludeTerms: [],
        remoteOnly: false,
      };

      const url = scraper.buildSearchUrl(query);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('q')).toBe('Developer React TypeScript');
    });

    it('includes remote filter when remoteOnly is true', () => {
      const query: JobSearchQuery = {
        sources: ['indeed'],
        poste: 'Developer',
        technologies: [],
        excludeTerms: [],
        remoteOnly: true,
      };

      const url = scraper.buildSearchUrl(query);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('filter')).toBe('6');
    });

    it('uses custom location when provided', () => {
      const query: JobSearchQuery = {
        sources: ['indeed'],
        poste: 'Developer',
        technologies: [],
        excludeTerms: [],
        remoteOnly: false,
        location: 'Lyon',
      };

      const url = scraper.buildSearchUrl(query);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('l')).toBe('Lyon');
    });
  });

  describe('extractJobListings', () => {
    it('extracts job listings from Indeed HTML structure', () => {
      const mockHtml = `
        <div>
          <div class="job_seen_beacon">
            <h2 class="jobTitle">Senior React Developer</h2>
            <a class="jcs-JobTitle" href="/rc/clk?jk=12345"></a>
            <span class="companyName">Tech Corp</span>
            <span class="companyLocation">Paris, France</span>
          </div>
          <div class="job_seen_beacon">
            <h2 class="jobTitle">Frontend Developer</h2>
            <a class="jcs-JobTitle" href="/rc/clk?jk=67890"></a>
            <span class="companyName">StartupXYZ</span>
            <span class="companyLocation">Remote</span>
          </div>
        </div>
      `;

      const results = scraper.extractJobListings(mockHtml);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        url: 'https://www.indeed.fr/rc/clk?jk=12345',
        title: 'Senior React Developer',
        company: 'Tech Corp',
        location: 'Paris, France',
        source: 'indeed',
      });
      expect(results[1]).toEqual({
        url: 'https://www.indeed.fr/rc/clk?jk=67890',
        title: 'Frontend Developer',
        company: 'StartupXYZ',
        location: 'Remote',
        source: 'indeed',
      });
    });

    it('handles alternative HTML selectors', () => {
      const mockHtml = `
        <div>
          <div data-testid="job-card">
            <h2 data-testid="job-title">Backend Developer</h2>
            <a data-testid="job-title" href="/viewjob?jk=11111"></a>
            <span data-testid="company-name">DevInc</span>
            <span data-testid="job-location">Lyon</span>
          </div>
        </div>
      `;

      const results = scraper.extractJobListings(mockHtml);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        url: 'https://www.indeed.fr/viewjob?jk=11111',
        title: 'Backend Developer',
        company: 'DevInc',
        location: 'Lyon',
        source: 'indeed',
      });
    });

    it('skips listings without title or URL', () => {
      const mockHtml = `
        <div class="job_seen_beacon">
          <span class="companyName">Tech Corp</span>
        </div>
        <div class="job_seen_beacon">
          <h2 class="jobTitle">Some Job</h2>
        </div>
      `;

      const results = scraper.extractJobListings(mockHtml);

      expect(results).toHaveLength(0);
    });

    it('handles empty HTML gracefully', () => {
      const results = scraper.extractJobListings('');
      expect(results).toHaveLength(0);
    });
  });

  describe('extractJobDetails', () => {
    it('extracts job details from Indeed job page HTML', () => {
      const mockHtml = `
        <div>
          <div data-testid="inlineHeader-companyName">Tech Company</div>
          <div id="jobDescriptionText">
            <p>We are looking for a skilled React developer with experience in TypeScript and Node.js.</p>
            <p>This is a full-time position offering competitive salary.</p>
          </div>
          <div data-testid="job-location">Paris, Île-de-France, France</div>
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
          <div class="jobsearch-CompanyInfoWithoutHeaderImage">Alternate Company</div>
          <div id="jobDescription">Job description with React skills required</div>
          <div class="jobsearch-JobInfoHeader-item">Marseille, France</div>
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
  });

  describe('integration with BaseScraper', () => {
    it('has correct source identifier', () => {
      expect(scraper.source).toBe('indeed');
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
