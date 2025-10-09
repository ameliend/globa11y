-- Add audit information fields to reports table
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS auditor_name TEXT,
ADD COLUMN IF NOT EXISTS browsers_devices TEXT,
ADD COLUMN IF NOT EXISTS technologies TEXT,
ADD COLUMN IF NOT EXISTS assistive_tech TEXT,
ADD COLUMN IF NOT EXISTS automated_tests TEXT DEFAULT 'Evinced';