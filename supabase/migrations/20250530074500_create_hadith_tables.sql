-- Create Hadith Narrator Checker Database Schema
-- Migration: 20250530074500_create_hadith_tables.sql

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create narrator table for storing hadith narrator information
CREATE TABLE narrator (
    id SERIAL PRIMARY KEY,
    name_arabic TEXT NOT NULL,
    name_transliteration TEXT,
    credibility TEXT NOT NULL CHECK (credibility IN ('trustworthy', 'weak')),
    biography TEXT,
    birth_year INTEGER,
    death_year INTEGER,
    region TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create opinion table for storing scholarly opinions about narrators
CREATE TABLE opinion (
    id SERIAL PRIMARY KEY,
    narrator_id INTEGER NOT NULL REFERENCES narrator(id) ON DELETE CASCADE,
    scholar TEXT NOT NULL,
    verdict TEXT NOT NULL CHECK (verdict IN ('trustworthy', 'weak')),
    reason TEXT,
    source_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookmark table for user bookmarks of narrators
CREATE TABLE bookmark (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    narrator_id INTEGER NOT NULL REFERENCES narrator(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, narrator_id)
);

-- Create search table for tracking user search history
CREATE TABLE search (
    id SERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    result_found BOOLEAN NOT NULL DEFAULT false,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_narrator_name_arabic ON narrator(name_arabic);
CREATE INDEX idx_narrator_credibility ON narrator(credibility);
CREATE INDEX idx_opinion_narrator_id ON opinion(narrator_id);
CREATE INDEX idx_opinion_verdict ON opinion(verdict);
CREATE INDEX idx_bookmark_user_id ON bookmark(user_id);
CREATE INDEX idx_bookmark_narrator_id ON bookmark(narrator_id);
CREATE INDEX idx_search_user_id ON search(user_id);
CREATE INDEX idx_search_searched_at ON search(searched_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE narrator ENABLE ROW LEVEL SECURITY;
ALTER TABLE opinion ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark ENABLE ROW LEVEL SECURITY;
ALTER TABLE search ENABLE ROW LEVEL SECURITY;

-- RLS Policies for narrator table (public read access)
CREATE POLICY "Anyone can view narrators" ON narrator
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert narrators" ON narrator
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update narrators" ON narrator
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for opinion table (public read access)
CREATE POLICY "Anyone can view opinions" ON opinion
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert opinions" ON opinion
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update opinions" ON opinion
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for bookmark table (user-specific access)
CREATE POLICY "Users can view their own bookmarks" ON bookmark
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" ON bookmark
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON bookmark
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for search table (user-specific access)
CREATE POLICY "Users can view their own searches" ON search
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own searches" ON search
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own searches" ON search
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_narrator_updated_at BEFORE UPDATE ON narrator
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opinion_updated_at BEFORE UPDATE ON opinion
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample narrator data for testing
INSERT INTO narrator (name_arabic, name_transliteration, credibility, biography, birth_year, death_year, region) VALUES
('أبو هريرة', 'Abu Hurairah', 'trustworthy', 'Abu Hurairah (may Allah be pleased with him) was one of the most prolific companions of Prophet Muhammad (peace be upon him) in terms of hadith narration. He embraced Islam in the 7th year of Hijra and remained close to the Prophet until his death.', 599, 681, 'Yemen/Medina'),
('عائشة بنت أبي بكر', 'Aisha bint Abi Bakr', 'trustworthy', 'Aisha (may Allah be pleased with her) was the wife of Prophet Muhammad (peace be upon him) and one of the most knowledgeable companions. She was a significant narrator of hadith and a scholar in her own right.', 613, 678, 'Mecca/Medina'),
('أبو بكر الصديق', 'Abu Bakr As-Siddiq', 'trustworthy', 'Abu Bakr (may Allah be pleased with him) was the first Caliph and the closest companion of Prophet Muhammad (peace be upon him). He was known for his unwavering faith and truthfulness.', 573, 634, 'Mecca/Medina'),
('عمر بن الخطاب', 'Umar ibn al-Khattab', 'trustworthy', 'Umar (may Allah be pleased with him) was the second Caliph and one of the most influential companions. He was known for his justice and strong leadership.', 584, 644, 'Mecca/Medina'),
('علي بن أبي طالب', 'Ali ibn Abi Talib', 'trustworthy', 'Ali (may Allah be pleased with him) was the fourth Caliph and cousin of Prophet Muhammad (peace be upon him). He was raised in the Prophet''s household and was known for his knowledge and bravery.', 601, 661, 'Mecca/Medina');

-- Insert sample scholarly opinions
INSERT INTO opinion (narrator_id, scholar, verdict, reason, source_ref) VALUES
(1, 'Ibn Hajar al-Asqalani', 'trustworthy', 'Reliable companion, prolific narrator of hadith, close to the Prophet', 'Tahdhib al-Tahdhib'),
(1, 'Al-Dhahabi', 'trustworthy', 'Authentic narrator, memorized many hadiths directly from the Prophet', 'Mizan al-Itidal'),
(2, 'Ibn Hajar al-Asqalani', 'trustworthy', 'Mother of the believers, very knowledgeable about Islamic law and hadith', 'Tahdhib al-Tahdhib'),
(2, 'Al-Dhahabi', 'trustworthy', 'One of the most reliable sources for hadith, especially regarding women''s issues', 'Siyar A''lam al-Nubala'),
(3, 'Ibn Hajar al-Asqalani', 'trustworthy', 'The most truthful of people after the Prophet, first Caliph', 'Al-Isabah'),
(4, 'Al-Dhahabi', 'trustworthy', 'Known for his justice and strong memory, second Caliph', 'Siyar A''lam al-Nubala'),
(5, 'Ibn Hajar al-Asqalani', 'trustworthy', 'Gate of the city of knowledge, cousin and son-in-law of the Prophet', 'Al-Isabah');

-- Grant necessary permissions
GRANT ALL ON narrator TO authenticated;
GRANT ALL ON opinion TO authenticated;
GRANT ALL ON bookmark TO authenticated;
GRANT ALL ON search TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE narrator IS 'Stores information about hadith narrators including their credibility assessment';
COMMENT ON TABLE opinion IS 'Stores scholarly opinions about narrator credibility from classical hadith scholars';
COMMENT ON TABLE bookmark IS 'Stores user bookmarks for narrators they want to reference later';
COMMENT ON TABLE search IS 'Tracks user search history for hadith analysis queries';

COMMENT ON COLUMN narrator.credibility IS 'Overall credibility assessment: trustworthy or weak';
COMMENT ON COLUMN opinion.verdict IS 'Scholar''s verdict on narrator: trustworthy or weak';
COMMENT ON COLUMN search.result_found IS 'Whether the search query returned any narrator results'; 