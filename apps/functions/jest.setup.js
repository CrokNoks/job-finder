// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(() => Promise.resolve({ data: () => ({}) })),
        update: jest.fn(),
        delete: jest.fn(),
      })),
      add: jest.fn(),
      where: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ docs: [] })),
      })),
      get: jest.fn(() => Promise.resolve({ docs: [] })),
    })),
  })),
  functions: {
    https: {
      HttpsError: class HttpsError extends Error {
        constructor(code, message) {
          super(message);
          this.code = code;
        }
      },
    },
  },
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
      update: jest.fn(() => Promise.resolve({ data: [], error: null })),
      delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
      upsert: jest.fn(() => Promise.resolve({ data: [], error: null })),
      eq: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        update: jest.fn(() => Promise.resolve({ data: [], error: null })),
        delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  })),
}));

// Mock Axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: '' })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));

// Mock Cheerio
jest.mock('cheerio', () => ({
  load: jest.fn(() => ({
    find: jest.fn(() => ({
      text: jest.fn(() => ''),
      attr: jest.fn(() => ''),
      each: jest.fn(),
    })),
    text: jest.fn(() => ''),
  })),
}));
