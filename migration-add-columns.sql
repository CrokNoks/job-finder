-- Migration pour ajouter les colonnes manquantes à job_listings
ALTER TABLE public.job_listings 
ADD COLUMN IF NOT EXISTS contract_type TEXT;

ALTER TABLE public.job_listings 
ADD COLUMN IF NOT EXISTS salary_range TEXT;

ALTER TABLE public.job_listings 
ADD COLUMN IF NOT EXISTS salary_min INTEGER;

ALTER TABLE public.job_listings 
ADD COLUMN IF NOT EXISTS salary_max INTEGER;

ALTER TABLE public.job_listings 
ADD COLUMN IF NOT EXISTS technologies TEXT[] DEFAULT '{}';

ALTER TABLE public.job_listings 
ADD COLUMN IF NOT EXISTS remote BOOLEAN DEFAULT false;

ALTER TABLE public.job_listings 
ADD COLUMN IF NOT EXISTS posted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.job_listings 
ADD COLUMN IF NOT EXISTS scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Mettre à jour les permissions si nécessaire
GRANT ALL ON public.job_listings TO anon;
GRANT ALL ON public.job_listings TO authenticated;
GRANT ALL ON public.job_listings TO service_role;