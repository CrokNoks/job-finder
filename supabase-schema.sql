-- Drop tables if they exist (for development)
DROP TABLE IF EXISTS search_history CASCADE;
DROP TABLE IF EXISTS job_alerts CASCADE;
DROP TABLE IF EXISTS saved_jobs CASCADE;
DROP TABLE IF EXISTS job_listings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  preferred_technologies TEXT[],
  preferred_locations TEXT[],
  salary_min INTEGER,
  remote_preference BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Job listings table
CREATE TABLE job_listings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT,
  description TEXT,
  url TEXT UNIQUE NOT NULL,
  salary_range TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  location TEXT,
  country TEXT DEFAULT 'France',
  source TEXT NOT NULL CHECK (source IN ('linkedin', 'indeed', 'welcometothejungle')),
  technologies TEXT[],
  remote BOOLEAN DEFAULT false,
  contract_type TEXT,
  posted_at TIMESTAMP,
  scraped_at TIMESTAMP DEFAULT NOW()
);

-- Saved jobs table
CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id TEXT REFERENCES job_listings(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'à postuler' CHECK (status IN ('à postuler', 'envoyé', 'entretien', 'refusé', 'accepté')),
  notes TEXT,
  tags TEXT[],
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Job alerts table
CREATE TABLE job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query JSONB NOT NULL,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('hourly', 'daily', 'weekly')),
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Search history table
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query JSONB NOT NULL,
  results_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_job_listings_source ON job_listings(source);
CREATE INDEX idx_job_listings_location ON job_listings(location);
CREATE INDEX idx_job_listings_technologies ON job_listings USING GIN(technologies);
CREATE INDEX idx_job_listings_posted_at ON job_listings(posted_at DESC);
CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX idx_saved_jobs_status ON saved_jobs(status);
CREATE INDEX idx_job_alerts_user_id ON job_alerts(user_id);
CREATE INDEX idx_job_alerts_is_active ON job_alerts(is_active);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_jobs_updated_at BEFORE UPDATE ON saved_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_alerts_updated_at BEFORE UPDATE ON job_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();