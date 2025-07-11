-- SEO Command Centre Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'executive' CHECK (role IN ('coordinator', 'executive', 'senior_executive', 'head_of_search', 'admin')),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{
        "theme": "light",
        "notifications": {
            "email": true,
            "slack": true,
            "browser": true
        }
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('retainer', 'project')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    website_url TEXT NOT NULL,
    domain VARCHAR(255) NOT NULL,
    business_type VARCHAR(50) DEFAULT 'B2B' CHECK (business_type IN ('B2B', 'B2C', 'Local', 'E-commerce')),
    primary_location VARCHAR(255) DEFAULT 'Australia',
    target_markets TEXT[] DEFAULT '{}',
    accelo_company_id VARCHAR(255),
    search_console_property_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('content_generation', 'migration_analysis', 'technical_audit', 'competitor_analysis', 'strategy_generation', 'monitoring', 'internal_linking', 'schema_generation', 'reporting')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create strategies table
CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    timeframe VARCHAR(50) NOT NULL CHECK (timeframe IN ('3months', '6months', '12months')),
    recommendations JSONB DEFAULT '[]',
    kpis JSONB DEFAULT '[]',
    timeline JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_briefs table
CREATE TABLE content_briefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('blog-post', 'landing-page', 'guide', 'case-study', 'whitepaper', 'video-script')),
    target_keywords TEXT[] NOT NULL,
    primary_keyword VARCHAR(255) NOT NULL,
    word_count INTEGER DEFAULT 1000,
    tone VARCHAR(50) DEFAULT 'professional' CHECK (tone IN ('professional', 'casual', 'technical', 'friendly')),
    audience TEXT NOT NULL,
    purpose TEXT NOT NULL,
    outline TEXT[] DEFAULT '{}',
    brief_content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'review', 'approved', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_content table
CREATE TABLE generated_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brief_id UUID NOT NULL REFERENCES content_briefs(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    seo_score INTEGER DEFAULT 0 CHECK (seo_score >= 0 AND seo_score <= 100),
    readability_score INTEGER DEFAULT 0 CHECK (readability_score >= 0 AND readability_score <= 100),
    keyword_density JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create integrations table
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('data', 'automation', 'reporting')),
    status VARCHAR(50) DEFAULT 'disconnected' CHECK (status IN ('connected', 'error', 'disconnected')),
    last_sync TIMESTAMP WITH TIME ZONE,
    config JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_strategies_client_id ON strategies(client_id);
CREATE INDEX idx_content_briefs_client_id ON content_briefs(client_id);
CREATE INDEX idx_generated_content_brief_id ON generated_content(brief_id);
CREATE INDEX idx_generated_content_client_id ON generated_content(client_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON strategies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_briefs_updated_at BEFORE UPDATE ON content_briefs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generated_content_updated_at BEFORE UPDATE ON generated_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only read their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- All authenticated users can read and modify clients
CREATE POLICY "All users can view clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can insert clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All users can update clients" ON clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "All users can delete clients" ON clients FOR DELETE TO authenticated USING (true);

-- All authenticated users can read and modify tasks
CREATE POLICY "All users can view tasks" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can insert tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All users can update tasks" ON tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "All users can delete tasks" ON tasks FOR DELETE TO authenticated USING (true);

-- All authenticated users can read and modify strategies
CREATE POLICY "All users can view strategies" ON strategies FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can insert strategies" ON strategies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All users can update strategies" ON strategies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "All users can delete strategies" ON strategies FOR DELETE TO authenticated USING (true);

-- All authenticated users can read and modify content briefs
CREATE POLICY "All users can view content briefs" ON content_briefs FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can insert content briefs" ON content_briefs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All users can update content briefs" ON content_briefs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "All users can delete content briefs" ON content_briefs FOR DELETE TO authenticated USING (true);

-- All authenticated users can read and modify generated content
CREATE POLICY "All users can view generated content" ON generated_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can insert generated content" ON generated_content FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All users can update generated content" ON generated_content FOR UPDATE TO authenticated USING (true);
CREATE POLICY "All users can delete generated content" ON generated_content FOR DELETE TO authenticated USING (true);

-- All authenticated users can read integrations
CREATE POLICY "All users can view integrations" ON integrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can modify integrations" ON integrations FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- Insert default integrations
INSERT INTO integrations (name, type, status) VALUES
('DataForSEO', 'data', 'connected'),
('Firecrawl MCP', 'automation', 'connected'),
('Perplexity MCP', 'data', 'connected'),
('OpenAI', 'automation', 'connected'),
('Anthropic', 'automation', 'connected'),
('Apify', 'automation', 'disconnected'),
('Google Analytics', 'reporting', 'connected'),
('Google Search Console', 'reporting', 'connected'),
('Slack', 'reporting', 'connected'),
('BigQuery', 'data', 'connected');

-- Create client competitors table
CREATE TABLE client_competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    competitor_domain VARCHAR(255) NOT NULL,
    competitor_name VARCHAR(255),
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, competitor_domain)
);

