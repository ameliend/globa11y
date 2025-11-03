-- Add audit_type column to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS audit_type TEXT DEFAULT 'website' CHECK (audit_type IN ('website', 'native-app'));