import { ReactElement } from 'react';
import { render, RenderOptions, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock JobListing for testing
export const mockJobListing = {
  id: 'test-job-1',
  title: 'Senior React Developer',
  company: 'Tech Corp',
  description: 'We are looking for a senior React developer...',
  location: 'Paris',
  country: 'France',
  url: 'https://example.com/job/1',
  source: 'linkedin' as const,
  salaryRange: '60k-80k€',
  salaryMin: 60000,
  salaryMax: 80000,
  remote: true,
  contractType: 'CDI',
  technologies: ['React', 'TypeScript', 'Node.js'],
  postedAt: new Date('2024-01-15').toISOString(),
  scrapedAt: new Date('2024-01-15').toISOString(),
};

// Mock JobSearchQuery for testing
export const mockJobSearchQuery = {
  sources: ['linkedin', 'indeed'] as const,
  poste: 'React Developer',
  technologies: ['React', 'TypeScript'],
  location: 'Paris',
  excludeTerms: ['stage', 'alternance'],
  remoteOnly: true,
  salaryMin: 50000,
};

// Mock SavedJob for testing
export const mockSavedJob = {
  id: 'saved-job-1',
  user_id: 'user-123',
  job_id: 'test-job-1',
  saved_at: new Date('2024-01-15').toISOString(),
};

// Test wrapper with React Query provider
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

// Custom render function with providers
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { screen, fireEvent, waitFor };
export { customRender as render };

// Mock user data
export const mockUser = {
  uid: 'user-123',
  email: 'test@example.com',
  displayName: 'Test User',
};

// Mock toast functions
export const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
};

// Helper to mock Firebase auth
export const mockFirebaseAuth = (user: any = null) => {
  const { auth } = require('@/lib/firebase');
  auth.currentUser = user;
};

// Helper to mock fetch responses
export const mockFetchResponse = (data: any, ok = true, status = 200) => {
  (global.fetch as any).mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
};
