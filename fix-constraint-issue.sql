-- 🔧 Fix Constraint Issue - Simpler Approach
-- This avoids the ON CONFLICT error by checking if data exists first

-- Add missing columns to quiz_sessions table
ALTER TABLE quiz_sessions 
ADD COLUMN IF NOT EXISTS paragraph_title TEXT,
ADD COLUMN IF NOT EXISTS paragraph_template_id TEXT,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'mixed',
ADD COLUMN IF NOT EXISTS total_first_attempt INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_second_attempt INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS school_id UUID;

-- Add missing columns to word_responses table  
ALTER TABLE word_responses
ADD COLUMN IF NOT EXISTS school_id UUID,
ADD COLUMN IF NOT EXISTS first_attempt_correct BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS second_attempt_correct BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0;

-- Add missing columns to schools table if needed
ALTER TABLE schools
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add unique constraint to school_code if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'schools_school_code_key'
    ) THEN
        ALTER TABLE schools ADD CONSTRAINT schools_school_code_key UNIQUE (school_code);
    END IF;
END $$;

-- Insert test school only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM schools WHERE school_code = 'TEST001') THEN
        INSERT INTO schools (school_name, school_code, contact_email, is_active) 
        VALUES ('Test School', 'TEST001', 'test@example.com', true);
    END IF;
END $$;

-- Update existing records to link to the test school
UPDATE word_responses 
SET school_id = (SELECT id FROM schools WHERE school_code = 'TEST001' LIMIT 1)
WHERE school_id IS NULL;

UPDATE quiz_sessions 
SET school_id = (SELECT id FROM schools WHERE school_code = 'TEST001' LIMIT 1)
WHERE school_id IS NULL;

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'word_responses_school_id_fkey'
    ) THEN
        ALTER TABLE word_responses 
        ADD CONSTRAINT word_responses_school_id_fkey 
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'quiz_sessions_school_id_fkey'
    ) THEN
        ALTER TABLE quiz_sessions 
        ADD CONSTRAINT quiz_sessions_school_id_fkey 
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_school_id ON quiz_sessions(school_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_created_at ON quiz_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_word_responses_school_id ON word_responses(school_id);
CREATE INDEX IF NOT EXISTS idx_word_responses_quiz_session_id ON word_responses(quiz_session_id);

-- 🎉 All done! Your database should now be compatible with the new code! 