-- Create bulk processing job tracking tables
CREATE TABLE IF NOT EXISTS bulk_processing_job (
    job_id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    processed INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    current_text TEXT,
    error TEXT,
    results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bulk_processing_job_user_id
    ON bulk_processing_job(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_processing_job_status
    ON bulk_processing_job(status);

ALTER TABLE bulk_processing_job ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bulk jobs" ON bulk_processing_job
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bulk jobs" ON bulk_processing_job
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bulk jobs" ON bulk_processing_job
    FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_bulk_job_updated_at()
RETURNS TRIGGER AS 
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
 LANGUAGE plpgsql;

CREATE TRIGGER trg_bulk_job_updated_at
    BEFORE UPDATE ON bulk_processing_job
    FOR EACH ROW EXECUTE FUNCTION update_bulk_job_updated_at();
