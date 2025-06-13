-- 🔧 Update Existing Tables - Add Missing Columns
-- This will add the missing columns without losing your existing data

-- Add missing columns to quiz_sessions table
ALTER TABLE quiz_sessions 
ADD COLUMN IF NOT EXISTS paragraph_title TEXT,
ADD COLUMN IF NOT EXISTS paragraph_template_id TEXT,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'mixed',
ADD COLUMN IF NOT EXISTS total_first_attempt INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_second_attempt INTEGER DEFAULT 0;

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

-- Add school_id foreign key constraint to word_responses if it doesn't exist
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

-- Make sure we have a test school
INSERT INTO schools (school_name, school_code, contact_email, is_active) 
VALUES ('Test School', 'TEST001', 'test@example.com', true)
ON CONFLICT (school_code) DO NOTHING;

-- Update existing word_responses to link to the test school
UPDATE word_responses 
SET school_id = (SELECT id FROM schools WHERE school_code = 'TEST001' LIMIT 1)
WHERE school_id IS NULL;

-- Update existing quiz_sessions to link to the test school  
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS school_id UUID;
UPDATE quiz_sessions 
SET school_id = (SELECT id FROM schools WHERE school_code = 'TEST001' LIMIT 1)
WHERE school_id IS NULL;

-- Add foreign key constraint for quiz_sessions if it doesn't exist
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

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_school_id ON quiz_sessions(school_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_created_at ON quiz_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_student_name ON quiz_sessions(student_name);

CREATE INDEX IF NOT EXISTS idx_word_responses_school_id ON word_responses(school_id);
CREATE INDEX IF NOT EXISTS idx_word_responses_quiz_session_id ON word_responses(quiz_session_id);
CREATE INDEX IF NOT EXISTS idx_word_responses_correct_word ON word_responses(correct_word);

-- Enable Row Level Security if not already enabled
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_responses ENABLE ROW LEVEL SECURITY;

-- Create security policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Schools can view their own data'
    ) THEN
        CREATE POLICY "Schools can view their own data" ON schools FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Schools can view their own quiz sessions'
    ) THEN
        CREATE POLICY "Schools can view their own quiz sessions" ON quiz_sessions FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Schools can view their own word responses'
    ) THEN
        CREATE POLICY "Schools can view their own word responses" ON word_responses FOR ALL USING (true);
    END IF;
END $$;

-- 🎉 Success! Your tables are now updated and compatible with the new code! 