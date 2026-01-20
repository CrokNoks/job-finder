import { searchJobsHandler } from '../index';

// Mock Firebase Functions
jest.mock('firebase-functions', () => ({
  https: {
    onRequest: jest.fn((handler) => handler),
    onCall: jest.fn((handler) => handler),
  },
}));

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
}));

// Mock scrapers
jest.mock('../scrapers/linkedin-scraper', () => ({
  LinkedInScraper: jest.fn().mockImplementation(() => ({
    source: 'linkedin',
    buildSearchUrl: jest.fn().mockReturnValue('https://linkedin.com/jobs'),
    extractJobListings: jest.fn().mockReturnValue([]),
    getJobDetails: jest.fn().mockResolvedValue(null),
  })),
}));

jest.mock('../scrapers/indeed-scraper', () => ({
  IndeedScraper: jest.fn().mockImplementation(() => ({
    source: 'indeed',
    buildSearchUrl: jest.fn().mockReturnValue('https://indeed.com/jobs'),
    extractJobListings: jest.fn().mockReturnValue([]),
    getJobDetails: jest.fn().mockResolvedValue(null),
  })),
}));

jest.mock('../scrapers/welcometothejungle-scraper', () => ({
  WelcomeToTheJungleScraper: jest.fn().mockImplementation(() => ({
    source: 'welcometothejungle',
    buildSearchUrl: jest.fn().mockReturnValue('https://welcometothejungle.com/jobs'),
    extractJobListings: jest.fn().mockReturnValue([]),
    getJobDetails: jest.fn().mockResolvedValue(null),
  })),
}));

describe('Firebase Functions', () => {
  describe('searchJobsHandler', () => {
    let mockRequest: any;
    let mockResponse: any;
    let mockData: any;

    beforeEach(() => {
      mockRequest = {
        body: {},
        method: 'POST',
        headers: {},
      };

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      mockData = {
        sources: ['linkedin'],
        poste: 'React Developer',
        technologies: ['React'],
        excludeTerms: ['stage'],
        remoteOnly: false,
      };

      // Mock axios for HTTP requests
      jest.mock('axios', () => ({
        get: jest.fn().mockResolvedValue({ data: '' }),
      }));
    });

    it('rejects non-POST requests', async () => {
      mockRequest.method = 'GET';

      await searchJobsHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(405);
      expect(mockResponse.send).toHaveBeenCalledWith('Method not allowed');
    });

    it('handles valid search request', async () => {
      mockRequest.body = mockData;

      await searchJobsHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array),
        count: expect.any(Number),
      });
    });

    it('handles multiple sources', async () => {
      mockRequest.body = {
        ...mockData,
        sources: ['linkedin', 'indeed', 'welcometothejungle'],
      };

      await searchJobsHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('handles errors gracefully', async () => {
      mockRequest.body = mockData;

      // Mock an error in scraping
      const { LinkedInScraper } = require('../scrapers/linkedin-scraper');
      LinkedInScraper.mockImplementation(() => {
        throw new Error('Scraper error');
      });

      await searchJobsHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to search jobs',
      });
    });

    it('filters out exclude terms', async () => {
      mockRequest.body = {
        ...mockData,
        excludeTerms: ['stage', 'alternance', 'internship'],
      };

      await searchJobsHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('applies remote filter correctly', async () => {
      mockRequest.body = {
        ...mockData,
        remoteOnly: true,
      };

      await searchJobsHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});
