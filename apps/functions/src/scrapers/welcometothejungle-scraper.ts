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
    });

    return `https://www.welcometothejungle.com/fr/jobs?${params.toString()}`;
  }

  extractJobListings(html: string): Partial<JobListing>[] {
    const $ = cheerio.load(html);
    const results: Partial<JobListing>[] = [];

    $('.wui-grid .wui-grid-item').each((_, element) => {
      const $element = $(element);
      const title =
        $element.find('.wh-jx-iboGJB').text().trim() ||
        $element.find('[data-testid="job-title"]').text().trim() ||
        $element.find('h3').text().trim();
      const url = $element.find('a').first().attr('href');
      const company =
        $element.find('.wh-jx-hfjyAG').text().trim() ||
        $element.find('[data-testid="company-name"]').text().trim();

      if (title && url) {
        results.push({
          url: this.buildFullUrl(url, 'https://www.welcometothejungle.com'),
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
      $('.wh-jx-hlXceE').text().trim() ||
      $('[data-testid="company-name"]').text().trim() ||
      $('.company-info h3').text().trim();

    const description =
      $('.wh-jx-jkMRMX').text().trim() ||
      $('[data-testid="job-description"]').text().trim() ||
      $('.description-section').text().trim();

    const location =
      $('.wh-jx-ehQYlW').text().trim() ||
      $('[data-testid="location"]').text().trim() ||
      $('.location-section').text().trim();

    return { company, description, location };
  }
}
