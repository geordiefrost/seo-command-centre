-- Safe migration for keyword priority tracking features
-- This script adds missing columns only if they don't exist

-- Function to safely add columns
CREATE OR REPLACE FUNCTION safe_add_keyword_column(col_name TEXT, col_definition TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Check if column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'keywords' 
        AND column_name = col_name
    ) THEN
        EXECUTE format('ALTER TABLE keywords ADD COLUMN %I %s', col_name, col_definition);
        RETURN format('Added column keywords.%s', col_name);
    ELSE
        RETURN format('Column keywords.%s already exists', col_name);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Show current keywords table structure
SELECT 'Current keywords table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'keywords' 
ORDER BY ordinal_position;

-- Add priority tracking columns safely
SELECT safe_add_keyword_column('priority_score', 'DECIMAL(3,2) CHECK (priority_score >= 0 AND priority_score <= 3)');
SELECT safe_add_keyword_column('priority_category', 'VARCHAR(50) CHECK (priority_category IN (''quick-win'', ''position-boost'', ''new-opportunity'', ''long-term''))');
SELECT safe_add_keyword_column('opportunity_type', 'VARCHAR(255)');

-- Add GSC tracking columns safely
SELECT safe_add_keyword_column('gsc_clicks', 'INTEGER');
SELECT safe_add_keyword_column('gsc_impressions', 'INTEGER');
SELECT safe_add_keyword_column('gsc_ctr', 'DECIMAL(5,4)');
SELECT safe_add_keyword_column('gsc_position', 'DECIMAL(5,2)');
SELECT safe_add_keyword_column('has_client_ranking', 'BOOLEAN DEFAULT false');

-- Add API data columns safely
SELECT safe_add_keyword_column('cpc', 'DECIMAL(8,2)');
SELECT safe_add_keyword_column('competition', 'VARCHAR(50) CHECK (competition IN (''LOW'', ''MEDIUM'', ''HIGH''))');

-- Update the existing difficulty column to be competition if it exists
DO $$
BEGIN
    -- Check if difficulty column exists and competition doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'keywords' AND column_name = 'difficulty'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'keywords' AND column_name = 'competition'
    ) THEN
        -- Rename difficulty to competition_level_old and add new competition column
        ALTER TABLE keywords RENAME COLUMN difficulty TO competition_level_old;
        ALTER TABLE keywords ADD COLUMN competition VARCHAR(50) CHECK (competition IN ('LOW', 'MEDIUM', 'HIGH'));
        
        -- Convert numeric difficulty to string competition
        UPDATE keywords SET competition = CASE 
            WHEN competition_level_old <= 30 THEN 'LOW'
            WHEN competition_level_old <= 70 THEN 'MEDIUM'
            ELSE 'HIGH'
        END WHERE competition_level_old IS NOT NULL;
    END IF;
END $$;

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_keywords_priority_category ON keywords(priority_category);
CREATE INDEX IF NOT EXISTS idx_keywords_priority_score ON keywords(priority_score);
CREATE INDEX IF NOT EXISTS idx_keywords_competition ON keywords(competition);
CREATE INDEX IF NOT EXISTS idx_keywords_gsc_position ON keywords(gsc_position);
CREATE INDEX IF NOT EXISTS idx_keywords_source ON keywords(source);

-- Show final structure
SELECT 'Final keywords table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'keywords' 
ORDER BY ordinal_position;

-- Clean up helper function
DROP FUNCTION IF EXISTS safe_add_keyword_column(TEXT, TEXT);

-- Final status
SELECT 'Keyword priority migration completed successfully!' as status;