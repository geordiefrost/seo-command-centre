-- Complete Client Management Migration
-- This will fix all database schema issues for client creation

-- First, check what exists and backup any data
DO $$ 
DECLARE
    client_exists boolean;
    has_data boolean;
BEGIN
    -- Check if clients table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clients'
    ) INTO client_exists;
    
    IF client_exists THEN
        -- Check if table has data
        EXECUTE 'SELECT EXISTS(SELECT 1 FROM clients LIMIT 1)' INTO has_data;
        
        IF has_data THEN
            RAISE NOTICE 'Clients table exists with data. Creating backup...';
            -- Create backup table
            EXECUTE 'CREATE TABLE clients_backup AS SELECT * FROM clients';
            RAISE NOTICE 'Backup created as clients_backup table';
        END IF;
        
        -- Drop existing table to recreate with proper structure
        RAISE NOTICE 'Dropping existing clients table...';
        DROP TABLE IF EXISTS clients CASCADE;
    END IF;
END $$;

-- Create the complete clients table with all required columns
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
CREATE TABLE IF NOT EXISTS client_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    competitor_domain VARCHAR(255) NOT NULL,
    competitor_name VARCHAR(255),
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, competitor_domain)
);

-- Create client brand terms table  
CREATE TABLE IF NOT EXISTS client_brand_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    term VARCHAR(255) NOT NULL,
    is_regex BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, term)
);

-- Create client crawl data table
CREATE TABLE IF NOT EXISTS client_crawl_data (
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

-- Create indexes
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_type ON clients(type);
CREATE INDEX idx_clients_business_type ON clients(business_type);
CREATE INDEX idx_client_competitors_client_id ON client_competitors(client_id);
CREATE INDEX idx_client_brand_terms_client_id ON client_brand_terms(client_id);
CREATE INDEX idx_client_crawl_data_client_id ON client_crawl_data(client_id);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_brand_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_crawl_data ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for clients table
CREATE POLICY "All users can view clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can insert clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All users can update clients" ON clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "All users can delete clients" ON clients FOR DELETE TO authenticated USING (true);

-- Create RLS policies for related tables
CREATE POLICY "All users can view client competitors" ON client_competitors FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can modify client competitors" ON client_competitors FOR ALL TO authenticated USING (true);

CREATE POLICY "All users can view client brand terms" ON client_brand_terms FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can modify client brand terms" ON client_brand_terms FOR ALL TO authenticated USING (true);

CREATE POLICY "All users can view client crawl data" ON client_crawl_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can modify client crawl data" ON client_crawl_data FOR ALL TO authenticated USING (true);

-- Restore data if backup exists
DO $$
DECLARE
    backup_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clients_backup'
    ) INTO backup_exists;
    
    IF backup_exists THEN
        RAISE NOTICE 'Restoring data from backup...';
        INSERT INTO clients (
            id, name, industry, type, status, website_url, domain,
            business_type, primary_location, target_markets,
            accelo_company_id, search_console_property_id, notes,
            created_at, updated_at
        )
        SELECT 
            id, name, industry, type, status, 
            COALESCE(website_url, websiteUrl, 'https://example.com') as website_url,
            COALESCE(domain, name || '.com') as domain,
            COALESCE(business_type, businessType, 'B2B') as business_type,
            COALESCE(primary_location, primaryLocation, 'Australia') as primary_location,
            COALESCE(target_markets, targetMarkets, '{}') as target_markets,
            COALESCE(accelo_company_id, acceloCompanyId) as accelo_company_id,
            COALESCE(search_console_property_id, searchConsolePropertyId) as search_console_property_id,
            notes,
            COALESCE(created_at, NOW()) as created_at,
            COALESCE(updated_at, NOW()) as updated_at
        FROM clients_backup;
        
        RAISE NOTICE 'Data restored from backup. You can drop clients_backup table if everything looks good.';
    END IF;
END $$;

-- Insert sample data if no data exists
INSERT INTO clients (name, industry, type, status, website_url, domain, business_type, primary_location, target_markets) 
SELECT * FROM (VALUES
    ('TechCorp Australia', 'SaaS', 'retainer', 'active', 'https://techcorp.com.au', 'techcorp.com.au', 'B2B', 'Australia', '{"Australia", "New Zealand"}'),
    ('Melbourne Marketing Co', 'Marketing', 'project', 'active', 'https://melbournemarketing.com', 'melbournemarketing.com', 'B2B', 'Melbourne', '{"Victoria", "Australia"}')
) AS sample_data(name, industry, type, status, website_url, domain, business_type, primary_location, target_markets)
WHERE NOT EXISTS (SELECT 1 FROM clients);

-- Verify the final structure
SELECT 'Migration completed successfully!' as status;

-- Show final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- Show policies
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE tablename = 'clients';