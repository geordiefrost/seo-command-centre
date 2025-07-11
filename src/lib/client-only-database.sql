-- Client Management System Database Script
-- This script creates ONLY the client management tables and related objects
-- Run this to get a clean client management system without conflicts

-- Drop existing client tables to start fresh
DROP TABLE IF EXISTS client_crawl_data CASCADE;
DROP TABLE IF EXISTS client_brand_terms CASCADE;
DROP TABLE IF EXISTS client_competitors CASCADE;
DROP TABLE IF EXISTS client_contacts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Create the complete clients table with all enhanced fields
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Create client competitors table
CREATE TABLE client_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    competitor_domain VARCHAR(255) NOT NULL,
    competitor_name VARCHAR(255),
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, competitor_domain)
);

-- Create client brand terms table
CREATE TABLE client_brand_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    term VARCHAR(255) NOT NULL,
    is_regex BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, term)
);

-- Create client crawl data table
CREATE TABLE client_crawl_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Create indexes for performance
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_type ON clients(type);
CREATE INDEX idx_clients_business_type ON clients(business_type);
CREATE INDEX idx_clients_domain ON clients(domain);
CREATE INDEX idx_client_competitors_client_id ON client_competitors(client_id);
CREATE INDEX idx_client_brand_terms_client_id ON client_brand_terms(client_id);
CREATE INDEX idx_client_crawl_data_client_id ON client_crawl_data(client_id);

-- Create updated_at trigger function (only if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at trigger for clients table
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_brand_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_crawl_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients table
CREATE POLICY "All users can view clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can insert clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All users can update clients" ON clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "All users can delete clients" ON clients FOR DELETE TO authenticated USING (true);

-- Create RLS policies for client_competitors table
CREATE POLICY "All users can view client competitors" ON client_competitors FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can modify client competitors" ON client_competitors FOR ALL TO authenticated USING (true);

-- Create RLS policies for client_brand_terms table
CREATE POLICY "All users can view client brand terms" ON client_brand_terms FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can modify client brand terms" ON client_brand_terms FOR ALL TO authenticated USING (true);

-- Create RLS policies for client_crawl_data table
CREATE POLICY "All users can view client crawl data" ON client_crawl_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can modify client crawl data" ON client_crawl_data FOR ALL TO authenticated USING (true);

-- Insert sample clients with enhanced data for testing
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

-- Verify the setup
SELECT 'Client Management System Setup Complete!' as status;

-- Show the created tables
SELECT 'Created Tables:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'client%'
ORDER BY table_name;

-- Show the clients table structure
SELECT 'Clients Table Structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- Show sample data
SELECT 'Sample Clients:' as info;
SELECT name, industry, type, status, business_type, domain
FROM clients
ORDER BY name;

-- Show policies
SELECT 'Client Table Policies:' as info;
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'clients'
ORDER BY policyname;