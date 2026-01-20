# TODO - Job Finder Project

## 📋 Project Overview

**Current Status**: ~60% complete with solid foundation
**Architecture**: Next.js 15 + Firebase Functions + Supabase + Turborepo
**Priority**: Complete core functionality first, then enhance UX

---

## 🚀 Quick Wins (1-2 days each)

### 1. Complete Save Jobs Functionality

**File**: `apps/functions/src/index.ts`

```typescript
// Replace current saveJobHandler implementation
export const saveJobHandler = functions.https.onCall(async (request: any) => {
  const data = request.data as { userId: string; jobId: string; status?: string; notes?: string };
  try {
    // Get user ID from Firebase UID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', data.userId)
      .single();

    // Save to saved_jobs table
    await supabase.from('saved_jobs').insert({
      user_id: user.id,
      job_id: data.jobId,
      status: data.status || 'à postuler',
      notes: data.notes,
    });

    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Failed to save job', error);
  }
});
```

### 2. Fix JobCard Save Integration

**File**: `apps/web/src/components/JobCard.tsx`

```typescript
// Replace handleSave function with real API call
const handleSave = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    setIsSaving(true);
    if (isSaved) {
      await unsaveJob(user.uid, job.id);
      setIsSaved(false);
    } else {
      await saveJob(user.uid, job.id);
      setIsSaved(true);
    }
  } catch (error) {
    toast.error('Failed to save job');
  }
};
```

### 3. Implement Search History API

**File**: `apps/functions/src/index.ts`

```typescript
export const saveSearchHistoryHandler = functions.https.onCall(async (request: any) => {
  const { userId, query, resultsCount } = request.data;
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', userId)
      .single();

    await supabase.from('search_history').insert({
      user_id: user.id,
      query: JSON.stringify(query),
      results_count: resultsCount,
    });

    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Failed to save search history', error);
  }
});

export const getSearchHistoryHandler = functions.https.onCall(async (request: any) => {
  const { userId } = request.data;
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', userId)
      .single();

    const { data } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return { success: true, data };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Failed to get search history', error);
  }
});
```

### 4. Replace Mock Data in RecentSearches

**File**: `apps/web/src/components/RecentSearches.tsx`

```typescript
// Replace mock data with API call
useEffect(() => {
  const fetchSearchHistory = async () => {
    try {
      const result = await getSearchHistory(userId);
      setSearches(result.data || []);
    } catch (error) {
      console.error('Failed to fetch search history:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchSearchHistory();
}, [userId]);
```

---

## 🔧 Critical Fixes (2-3 days each)

### 5. Update Web Scrapers

**Files**: `apps/functions/src/scrapers/*.ts`

#### LinkedIn Scraper

- Test current selectors against live LinkedIn jobs page
- Update CSS selectors if needed
- Add proper error handling for blocked requests
- Implement user agent rotation

#### Indeed Scraper

- Test Indeed job search results page structure
- Update selectors for job listings
- Add pagination support
- Handle CAPTCHA detection

#### WelcomeToTheJungle Scraper

- Test current implementation
- Update selectors for job cards
- Add better error handling
- Implement rate limiting

### 6. Complete User Stats Implementation

**File**: `apps/web/src/components/StatsOverview.tsx`

```typescript
// Replace mock stats with real calculations
const fetchStats = async (userId: string) => {
  try {
    const { data: savedJobs } = await getSavedJobs(userId);
    const { data: searchHistory } = await getSearchHistory(userId);

    const stats = {
      totalSearches: searchHistory?.length || 0,
      savedJobs: savedJobs?.length || 0,
      applicationsSent: savedJobs?.filter((job) => job.status === 'envoyé').length || 0,
      responseRate: calculateResponseRate(savedJobs || []),
    };

    setStats(stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  } finally {
    setLoading(false);
  }
};
```

### 7. Add Environment Configuration

**Files**:

- `apps/functions/.env.local`
- `apps/web/.env.local`

```bash
# Firebase Functions environment
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
FIREBASE_PROJECT_ID=your_project_id

# Next.js environment
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 8. Implement Error Boundaries

**File**: `apps/web/src/components/ErrorBoundary.tsx`

```typescript
'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600">Please refresh the page and try again.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 📱 Mobile & PWA Enhancements (3-4 days each)

### 9. Improve Mobile Experience

**Files**: `apps/web/src/components/*.tsx`

#### Touch-Friendly Job Cards

- Increase tap targets for mobile
- Add swipe gestures for save/unsave
- Optimize text sizes for mobile screens
- Add haptic feedback

#### Mobile-Optimized Forms

- Better keyboard handling
- Auto-focus on first input
- Mobile-friendly date pickers
- Touch-optimized dropdowns

### 10. Offline Functionality

**File**: `apps/web/public/sw.js`

```javascript
// Service worker for offline functionality
const CACHE_NAME = 'job-finder-v1';
const urlsToCache = ['/', '/jobs', '/static/js/bundle.js', '/static/css/main.css'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
```

### 11. Push Notifications

**File**: `apps/web/src/lib/notifications.ts`

```typescript
// Push notification setup
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const showJobAlert = (job: JobListing) => {
  if (Notification.permission === 'granted') {
    new Notification('New Job Alert!', {
      body: `${job.title} at ${job.company}`,
      icon: '/icon-192x192.png',
      tag: job.id,
    });
  }
};
```

---

## 🧪 Testing & Quality (2-3 days each)

### 12. Component Tests

