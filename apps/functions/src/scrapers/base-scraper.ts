import { JobSearchQuery, JobListing } from '../types';

export interface IScraper {
  readonly source: 'linkedin' | 'indeed' | 'welcometothejungle';
  buildSearchUrl(query: JobSearchQuery): string;
  extractJobListings(html: string): Partial<JobListing>[];
  extractJobDetails(html: string): { company: string; description: string; location: string };
  getJobDetails(partialJob: Partial<JobListing>): Promise<JobListing | null>;
}

export abstract class BaseScraper implements IScraper {
  abstract readonly source: 'linkedin' | 'indeed' | 'welcometothejungle';

  abstract buildSearchUrl(query: JobSearchQuery): string;
  abstract extractJobListings(html: string): Partial<JobListing>[];
  abstract extractJobDetails(html: string): {
    company: string;
    description: string;
    location: string;
  };

  protected cleanText(text?: string | null): string {
    return text?.trim().replace(/\s+/g, ' ') || '';
  }

  protected buildFullUrl(url: string, baseUrl: string): string {
    return url.startsWith('http') ? url : `${baseUrl}${url}`;
  }

  protected generateId(url: string): string {
    return Buffer.from(url)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 16);
  }

  protected extractSalary(text: string): { min?: number; max?: number; range?: string } {
    const salaryRegex = /(\d{2,3})[kK](?:\s*-\s*(\d{2,3})[kK])?(?:\s*€)?/g;
    const matches = [...text.matchAll(salaryRegex)];

    if (matches.length === 0) return {};

    const [match] = matches;
    const min = parseInt(match[1]) * 1000;
    const max = match[2] ? parseInt(match[2]) * 1000 : min;

    return {
      min,
      max,
      range: match[0],
    };
  }

  protected extractTechnologies(description: string, title: string): string[] {
    const techKeywords = [
      'react',
      'vue',
      'angular',
      'node',
      'python',
      'java',
      'javascript',
      'typescript',
      'docker',
      'kubernetes',
      'aws',
      'azure',
      'gcp',
      'mongodb',
      'postgresql',
      'mysql',
      'graphql',
      'rest api',
      'git',
      'ci/cd',
      'jenkins',
      'terraform',
      'ansible',
    ];

    const text = (description + ' ' + title).toLowerCase();
    return techKeywords.filter((tech) => text.includes(tech));
  }

  protected extractContractType(description: string): string {
    const contractTypes = ['CDI', 'CDD', 'alternance', 'stage', 'freelance', 'intérim'];
    const text = description.toLowerCase();

    for (const type of contractTypes) {
      if (text.includes(type.toLowerCase())) {
        return type;
      }
    }

    return '';
  }

  protected isRemote(description: string): boolean {
    const text = description.toLowerCase();
    return text.includes('remote') || text.includes('télétravail');
  }

  public async getJobDetails(partialJob: Partial<JobListing>): Promise<JobListing | null> {
    if (!partialJob.url || !partialJob.title || !partialJob.source) {
      return null;
    }

    try {
      const axios = require('axios');
      const cheerio = require('cheerio');

      const response = await axios.get(partialJob.url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const details = this.extractJobDetails($.html());

      const salary = this.extractSalary(details.description || '');

      return {
        id: this.generateId(partialJob.url),
        title: this.cleanText(partialJob.title),
        company: this.cleanText(details.company),
        description: this.cleanText(details.description),
        url: partialJob.url,
        salaryRange: salary.range,
        salaryMin: salary.min,
        salaryMax: salary.max,
        location: this.cleanText(details.location || 'France'),
        country: 'France',
        source: partialJob.source,
        technologies: this.extractTechnologies(details.description, partialJob.title),
        remote: this.isRemote(details.description),
        contractType: this.extractContractType(details.description),
        postedAt: new Date().toISOString(),
        scrapedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Failed to get job details for ${partialJob.source}:`, partialJob.url, error);
      return null;
    }
  }
}
