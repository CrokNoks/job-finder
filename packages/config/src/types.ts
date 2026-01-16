export const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'job-finder-app',
  region: 'europe-west1',
};

export const supabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

export const puppeteerConfig = {
  defaultTimeout: 30000,
  navigationTimeout: 30000,
  launchOptions: {
    headless: true,
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--no-zygote',
    ],
  },
};

export const jobSources = {
  linkedin: {
    name: 'LinkedIn Jobs',
    baseUrl: 'https://www.linkedin.com/jobs',
    color: '#0077B5',
  },
  indeed: {
    name: 'Indeed',
    baseUrl: 'https://www.indeed.com',
    color: '#2557A7',
  },
  welcometothejungle: {
    name: 'Welcome to the Jungle',
    baseUrl: 'https://www.welcometothejungle.com',
    color: '#FF6B35',
  },
} as const;