-- Create client contacts table
CREATE TABLE client_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client brand terms table
CREATE TABLE client_brand_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    term VARCHAR(255) NOT NULL,
    is_regex BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, term)
);

-- Create client crawl data table
CREATE TABLE client_crawl_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    crawl_type VARCHAR(50) NOT NULL CHECK (crawl_type IN ('quick', 'full', 'targeted', 'scheduled')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    pages_analyzed INTEGER DEFAULT 0,
    insights JSONB DEFAULT '{}',
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create keyword research projects table
CREATE TABLE keyword_research_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date_range_start DATE,
    date_range_end DATE,
    status VARCHAR(50) DEFAULT 'setup' CHECK (status IN ('setup', 'in_progress', 'review', 'completed', 'archived')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create keywords table
CREATE TABLE keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES keyword_research_projects(id) ON DELETE CASCADE,
    keyword VARCHAR(255) NOT NULL,
    search_volume INTEGER,
    difficulty INTEGER,
    current_position INTEGER,
    competition_level DECIMAL(3,2),
    search_intent VARCHAR(50) CHECK (search_intent IN ('informational', 'navigational', 'transactional', 'commercial')),
    priority_score INTEGER CHECK (priority_score >= 1 AND priority_score <= 3),
    category VARCHAR(255),
    sub_category VARCHAR(255),
    landing_page VARCHAR(255),
    notes TEXT,
    source VARCHAR(50) CHECK (source IN ('gsc', 'dataforseo', 'competitor', 'manual')),
    is_branded BOOLEAN DEFAULT false,
    is_quick_win BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create keyword categories table
CREATE TABLE keyword_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES keyword_research_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    head_term VARCHAR(255),
    keyword_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, name)
);

-- Create competitor analysis table
CREATE TABLE competitor_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES keyword_research_projects(id) ON DELETE CASCADE,
    competitor_domain VARCHAR(255) NOT NULL,
    analysis_data JSONB DEFAULT '{}',
    keywords_found INTEGER DEFAULT 0,
    opportunities_identified INTEGER DEFAULT 0,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_client_competitors_client_id ON client_competitors(client_id);
CREATE INDEX idx_client_contacts_client_id ON client_contacts(client_id);
CREATE INDEX idx_client_brand_terms_client_id ON client_brand_terms(client_id);
CREATE INDEX idx_client_crawl_data_client_id ON client_crawl_data(client_id);
CREATE INDEX idx_keyword_research_projects_client_id ON keyword_research_projects(client_id);
CREATE INDEX idx_keywords_project_id ON keywords(project_id);
CREATE INDEX idx_keywords_keyword ON keywords(keyword);
CREATE INDEX idx_keyword_categories_project_id ON keyword_categories(project_id);
CREATE INDEX idx_competitor_analysis_project_id ON competitor_analysis(project_id);

