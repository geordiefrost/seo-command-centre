-- Ultra-Safe Incremental Migration
-- This script only adds what's missing without conflicts

-- Function to safely add columns
CREATE OR REPLACE FUNCTION safe_add_column(table_name TEXT, column_name TEXT, column_definition TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Check if column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = safe_add_column.table_name 
        AND column_name = safe_add_column.column_name
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', table_name, column_name, column_definition);
        RETURN format('Added column %s.%s', table_name, column_name);
    ELSE
        RETURN format('Column %s.%s already exists', table_name, column_name);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to safely create indexes
CREATE OR REPLACE FUNCTION safe_create_index(index_name TEXT, table_name TEXT, column_spec TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Check if index exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = safe_create_index.index_name
    ) THEN
        EXECUTE format('CREATE INDEX %I ON %I (%s)', index_name, table_name, column_spec);
        RETURN format('Created index %s', index_name);
    ELSE
        RETURN format('Index %s already exists', index_name);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to safely create policies
CREATE OR REPLACE FUNCTION safe_create_policy(policy_name TEXT, table_name TEXT, policy_definition TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Check if policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = safe_create_policy.table_name 
        AND policyname = safe_create_policy.policy_name
    ) THEN
        EXECUTE format('CREATE POLICY %I ON %I %s', policy_name, table_name, policy_definition);
        RETURN format('Created policy %s on %s', policy_name, table_name);
    ELSE
        RETURN format('Policy %s on %s already exists', policy_name, table_name);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Show current clients table structure
SELECT 'Current clients table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- Add missing columns to clients table
SELECT safe_add_column('clients', 'domain', 'VARCHAR(255)');
SELECT safe_add_column('clients', 'business_type', 'VARCHAR(50) DEFAULT ''B2B'' CHECK (business_type IN (''B2B'', ''B2C'', ''Local'', ''E-commerce''))');
SELECT safe_add_column('clients', 'primary_location', 'VARCHAR(255) DEFAULT ''Australia''');
SELECT safe_add_column('clients', 'target_markets', 'TEXT[] DEFAULT ''{}''');
SELECT safe_add_column('clients', 'accelo_company_id', 'VARCHAR(255)');
SELECT safe_add_column('clients', 'search_console_property_id', 'VARCHAR(255)');
SELECT safe_add_column('clients', 'notes', 'TEXT');
SELECT safe_add_column('clients', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()');

-- Create related tables only if they don't exist
CREATE TABLE IF NOT EXISTS client_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    competitor_domain VARCHAR(255) NOT NULL,
    competitor_name VARCHAR(255),
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, competitor_domain)
);

CREATE TABLE IF NOT EXISTS client_brand_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    term VARCHAR(255) NOT NULL,
    is_regex BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, term)
);

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

-- Create missing indexes safely
SELECT safe_create_index('idx_clients_status', 'clients', 'status');
SELECT safe_create_index('idx_clients_type', 'clients', 'type');
SELECT safe_create_index('idx_clients_business_type', 'clients', 'business_type');
SELECT safe_create_index('idx_clients_domain', 'clients', 'domain');
SELECT safe_create_index('idx_client_competitors_client_id', 'client_competitors', 'client_id');
SELECT safe_create_index('idx_client_brand_terms_client_id', 'client_brand_terms', 'client_id');
SELECT safe_create_index('idx_client_crawl_data_client_id', 'client_crawl_data', 'client_id');

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_brand_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_crawl_data ENABLE ROW LEVEL SECURITY;

-- Create missing policies safely
SELECT safe_create_policy('All users can view clients', 'clients', 'FOR SELECT TO authenticated USING (true)');
SELECT safe_create_policy('All users can insert clients', 'clients', 'FOR INSERT TO authenticated WITH CHECK (true)');
SELECT safe_create_policy('All users can update clients', 'clients', 'FOR UPDATE TO authenticated USING (true)');
SELECT safe_create_policy('All users can delete clients', 'clients', 'FOR DELETE TO authenticated USING (true)');

SELECT safe_create_policy('All users can view client competitors', 'client_competitors', 'FOR SELECT TO authenticated USING (true)');
SELECT safe_create_policy('All users can modify client competitors', 'client_competitors', 'FOR ALL TO authenticated USING (true)');

SELECT safe_create_policy('All users can view client brand terms', 'client_brand_terms', 'FOR SELECT TO authenticated USING (true)');
SELECT safe_create_policy('All users can modify client brand terms', 'client_brand_terms', 'FOR ALL TO authenticated USING (true)');

SELECT safe_create_policy('All users can view client crawl data', 'client_crawl_data', 'FOR SELECT TO authenticated USING (true)');
SELECT safe_create_policy('All users can modify client crawl data', 'client_crawl_data', 'FOR ALL TO authenticated USING (true)');

-- Update existing clients to have domain if missing
UPDATE clients 
SET domain = CASE 
    WHEN website_url IS NOT NULL THEN 
        REGEXP_REPLACE(
            REGEXP_REPLACE(website_url, '^https?://(www\.)?', ''),
            '/.*$', ''
        )
    ELSE 
        name || '.com'
END
WHERE domain IS NULL;

-- Show final structure
SELECT 'Final clients table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- Show created policies
SELECT 'Client table policies:' as info;
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'clients';

-- Clean up helper functions
DROP FUNCTION IF EXISTS safe_add_column(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS safe_create_index(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS safe_create_policy(TEXT, TEXT, TEXT);

-- Final status
SELECT 'Migration completed successfully! Client creation should now work.' as status;