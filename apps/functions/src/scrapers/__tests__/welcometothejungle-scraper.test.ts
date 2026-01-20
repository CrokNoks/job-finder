import { WelcomeToTheJungleScraper } from '../welcometothejungle-scraper';
import { JobSearchQuery } from '../../types';

describe('WelcomeToTheJungleScraper', () => {
  let scraper: WelcomeToTheJungleScraper;

  beforeEach(() => {
    scraper = new WelcomeToTheJungleScraper();
  });

  describe('buildSearchUrl', () => {
    it('builds URL with basic query parameters', () => {
      const query: JobSearchQuery = {
        sources: ['welcometothejungle'],
        poste: 'React Developer',
        technologies: [],
        excludeTerms: [],
        remoteOnly: false,
      };

      const url = scraper.buildSearchUrl(query);
      const urlObj = new URL(url);

      expect(urlObj.origin).toBe('https://www.welcometothejungle.com');
      expect(urlObj.pathname).toBe('/fr/jobs');
      expect(urlObj.searchParams.get('query')).toBe('React Developer');
      expect(urlObj.searchParams.get('location')).toBe('France');
      expect(urlObj.searchParams.get('page')).toBe('1');
    });

    it('includes technologies in query', () => {
      const query: JobSearchQuery = {
        sources: ['welcometothejungle'],
        poste: 'Developer',
        technologies: ['React', 'TypeScript'],
        excludeTerms: [],
        remoteOnly: false,
      };

      const url = scraper.buildSearchUrl(query);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('query')).toBe('Developer React TypeScript');
    });

    it('includes remote filter when remoteOnly is true', () => {
      const query: JobSearchQuery = {
        sources: ['welcometothejungle'],
        poste: 'Developer',
        technologies: [],
        excludeTerms: [],
        remoteOnly: true,
      };

      const url = scraper.buildSearchUrl(query);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('contract_type')).toBe('FULL_TIME_REMOTE');
    });

    it('uses custom location when provided', () => {
      const query: JobSearchQuery = {
        sources: ['welcometothejungle'],
        poste: 'Developer',
        technologies: [],
        excludeTerms: [],
        remoteOnly: false,
        location: 'Lyon',
      };

      const url = scraper.buildSearchUrl(query);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('location')).toBe('Lyon');
    });
  });

  describe('extractJobListings', () => {
    it('extracts job listings from WTTJ HTML structure', () => {
      const mockHtml = `
        <div class="wui-grid">
          <div class="wui-grid-item">
            <h3 class="wh-jx-iboGJB">Senior React Developer</h3>
            <a href="/fr/companies/tech-corp/jobs/senior-react-developer"></a>
            <span class="wh-jx-hfjyAG">Tech Corp</span>
            <span class="location">Paris, France</span>
          </div>
          <div class="wui-grid-item">
            <h3 class="wh-jx-iboGJB">Frontend Developer</h3>
            <a href="/fr/companies/startupxyz/jobs/frontend-developer"></a>
            <span class="wh-jx-hfjyAG">StartupXYZ</span>
            <span class="location">Remote</span>
          </div>
        </div>
      `;

      const results = scraper.extractJobListings(mockHtml);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        url: 'https://www.welcometothejungle.com/fr/companies/tech-corp/jobs/senior-react-developer',
        title: 'Senior React Developer',
        company: 'Tech Corp',
        location: 'Paris, France',
        source: 'welcometothejungle',
      });
      expect(results[1]).toEqual({
        url: 'https://www.welcometothejungle.com/fr/companies/startupxyz/jobs/frontend-developer',
        title: 'Frontend Developer',
        company: 'StartupXYZ',
        location: 'Remote',
        source: 'welcometothejungle',
      });
    });

    it('handles alternative HTML selectors', () => {
      const mockHtml = `
        <div>
          <div data-testid="job-card">
            <h4>Backend Developer</h4>
            <a href="/fr/jobs/backend-developer"></a>
            <span data-testid="company-name">DevInc</span>
            <span data-testid="location">Lyon</span>
          </div>
        </div>
      `;

      const results = scraper.extractJobListings(mockHtml);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        url: 'https://www.welcometothejungle.com/fr/jobs/backend-developer',
        title: 'Backend Developer',
        company: 'DevInc',
        location: 'Lyon',
        source: 'welcometothejungle',
      });
    });

    it('skips listings without title or URL', () => {
      const mockHtml = `
        <div class="wui-grid">
          <div class="wui-grid-item">
            <span class="wh-jx-hfjyAG">Tech Corp</span>
          </div>
          <div class="wui-grid-item">
            <h3 class="wh-jx-iboGJB">Some Job</h3>
          </div>
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
    it('extracts job details from WTTJ job page HTML', () => {
      const mockHtml = `
        <div>
          <div class="wh-jx-hlXceE">Tech Company</div>
          <div class="wh-jx-jkMRMX">
            <p>We are looking for a skilled React developer with experience in TypeScript and Node.js.</p>
            <p>This is a full-time position offering competitive salary.</p>
          </div>
          <div class="wh-jx-ehQYlW">Paris, Île-de-France, France</div>
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
          <div data-testid="company-name">Alternate Company</div>
          <div class="description-section">Job description with React skills required</div>
          <div class="location-section">Marseille, France</div>
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
      expect(scraper.source).toBe('welcometothejungle');
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
