# AGENTS.md

This file contains development guidelines and commands for working in this repository.

## Project Overview

Job Finder is a monorepo job search automation tool built with:

- **Frontend**: Next.js 15 + PWA (mobile-first)
- **Backend**: Firebase Functions 2nd Gen + Puppeteer
- **Database**: Supabase PostgreSQL
- **Build System**: Turborepo
- **Deployment**: Vercel (frontend) + Firebase Hosting

## Development Commands

### Root Commands (run from project root)

```bash
# Install dependencies across all packages
npm install

# Development (all packages)
npm run dev
turbo run dev

# Build all packages
npm run build
turbo run build

# Lint all packages
npm run lint
turbo run lint

# Type checking all packages
npm run type-check
turbo run type-check

# Clean build artifacts
npm run clean
turbo run clean
```

### Package-specific Commands

```bash
# Web frontend only
npm run dev:web          # cd apps/web && npm run dev
npm run build:web        # cd apps/web && npm run build

# Firebase Functions backend
npm run dev:functions     # cd apps/functions && npm run dev
npm run build:functions   # cd apps/functions && npm run build

# Single package development
cd apps/web && npm run dev
cd apps/functions && npm run dev
```

### Testing Commands

```bash
# Test single test file (add to package.json if needed)
cd apps/web && npm test -- --testPathPattern=filename.test.js
cd apps/functions && npm test -- --testPathPattern=filename.test.js

# Run tests in watch mode
cd apps/web && npm test -- --watch
cd apps/functions && npm test -- --watch
```

### Deployment Commands

```bash
# Deploy to production
npm run deploy:functions   # Firebase Functions
npm run deploy:web         # Vercel
```

## Code Style Guidelines

### TypeScript Configuration

- **Strict mode enabled** across all packages
- **Target**: ES2020 (web), CommonJS (functions)
- **Module resolution**: Node.js
- **Consistent casing**: Enforced
- **No implicit any**: Strict checking

### Import Patterns

```typescript
// Relative imports (same package)
import { Component } from './Component';

// Absolute imports (web app path aliases)
import { Component } from '@/components/Component';
import { lib } from '@/lib/api';

// Cross-package imports
import { JobListing } from '@shared/types';
import { config } from '@config/index';

// External libraries
import { useForm } from 'react-hook-form';
import { z } from 'zod';
```

### Naming Conventions

- **Components**: PascalCase with descriptive names (e.g., `JobSearchForm`, `StatsOverview`)
- **Functions**: camelCase with descriptive verbs (e.g., `searchJobs`, `getUserSavedJobs`)
- **Variables**: camelCase, meaningful names
- **Constants**: UPPER_SNAKE_CASE for environment/config values
- **Files**: kebab-case for components, camelCase for utilities
- **Types**: PascalCase for interfaces/types (e.g., `JobSearchQuery`, `JobListing`)

### Error Handling

```typescript
// Firebase Functions - proper error handling
try {
  const results = await someOperation();
  return { success: true, data: results };
} catch (error) {
  functions.logger.error('Operation failed:', error);
  throw new functions.https.HttpsError('internal', 'Operation failed', error);
}

// Frontend - user-friendly error handling
try {
  await searchJobs(data);
  toast.success('Search completed successfully!');
} catch (error) {
  toast.error('Search failed. Please try again.');
  console.error('Search error:', error);
}
```

### React Component Patterns

```typescript
// Functional components with TypeScript interfaces
interface ComponentProps {
  userId: string;
  onSubmit?: (data: FormData) => void;
}

export function Component({ userId, onSubmit }: ComponentProps) {
  // Hook usage at top level
  const [state, setState] = useState<Type>(initialValue);
  const { control, handleSubmit } = useForm<Type>();

  // Event handlers
  const handleSubmit = async (data: FormData) => {
    try {
      // Logic here
      onSubmit?.(data);
    } catch (error) {
      // Error handling
    }
  };

  return (
    <div className="component-styles">
      {/* JSX content */}
    </div>
  );
}

// Server Components (Next.js App Router)
export default async function ServerComponent() {
  // Server-side data fetching
  const user = await auth.currentUser;

  if (!user) {
    redirect('/login');
  }

  return <div>{/* JSX content */}</div>;
}
```

### Styling Guidelines

- **CSS Framework**: Tailwind CSS with custom utility classes
- **CSS Variables**: Use defined primary/secondary color palette
- **Component Classes**: Define reusable utility classes in globals.css
- **Responsive**: Mobile-first approach with Tailwind breakpoints
- **Dark Mode**: Not currently implemented

```css
/* Custom utility classes (apps/web/src/app/globals.css) */
.job-card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200;
}

.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200;
}
```

### Database/API Patterns

```typescript
// Type definitions (packages/shared/src/types.ts)
export interface JobListing {
  id: string;
  title: string;
  company: string;
  // ... other fields
}

// API calls with proper typing
export async function searchJobs(query: JobSearchQuery): Promise<JobListing[]> {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  return response.json();
}
```

## Environment Setup

### Required Environment Variables

Copy `.env.example` to `.env.local` and configure:

- Firebase credentials
- Supabase URL and keys
- Next.js public variables

### Prerequisites

- Node.js 18+
- Firebase CLI
- Supabase CLI
- npm 10.0.0 (package manager)

## Package Structure

```
job-finder/
├── apps/
│   ├── web/              # Next.js PWA application
│   └── functions/        # Firebase Functions backend
├── packages/
│   ├── shared/          # Shared types and utilities
│   └── config/          # Shared configuration
└── turbo.json          # Turborepo configuration
```

## Testing Strategy

When adding tests:

- Use Jest/React Testing Library for web components
- Use Jest for Firebase Functions unit tests
- Test error handling scenarios
- Test both success and failure cases
- Mock external dependencies (Supabase, Firebase)

## Performance Considerations

- Use React.memo() for expensive components
- Implement proper loading states with skeleton screens
- Use Next.js Image optimization for images
- Leverage Firebase Functions memory allocation for Puppeteer tasks
- Implement proper caching strategies

## Security Guidelines

- Never commit secrets or API keys
- Use environment variables for all configuration
- Validate all user inputs with Zod schemas
- Implement proper authentication checks
- Use Supabase RLS policies for data access control

## Common Patterns

### Form Handling (react-hook-form + Zod)

```typescript
const schema = z.object({
  field: z.string().min(1, 'Required'),
});

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(schema),
});
```

### Toast Notifications

```typescript
import toast from 'react-hot-toast';
toast.success('Success message');
toast.error('Error message');
```

### Data Fetching

```typescript
// Server-side (App Router)
const data = await fetchData();

// Client-side
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetchData()
    .then(setData)
    .finally(() => setLoading(false));
}, []);
```
