import { BaseScraper } from './base-scraper';
import { JobSearchQuery, JobListing } from '../types';
import * as cheerio from 'cheerio';

export class WelcomeToTheJungleScraper extends BaseScraper {
  readonly source = 'welcometothejungle' as const;

  buildSearchUrl(query: JobSearchQuery): string {
    const keywords = [query.poste, ...query.technologies].join(' ');
    const params = new URLSearchParams({
      query: keywords,
      location: query.location || 'France',
      ...(query.remoteOnly && { contract_type: 'FULL_TIME_REMOTE' }),
      page: '1',
    });

    return `https://www.welcometothejungle.com/fr/jobs?${params.toString()}`;
  }

  extractJobListings(html: string): Partial<JobListing>[] {
    const $ = cheerio.load(html);
    const results: Partial<JobListing>[] = [];

    // Try multiple selectors for job cards
    const jobCards =
      $('.wui-grid .wui-grid-item') ||
      $('[data-testid="job-card"]') ||
      $('.job-card') ||
      $('article') ||
      $('.sc-1g0y0qj-0');

    jobCards.each((_, element) => {
      const $element = $(element);

      // Try multiple selectors for title
      const title =
        $element.find('.wh-jx-iboGJB').text().trim() ||
        $element.find('[data-testid="job-title"]').text().trim() ||
        $element.find('h3').text().trim() ||
        $element.find('h4').text().trim() ||
        $element.find('.sc-1b9rrsc-0').text().trim();

      // Try multiple selectors for URL
      const url =
        $element.find('a').first().attr('href') ||
        $element.find('[href*="/fr/companies/"]').attr('href') ||
        $element.find('a[href*="/jobs/"]').attr('href');

      // Try multiple selectors for company
      const company =
        $element.find('.wh-jx-hfjyAG').text().trim() ||
        $element.find('[data-testid="company-name"]').text().trim() ||
        $element.find('.company-name').text().trim() ||
        $element.find('.sc-1g0y0qj-1').text().trim();

      // Try multiple selectors for location
      const location =
        $element.find('.location').text().trim() ||
        $element.find('[data-testid="location"]').text().trim() ||
        $element.find('.job-location').text().trim();

      if (title && url) {
        results.push({
          url: this.buildFullUrl(url, 'https://www.welcometothejungle.com'),
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
      $('.wh-jx-hlXceE').text().trim() ||
      $('[data-testid="company-name"]').text().trim() ||
      $('.company-info h3').text().trim() ||
      $('.sc-1b9rrsc-2').text().trim() ||
      $('.sc-1f14bvs-3').text().trim();

    // Try multiple selectors for description
    const description =
      $('.wh-jx-jkMRMX').text().trim() ||
      $('[data-testid="job-description"]').text().trim() ||
      $('.description-section').text().trim() ||
      $('.sc-1b9rrsc-4').text().trim() ||
      $('section[class*="description"]').text().trim();

    // Try multiple selectors for location
    const location =
      $('.wh-jx-ehQYlW').text().trim() ||
      $('[data-testid="location"]').text().trim() ||
      $('.location-section').text().trim() ||
      $('.sc-1b9rrsc-5').text().trim() ||
      $('div[class*="location"]').text().trim();

    return {
      company: company || 'Company not found',
      description: description || 'Description not available',
      location: location || 'Location not specified',
    };
  }
}
