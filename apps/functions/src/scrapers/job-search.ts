import { JobSearchQuery, JobListing } from '../types';
import { IScraper } from './base-scraper';
import { LinkedInScraper } from './linkedin-scraper';
import { IndeedScraper } from './indeed-scraper';
import { WelcomeToTheJungleScraper } from './welcometothejungle-scraper';
import axios from 'axios';

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];

const getRandomUserAgent = () => userAgents[Math.floor(Math.random() * userAgents.length)];

const axiosConfig = {
  headers: {
    'User-Agent': getRandomUserAgent(),
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    DNT: '1',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  },
  timeout: 15000,
};

class ScraperFactory {
  private static scrapers: Map<string, IScraper> = new Map<string, IScraper>();

  static getScraper(source: string): IScraper | undefined {
    return this.scrapers.get(source);
  }

  static getAllScrapers(): IScraper[] {
    return Array.from(this.scrapers.values());
  }

  static {
    // Initialize scrapers in static block
    this.scrapers.set('linkedin', new LinkedInScraper());
    this.scrapers.set('indeed', new IndeedScraper());
    this.scrapers.set('welcometothejungle', new WelcomeToTheJungleScraper());
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function searchJobs(query: JobSearchQuery): Promise<JobListing[]> {
  const allResults: JobListing[] = [];

  for (const source of query.sources) {
    try {
      const scraper = ScraperFactory.getScraper(source);
      if (!scraper) {
        console.warn(`Scraper not found for source: ${source}`);
        continue;
      }

      const results = await searchOnSource(scraper, query);
      allResults.push(...results);

      // Rate limiting between sources
      await delay(1000);
    } catch (error) {
      console.error(`Failed to search on ${source}:`, error);
    }
  }

  // Remove duplicates based on URL
  const uniqueResults = Array.from(new Map(allResults.map((job) => [job.url, job])).values());

  return uniqueResults;
}

async function searchOnSource(scraper: IScraper, query: JobSearchQuery): Promise<JobListing[]> {
  const searchUrl = scraper.buildSearchUrl(query);
  console.log(`Searching ${scraper.source} at: ${searchUrl}`);

  const response = await axios.get(searchUrl, axiosConfig);
  console.log(`Response status for ${scraper.source}: ${response.status}`);

  const partialJobs = scraper.extractJobListings(response.data);
  console.log(`Found ${partialJobs.length} raw results for ${scraper.source}`);

  // Visit each job page for more details
  const detailedResults = await Promise.all(
    partialJobs.slice(0, 20).map((partialJob) => scraper.getJobDetails(partialJob))
  );

  const validResults = detailedResults.filter((job): job is JobListing => job !== null);
  console.log(`Found ${validResults.length} valid results for ${scraper.source}`);

  return validResults;
}
