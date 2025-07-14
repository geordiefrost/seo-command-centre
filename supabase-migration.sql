-- Migration script to create keyword research tables
-- Run this in Supabase SQL Editor

-- Create keyword_research_projects table
CREATE TABLE IF NOT EXISTS keyword_research_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('setup', 'in_progress', 'review', 'completed', 'archived')) DEFAULT 'setup',
    assigned_to TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create keywords table
CREATE TABLE IF NOT EXISTS keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES keyword_research_projects(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    search_volume INTEGER,
    difficulty INTEGER,
    current_position INTEGER,
    competition_level INTEGER,
    search_intent TEXT CHECK (search_intent IN ('informational', 'navigational', 'transactional', 'commercial')),
    priority_score NUMERIC,
    category TEXT,
    sub_category TEXT,
    landing_page TEXT,
    notes TEXT,
    source TEXT CHECK (source IN ('gsc', 'dataforseo', 'competitor', 'manual')),
    is_branded BOOLEAN DEFAULT FALSE,
    is_quick_win BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create keyword_categories table
CREATE TABLE IF NOT EXISTS keyword_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES keyword_research_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    head_term TEXT,
    keyword_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create competitor_analysis table
CREATE TABLE IF NOT EXISTS competitor_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES keyword_research_projects(id) ON DELETE CASCADE,
    competitor_domain TEXT NOT NULL,
    analysis_data JSONB DEFAULT '{}',
    keywords_found INTEGER DEFAULT 0,
    opportunities_identified INTEGER DEFAULT 0,
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_keyword_research_projects_client_id ON keyword_research_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_keyword_research_projects_status ON keyword_research_projects(status);
CREATE INDEX IF NOT EXISTS idx_keywords_project_id ON keywords(project_id);
CREATE INDEX IF NOT EXISTS idx_keywords_source ON keywords(source);
CREATE INDEX IF NOT EXISTS idx_keywords_is_branded ON keywords(is_branded);
CREATE INDEX IF NOT EXISTS idx_keywords_is_quick_win ON keywords(is_quick_win);
CREATE INDEX IF NOT EXISTS idx_keyword_categories_project_id ON keyword_categories(project_id);
CREATE INDEX IF NOT EXISTS idx_competitor_analysis_project_id ON competitor_analysis(project_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_keyword_research_projects_updated_at ON keyword_research_projects;
CREATE TRIGGER update_keyword_research_projects_updated_at 
    BEFORE UPDATE ON keyword_research_projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_keywords_updated_at ON keywords;
CREATE TRIGGER update_keywords_updated_at 
    BEFORE UPDATE ON keywords 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE keyword_research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your auth requirements)
-- For now, allowing all authenticated users - you may want to restrict this further

-- keyword_research_projects policies
DROP POLICY IF EXISTS "Allow authenticated users to view keyword research projects" ON keyword_research_projects;
CREATE POLICY "Allow authenticated users to view keyword research projects" 
    ON keyword_research_projects FOR SELECT 
    TO authenticated 
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert keyword research projects" ON keyword_research_projects;
CREATE POLICY "Allow authenticated users to insert keyword research projects" 
    ON keyword_research_projects FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update keyword research projects" ON keyword_research_projects;
CREATE POLICY "Allow authenticated users to update keyword research projects" 
    ON keyword_research_projects FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete keyword research projects" ON keyword_research_projects;
CREATE POLICY "Allow authenticated users to delete keyword research projects" 
    ON keyword_research_projects FOR DELETE 
    TO authenticated 
    USING (true);

-- keywords policies
DROP POLICY IF EXISTS "Allow authenticated users to view keywords" ON keywords;
CREATE POLICY "Allow authenticated users to view keywords" 
    ON keywords FOR SELECT 
    TO authenticated 
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert keywords" ON keywords;
CREATE POLICY "Allow authenticated users to insert keywords" 
    ON keywords FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update keywords" ON keywords;
CREATE POLICY "Allow authenticated users to update keywords" 
    ON keywords FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete keywords" ON keywords;
CREATE POLICY "Allow authenticated users to delete keywords" 
    ON keywords FOR DELETE 
    TO authenticated 
    USING (true);

-- keyword_categories policies
DROP POLICY IF EXISTS "Allow authenticated users to view keyword categories" ON keyword_categories;
CREATE POLICY "Allow authenticated users to view keyword categories" 
    ON keyword_categories FOR SELECT 
    TO authenticated 
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert keyword categories" ON keyword_categories;
CREATE POLICY "Allow authenticated users to insert keyword categories" 
    ON keyword_categories FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update keyword categories" ON keyword_categories;
CREATE POLICY "Allow authenticated users to update keyword categories" 
    ON keyword_categories FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete keyword categories" ON keyword_categories;
CREATE POLICY "Allow authenticated users to delete keyword categories" 
    ON keyword_categories FOR DELETE 
    TO authenticated 
    USING (true);

-- competitor_analysis policies
DROP POLICY IF EXISTS "Allow authenticated users to view competitor analysis" ON competitor_analysis;
CREATE POLICY "Allow authenticated users to view competitor analysis" 
    ON competitor_analysis FOR SELECT 
    TO authenticated 
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert competitor analysis" ON competitor_analysis;
CREATE POLICY "Allow authenticated users to insert competitor analysis" 
    ON competitor_analysis FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update competitor analysis" ON competitor_analysis;
CREATE POLICY "Allow authenticated users to update competitor analysis" 
    ON competitor_analysis FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete competitor analysis" ON competitor_analysis;
CREATE POLICY "Allow authenticated users to delete competitor analysis" 
    ON competitor_analysis FOR DELETE 
    TO authenticated 
    USING (true);