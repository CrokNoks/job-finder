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
      ...(query.remoteOnly && { filter: '3' }), // Remote filter
    });

    return `https://www.indeed.com/jobs?${params.toString()}`;
  }

  extractJobListings(html: string): Partial<JobListing>[] {
    const $ = cheerio.load(html);
    const results: Partial<JobListing>[] = [];

    $('.job_seen_beacon').each((_, element) => {
      const $element = $(element);
      const title =
        $element.find('.jobTitle').text().trim() ||
        $element.find('[data-testid="job-title"]').text().trim();
      const url =
        $element.find('.jcs-JobTitle').attr('href') ||
        $element.find('[data-testid="job-title"] a').attr('href');
      const company =
        $element.find('.companyName').text().trim() ||
        $element.find('[data-testid="company-name"]').text().trim();

      if (title && url) {
        results.push({
          url: this.buildFullUrl(url, 'https://www.indeed.com'),
          title,
          source: this.source,
        });
      }
    });

    return results;
  }

  extractJobDetails(html: string): { company: string; description: string; location: string } {
    const $ = cheerio.load(html);

    const company =
      $('[data-testid="inlineHeader-companyName"]').text().trim() ||
      $('.jobsearch-CompanyInfoWithoutHeaderImage').text().trim() ||
      $('.job-company-name').text().trim();

    const description =
      $('#jobDescriptionText').text().trim() ||
      $('#jobDescription').text().trim() ||
      $('.job-description').text().trim();

    const location =
      $('[data-testid="job-location"]').text().trim() ||
      $('.jobsearch-JobInfoHeader-item').text().trim() ||
      $('.job-location').text().trim();

    return { company, description, location };
  }
}