**File**: `apps/web/src/components/__tests__/JobCard.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { JobCard } from '../JobCard';

const mockJob = {
  id: '1',
  title: 'Senior React Developer',
  company: 'Tech Corp',
  description: 'Job description',
  url: 'https://example.com',
  location: 'Paris',
  country: 'France',
  source: 'linkedin' as const,
  technologies: ['React', 'TypeScript'],
  remote: false,
  postedAt: '2024-01-20',
  scrapedAt: '2024-01-20'
};

describe('JobCard', () => {
  it('renders job information correctly', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });

  it('handles save button click', () => {
    const mockOnSave = jest.fn();
    render(<JobCard job={mockJob} onSave={mockOnSave} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(mockJob.id);
  });
});
```

### 13. Scraper Tests

**File**: `apps/functions/src/__tests__/linkedin-scraper.test.ts`

```typescript
import { LinkedInScraper } from '../scrapers/linkedin-scraper';

describe('LinkedInScraper', () => {
  let scraper: LinkedInScraper;

  beforeEach(() => {
    scraper = new LinkedInScraper();
  });

  it('builds correct search URL', () => {
    const query = {
      sources: ['linkedin'],
      poste: 'React Developer',
      technologies: ['React'],
      location: 'Paris',
      excludeTerms: [],
      remoteOnly: false,
    };

    const url = scraper.buildSearchUrl(query);
    expect(url).toContain('keywords=React Developer React');
    expect(url).toContain('location=Paris');
  });

  it('extracts job listings from HTML', () => {
    const mockHTML = `
      <ul class="jobs-search__results-list">
        <li>
          <a class="base-card__full-link" href="/jobs/view/123">
            <h3>Senior React Developer</h3>
          </a>
          <span class="base-search-card__subtitle">
            <a> Tech Corp </a>
          </span>
        </li>
      </ul>
    `;

    const jobs = scraper.extractJobListings(mockHTML);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe('Senior React Developer');
    expect(jobs[0].company).toBe('Tech Corp');
  });
});
```

### 14. API Integration Tests

**File**: `apps/functions/src/__tests__/services/supabase.test.ts`

```typescript
import { saveJobToSupabase, getUserSavedJobs } from '../services/supabase';

describe('Supabase Service', () => {
  it('saves job to database', async () => {
    const mockJob = {
      id: 'test-job-1',
      title: 'Test Job',
      company: 'Test Company',
      description: 'Test Description',
      url: 'https://test.com',
      location: 'Paris',
      country: 'France',
      source: 'linkedin' as const,
      technologies: ['React'],
      remote: false,
      postedAt: '2024-01-20',
      scrapedAt: '2024-01-20',
    };

    await expect(saveJobToSupabase(mockJob)).resolves.not.toThrow();
  });

  it('retrieves user saved jobs', async () => {
    const userId = 'test-user-1';
    const savedJobs = await getUserSavedJobs(userId);

    expect(Array.isArray(savedJobs)).toBe(true);
  });
});
```

---

## 🚀 Deployment & Production (1-2 days each)

### 15. Configure Vercel Deployment

**File**: `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/web/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

### 16. Firebase Functions Deployment

```bash
# Deploy to production
firebase deploy --only functions

# Set environment variables
firebase functions:config:set supabase.url="your_url" supabase.key="your_key"
```

### 17. Monitoring Setup

**File**: `apps/functions/src/monitoring.ts`

```typescript
import * as functions from 'firebase-functions';

// Error reporting
export const reportError = functions.https.onCall(async (request: any) => {
  const { error, context } = request.data;

  // Log to Firebase console
  functions.logger.error('Client error:', { error, context });

  // Send to external monitoring (optional)
  // await sendToSentry(error, context);

  return { success: true };
});

// Performance monitoring
export const trackPerformance = functions.https.onCall(async (request: any) => {
  const { metric, value, tags } = request.data;

  functions.logger.info('Performance metric:', { metric, value, tags });

  return { success: true };
});
```

---

## 📊 Priority Matrix

| Task                    | Impact | Effort | Priority    |
| ----------------------- | ------ | ------ | ----------- |
| Complete Save Jobs      | High   | Low    | 🚀 Critical |
| Fix JobCard Integration | High   | Low    | 🚀 Critical |
| Search History API      | Medium | Low    | 🔥 High     |
| Update Scrapers         | High   | Medium | 🔥 High     |
| User Stats              | Medium | Medium | 📈 Medium   |
| Mobile UX               | High   | High   | 📈 Medium   |
| Testing Suite           | Medium | High   | 🧪 Medium   |
| Deployment              | High   | Low    | 🚀 Critical |

---

## 🎯 Success Metrics

### Week 1 (Core Functionality)

- [ ] Users can save/unsave jobs
- [ ] Search history persists
- [ ] Real stats display
- [ ] No mock data remaining

### Week 2 (Enhanced UX)

- [ ] Scrapers work reliably
- [ ] Mobile experience optimized
- [ ] Error handling robust
- [ ] Loading states implemented

### Week 3 (Production Ready)

- [ ] Test coverage > 80%
- [ ] Performance optimized
- [ ] Monitoring active
- [ ] Documentation complete

---

## 🛠️ Development Commands

```bash
# Development
npm run dev              # All packages
npm run dev:web         # Frontend only
npm run dev:functions    # Backend only

# Build & Test
npm run build           # All packages
npm run lint            # Lint all
npm run type-check      # Type check all

# Deployment
npm run deploy:web      # Vercel
npm run deploy:functions # Firebase
```

---

## 📝 Notes

- **Dependencies**: Check all packages are up to date
- **Security**: Review all environment variables and API keys
- **Performance**: Monitor bundle size and loading times
- **Accessibility**: Add ARIA labels and keyboard navigation
- **SEO**: Add meta tags and structured data

---

_Last Updated: 2024-01-20_
_Project Status: Active Development_
