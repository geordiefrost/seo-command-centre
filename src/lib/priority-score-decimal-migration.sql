-- Migration to fix priority_score from INTEGER to DECIMAL for proper scoring

-- Check current priority_score data type
SELECT 'Current priority_score column info:' as info;
SELECT column_name, data_type, numeric_precision, numeric_scale, is_nullable
FROM information_schema.columns 
WHERE table_name = 'keywords' AND column_name = 'priority_score';

-- Update priority_score to DECIMAL(3,2) to support values like 2.75
-- This allows values from 0.00 to 9.99 (but we'll constrain to 0.00-3.00)
DO $$
BEGIN
    -- Check if the column is currently INTEGER and needs to be changed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'keywords' 
        AND column_name = 'priority_score' 
        AND data_type = 'integer'
    ) THEN
        -- Change the column type from INTEGER to DECIMAL(3,2)
        ALTER TABLE keywords ALTER COLUMN priority_score TYPE DECIMAL(3,2);
        
        -- Update the check constraint to allow decimal values 0.00-3.00
        ALTER TABLE keywords DROP CONSTRAINT IF EXISTS keywords_priority_score_check;
        ALTER TABLE keywords ADD CONSTRAINT keywords_priority_score_check 
            CHECK (priority_score >= 0.00 AND priority_score <= 3.00);
        
        RAISE NOTICE 'Successfully updated priority_score to DECIMAL(3,2)';
    ELSE
        RAISE NOTICE 'priority_score column is already DECIMAL or does not exist';
    END IF;
END $$;

-- Show updated column info
SELECT 'Updated priority_score column info:' as info;
SELECT column_name, data_type, numeric_precision, numeric_scale, is_nullable
FROM information_schema.columns 
WHERE table_name = 'keywords' AND column_name = 'priority_score';

-- Show any existing data to verify the change worked
SELECT 'Sample priority_score values after migration:' as info;
SELECT keyword, priority_score, priority_category 
FROM keywords 
WHERE priority_score IS NOT NULL 
LIMIT 5;

SELECT 'Priority score migration completed successfully!' as status;