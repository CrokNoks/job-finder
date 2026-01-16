import puppeteer, {Browser, Page} from 'puppeteer';
import {JobSearchQuery, JobListing} from '@shared/types';
import {searchMappings, delay, cleanText, extractSalary} from '@shared/utils';

const LAUNCH_OPTIONS = {
  headless: true,
  timeout: 0,
  args: [
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--no-first-run',
    '--no-sandbox',
    '--no-zygote',
    '--window-size=1280,720',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ],
};

export async function searchJobs(query: JobSearchQuery): Promise<JobListing[]> {
  const browser = await puppeteer.launch(LAUNCH_OPTIONS);
  const allResults: JobListing[] = [];

  try {
    for (const source of query.sources) {
      const results = await searchOnSource(browser, source, query);
      allResults.push(...results);
      
      // Rate limiting between sources
      await delay(2000);
    }
  } finally {
    await browser.close();
  }

  // Remove duplicates based on URL
  const uniqueResults = Array.from(
    new Map(allResults.map(job => [job.url, job])).values()
  );

  return uniqueResults;
}

async function searchOnSource(
  browser: Browser,
  source: 'linkedin' | 'indeed' | 'welcometothejungle',
  query: JobSearchQuery
): Promise<JobListing[]> {
  const page = await browser.newPage();
  
  // Block unnecessary resources for faster loading
  await page.setRequestInterception(true);
  const blockedTypes = ['image', 'font', 'media', 'stylesheet'];
  page.on('request', (req) => {
    if (blockedTypes.includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  try {
    const searchQuery = searchMappings[source](query);
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=10`;
    
    await page.goto(googleUrl, {waitUntil: 'networkidle2'});
    await delay(1000);

    const results = await extractJobResults(page, source);
    
    // Visit each job page for more details
    const detailedResults = await Promise.all(
      results.slice(0, 5).map(result => getJobDetails(page, result))
    );

    return detailedResults.filter(Boolean);
  } finally {
    await page.close();
  }
}

async function extractJobResults(page: Page, source: string): Promise<Partial<JobListing>[]> {
  return await page.evaluate((source) => {
    const results: any[] = [];
    const searchResults = document.querySelectorAll('.g');
    
    searchResults.forEach((result) => {
      const link = result.querySelector('a');
      const title = result.querySelector('h3');
      
      if (link && title && link.href) {
        results.push({
          url: link.href,
          title: title.textContent?.trim(),
          source,
        });
      }
    });
    
    return results;
  }, source);
}

async function getJobDetails(page: Page, partialJob: Partial<JobListing>): Promise<JobListing | null> {
  if (!partialJob.url || !partialJob.title || !partialJob.source) {
    return null;
  }

  try {
    await page.goto(partialJob.url, {waitUntil: 'networkidle2'});
    await delay(2000);

    const details = await page.evaluate((source) => {
      // LinkedIn-specific selectors
      if (source === 'linkedin') {
        const company = document.querySelector('.topcard-layout__card')?.textContent?.trim();
        const description = document.querySelector('.description__text')?.textContent?.trim();
        const location = document.querySelector('.topcard__flavor-row')?.textContent?.trim();
        
        return {company, description, location};
      }
      
      // Indeed-specific selectors
      if (source === 'indeed') {
        const company = document.querySelector('[data-testid="inlineHeader-companyName"]')?.textContent?.trim();
        const description = document.querySelector('#jobDescriptionText')?.textContent?.trim();
        const location = document.querySelector('[data-testid="job-location"]')?.textContent?.trim();
        
        return {company, description, location};
      }
      
      // Welcome to the Jungle-specific selectors
      if (source === 'welcometothejungle') {
        const company = document.querySelector('.wh-jx-hlXceE')?.textContent?.trim();
        const description = document.querySelector('.wh-jx-jkMRMX')?.textContent?.trim();
        const location = document.querySelector('.wh-jx-ehQYlW')?.textContent?.trim();
        
        return {company, description, location};
      }
      
      return {};
    }, partialJob.source);

    const salary = extractSalary(details.description || '');
    
    return {
      id: generateId(partialJob.url),
      title: cleanText(partialJob.title),
      company: cleanText(details.company || ''),
      description: cleanText(details.description || ''),
      url: partialJob.url,
      salaryRange: salary.range,
      salaryMin: salary.min,
      salaryMax: salary.max,
      location: cleanText(details.location || 'France'),
      country: 'France',
      source: partialJob.source,
      technologies: [], // Will be extracted later
      remote: false, // Will be detected later
      contractType: '', // Will be extracted later
      postedAt: new Date().toISOString(),
      scrapedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to get job details for:', partialJob.url, error);
    return null;
  }
}

function generateId(url: string): string {
  return Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
}