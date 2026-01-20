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

    $('.jobs-search__results-list li').each((_, element) => {
      const $element = $(element);
      const title = $element.find('.base-card__full-link').text().trim();
      const url = $element.find('.base-card__full-link').attr('href');
      const company = $element.find('.base-search-card__subtitle a').text().trim();

      if (title && url) {
        results.push({
          url: this.buildFullUrl(url, 'https://www.linkedin.com'),
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
      $('.top-card-layout__card').text().trim() ||
      $('[data-automation-id="companyName"]').text().trim() ||
      $('.job-details-jobs-unified-top-card__company-name a').text().trim();

    const description =
      $('.description__text').text().trim() ||
      $('.show-more-less-html__markup').text().trim() ||
      $('.jobs-description__content').text().trim();

    const location =
      $('.top-card-layout__secondary-text').text().trim() ||
      $('[data-automation-id="location"]').text().trim() ||
      $('.job-details-jobs-unified-top-card__bullet-item-v2').first().text().trim();

    return { company, description, location };
  }
}
