import { BaseScraper } from './base-scraper';
import { JobSearchQuery, JobListing } from '../types';
import * as cheerio from 'cheerio';

export class IndeedScraper extends BaseScraper {
  readonly source = 'indeed' as const;

  buildSearchUrl(query: JobSearchQuery): string {
    const keywords = [query.poste, ...query.technologies].join(' ');
    const params = new URLSearchParams({
      q: keywords,
      l: query.location || 'France',
      sort: 'date',
      fromage: '1', // Last 24 hours
      ...(query.remoteOnly && { filter: '6' }), // Remote filter
    });

    return `https://www.indeed.fr/jobs?${params.toString()}`;
  }

  extractJobListings(html: string): Partial<JobListing>[] {
    const $ = cheerio.load(html);
    const results: Partial<JobListing>[] = [];

    // Try multiple selectors for job cards
    const jobCards =
      $('.job_seen_beacon') ||
      $('[data-testid="job-card"]') ||
      $('.jobCard') ||
      $('.jobsearch-ResultsList li');

    jobCards.each((_, element) => {
      const $element = $(element);

      // Try multiple selectors for title
      const title =
        $element.find('.jobTitle').text().trim() ||
        $element.find('[data-testid="job-title"]').text().trim() ||
        $element.find('.jcs-JobTitle').text().trim() ||
        $element.find('h2').text().trim();

      // Try multiple selectors for URL
      const url =
        $element.find('.jcs-JobTitle').attr('href') ||
        $element.find('[data-testid="job-title"] a').attr('href') ||
        $element.find('a[href*="/viewjob"]').attr('href') ||
        $element.find('a').attr('href');

      // Try multiple selectors for company
      const company =
        $element.find('.companyName').text().trim() ||
        $element.find('[data-testid="company-name"]').text().trim() ||
        $element.find('.companyName span').text().trim();

      // Try multiple selectors for location
      const location =
        $element.find('.companyLocation').text().trim() ||
        $element.find('[data-testid="job-location"]').text().trim() ||
        $element.find('.job-location').text().trim();

      if (title && url) {
        results.push({
          url: this.buildFullUrl(url, 'https://www.indeed.fr'),
          title,
          company,
          location,
          source: this.source,
        });
      }
    });

    return results;
  }

  extractJobDetails(html: string): { company: string; description: string; location: string } {
    const $ = cheerio.load(html);

    // Try multiple selectors for company
    const company =
      $('[data-testid="inlineHeader-companyName"]').text().trim() ||
      $('.jobsearch-CompanyInfoWithoutHeaderImage').text().trim() ||
      $('.job-company-name').text().trim() ||
      $('.jobsearch-DesktopStickyContainer-companyRating div').text().trim();

    // Try multiple selectors for description
    const description =
      $('#jobDescriptionText').text().trim() ||
      $('#jobDescription').text().trim() ||
      $('.job-description').text().trim() ||
      $('[data-testid="jobsearch-JobComponent-description"]').text().trim();

    // Try multiple selectors for location
    const location =
      $('[data-testid="job-location"]').text().trim() ||
      $('.jobsearch-JobInfoHeader-item').text().trim() ||
      $('.job-location').text().trim() ||
      $('.jobsearch-JobInfoHeader-companyLocation').text().trim();

    return {
      company: company || 'Company not found',
      description: description || 'Description not available',
      location: location || 'Location not specified',
    };
  }
}
