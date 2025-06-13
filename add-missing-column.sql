-- 🔧 Add Missing quiz_end_time Column
-- Quick fix for the missing column error

-- Add the missing quiz_end_time column
ALTER TABLE quiz_sessions 
ADD COLUMN IF NOT EXISTS quiz_end_time TIMESTAMP WITH TIME ZONE;

-- Also make sure we have quiz_start_time
ALTER TABLE quiz_sessions 
ADD COLUMN IF NOT EXISTS quiz_start_time TIMESTAMP WITH TIME ZONE;

-- Update any existing records that might have NULL values
UPDATE quiz_sessions 
SET quiz_end_time = created_at 
WHERE quiz_end_time IS NULL;

UPDATE quiz_sessions 
SET quiz_start_time = created_at 
WHERE quiz_start_time IS NULL;

-- 🎉 Done! The quiz_end_time column should now exist! 