-- Safe Migration: Add enhanced client management fields and tables
-- This handles existing policies gracefully

-- Add missing columns to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'B2B' CHECK (business_type IN ('B2B', 'B2C', 'Local', 'E-commerce'));
ALTER TABLE clients ADD COLUMN IF NOT EXISTS primary_location VARCHAR(255) DEFAULT 'Australia';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS target_markets TEXT[] DEFAULT '{}';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS accelo_company_id VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS search_console_property_id VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create client competitors table
CREATE TABLE IF NOT EXISTS client_competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    competitor_domain VARCHAR(255) NOT NULL,
    competitor_name VARCHAR(255),
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, competitor_domain)
);

-- Create client contacts table
CREATE TABLE IF NOT EXISTS client_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client brand terms table
CREATE TABLE IF NOT EXISTS client_brand_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    term VARCHAR(255) NOT NULL,
    is_regex BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, term)
);

-- Create client crawl data table
CREATE TABLE IF NOT EXISTS client_crawl_data (
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

-- Create indexes for performance (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_client_competitors_client_id ON client_competitors(client_id);
CREATE INDEX IF NOT EXISTS idx_client_contacts_client_id ON client_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_brand_terms_client_id ON client_brand_terms(client_id);
CREATE INDEX IF NOT EXISTS idx_client_crawl_data_client_id ON client_crawl_data(client_id);

-- Enable RLS for new tables (safe to run multiple times)
DO $$ BEGIN
    ALTER TABLE client_competitors ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE client_brand_terms ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE client_crawl_data ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create RLS policies for new tables (safe handling of existing policies)
DO $$ BEGIN
    CREATE POLICY "All users can view client competitors" ON client_competitors FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "All users can modify client competitors" ON client_competitors FOR ALL TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "All users can view client contacts" ON client_contacts FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "All users can modify client contacts" ON client_contacts FOR ALL TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "All users can view client brand terms" ON client_brand_terms FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "All users can modify client brand terms" ON client_brand_terms FOR ALL TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "All users can view client crawl data" ON client_crawl_data FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "All users can modify client crawl data" ON client_crawl_data FOR ALL TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Add missing client management policies (safe handling)
DO $$ BEGIN
    CREATE POLICY "All users can insert clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "All users can update clients" ON clients FOR UPDATE TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "All users can delete clients" ON clients FOR DELETE TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Verify the enhanced client table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE tablename = 'clients';

-- Show summary of what was added
SELECT 'Migration completed successfully!' as status;