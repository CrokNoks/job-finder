import { BaseScraper } from './base-scraper';
import { JobSearchQuery, JobListing } from '../types';
import * as cheerio from 'cheerio';

export class LinkedInScraper extends BaseScraper {
  readonly source = 'linkedin' as const;

  buildSearchUrl(query: JobSearchQuery): string {
    const keywords = [query.poste, ...query.technologies].join(' ');
    const params = new URLSearchParams({
      keywords,
      location: query.location || 'France',
      f_TPR: 'r86400', // Last 24 hours
      ...(query.remoteOnly && { f_WT: '2' }), // Remote filter
    });

    return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
  }

  extractJobListings(html: string): Partial<JobListing>[] {
    const $ = cheerio.load(html);
    const results: Partial<JobListing>[] = [];

    // Try multiple selectors for job listings
    const jobCards =
      $('.jobs-search__results-list li') ||
      $('[data-automation-id="job-card"]') ||
      $('.job-card-container') ||
      $('.job-search-card');

    jobCards.each((_, element) => {
      const $element = $(element);

      // Try multiple selectors for title
      const title =
        $element.find('.base-card__full-link').text().trim() ||
        $element.find('[data-automation-id="job-title"]').text().trim() ||
        $element.find('.job-card-list__title').text().trim() ||
        $element.find('h3').text().trim();

      // Try multiple selectors for URL
      const url =
        $element.find('.base-card__full-link').attr('href') ||
        $element.find('[data-automation-id="job-title"]').attr('href') ||
        $element.find('a[href*="/jobs/view/"]').attr('href');

      // Try multiple selectors for company
      const company =
        $element.find('.base-search-card__subtitle a').text().trim() ||
        $element.find('[data-automation-id="company-name"]').text().trim() ||
        $element.find('.job-card-container__company-name').text().trim();

      // Try multiple selectors for location
      const location =
        $element.find('.job-card-container__metadata-item').text().trim() ||
        $element.find('[data-automation-id="location"]').text().trim() ||
        $element.find('.job-card-list__location').text().trim();

      if (title && url) {
        results.push({
          url: this.buildFullUrl(url, 'https://www.linkedin.com'),
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
      $('.top-card-layout__card').text().trim() ||
      $('[data-automation-id="companyName"]').text().trim() ||
      $('.job-details-jobs-unified-top-card__company-name a').text().trim() ||
      $('.top-v2-job-card__company-name').text().trim() ||
      $('.job-details-top-card__company-info').text().trim();

    // Try multiple selectors for description
    const description =
      $('.description__text').text().trim() ||
      $('.show-more-less-html__markup').text().trim() ||
      $('.jobs-description__content').text().trim() ||
      $('[data-automation-id="job-description"]').text().trim() ||
      $('.job-details__main-content').text().trim();

    // Try multiple selectors for location
    const location =
      $('.top-card-layout__secondary-text').text().trim() ||
      $('[data-automation-id="location"]').text().trim() ||
      $('.job-details-jobs-unified-top-card__bullet-item-v2').first().text().trim() ||
      $('.top-v2-job-card__location').text().trim() ||
      $('.job-details-top-card__job-location').text().trim();

    return {
      company: company || 'Company not found',
      description: description || 'Description not available',
      location: location || 'Location not specified',
    };
  }
}