-- Create triggers for new tables
CREATE TRIGGER update_keyword_research_projects_updated_at BEFORE UPDATE ON keyword_research_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_keywords_updated_at BEFORE UPDATE ON keywords FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for new tables
ALTER TABLE client_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_brand_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_crawl_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "All users can view client competitors" ON client_competitors FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can modify client competitors" ON client_competitors FOR ALL TO authenticated USING (true);

CREATE POLICY "All users can view client contacts" ON client_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can modify client contacts" ON client_contacts FOR ALL TO authenticated USING (true);

CREATE POLICY "All users can view client brand terms" ON client_brand_terms FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can modify client brand terms" ON client_brand_terms FOR ALL TO authenticated USING (true);

CREATE POLICY "All users can view client crawl data" ON client_crawl_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can modify client crawl data" ON client_crawl_data FOR ALL TO authenticated USING (true);

CREATE POLICY "All users can view keyword research projects" ON keyword_research_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can modify keyword research projects" ON keyword_research_projects FOR ALL TO authenticated USING (true);

CREATE POLICY "All users can view keywords" ON keywords FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can modify keywords" ON keywords FOR ALL TO authenticated USING (true);

CREATE POLICY "All users can view keyword categories" ON keyword_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can modify keyword categories" ON keyword_categories FOR ALL TO authenticated USING (true);

CREATE POLICY "All users can view competitor analysis" ON competitor_analysis FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can modify competitor analysis" ON competitor_analysis FOR ALL TO authenticated USING (true);

-- Insert sample clients with enhanced data
INSERT INTO clients (name, industry, type, status, website_url, domain, business_type, primary_location, target_markets) VALUES
('TechCorp Australia', 'SaaS', 'retainer', 'active', 'https://techcorp.com.au', 'techcorp.com.au', 'B2B', 'Australia', '{"Australia", "New Zealand"}'),
('Melbourne Marketing Co', 'Marketing', 'project', 'active', 'https://melbournemarketing.com', 'melbournemarketing.com', 'B2B', 'Melbourne', '{"Victoria", "Australia"}'),
('Sydney Startups', 'Technology', 'retainer', 'active', 'https://sydneystartups.com', 'sydneystartups.com', 'B2B', 'Sydney', '{"New South Wales", "Australia"}'),
('Brisbane Boutique', 'E-commerce', 'project', 'paused', 'https://brisbaneboutique.com.au', 'brisbaneboutique.com.au', 'B2C', 'Brisbane', '{"Queensland", "Australia"}'),
('Perth Professional Services', 'Consulting', 'retainer', 'active', 'https://perthprofessional.com.au', 'perthprofessional.com.au', 'B2B', 'Perth', '{"Western Australia", "Australia"}');

-- Insert sample competitors for TechCorp Australia
INSERT INTO client_competitors (client_id, competitor_domain, competitor_name, priority) VALUES
((SELECT id FROM clients WHERE name = 'TechCorp Australia'), 'xero.com', 'Xero', 1),
((SELECT id FROM clients WHERE name = 'TechCorp Australia'), 'myob.com', 'MYOB', 2),
((SELECT id FROM clients WHERE name = 'TechCorp Australia'), 'quickbooks.intuit.com', 'QuickBooks', 3);

-- Insert sample brand terms for TechCorp Australia
INSERT INTO client_brand_terms (client_id, term, is_regex) VALUES
((SELECT id FROM clients WHERE name = 'TechCorp Australia'), 'techcorp', false),
((SELECT id FROM clients WHERE name = 'TechCorp Australia'), 'tech corp', false),
((SELECT id FROM clients WHERE name = 'TechCorp Australia'), 'techcorp australia', false);

-- Insert sample contacts for TechCorp Australia
INSERT INTO client_contacts (client_id, name, email, role, is_primary) VALUES
((SELECT id FROM clients WHERE name = 'TechCorp Australia'), 'John Smith', 'john.smith@techcorp.com.au', 'Marketing Manager', true),
((SELECT id FROM clients WHERE name = 'TechCorp Australia'), 'Sarah Johnson', 'sarah.johnson@techcorp.com.au', 'SEO Specialist', false);