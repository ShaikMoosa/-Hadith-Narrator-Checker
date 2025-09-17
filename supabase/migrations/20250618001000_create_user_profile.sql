-- Create table for storing authenticated user profiles
CREATE TABLE IF NOT EXISTS user_profile (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profile_email ON user_profile(email);

ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON user_profile
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profile
    FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_user_profile_updated_at()
RETURNS TRIGGER AS 
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
 LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profile_updated_at
    BEFORE UPDATE ON user_profile
    FOR EACH ROW EXECUTE FUNCTION update_user_profile_updated_at();
