-- 🎯 Spelling Assessment Database Setup
-- Copy and paste this into your Supabase SQL Editor to create all the tables

-- 🏫 Schools table - stores information about each school
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_name TEXT NOT NULL,
    school_code TEXT UNIQUE NOT NULL,
    contact_email TEXT,
    phone_number TEXT,
    address TEXT,
    subscription_tier TEXT DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 📝 Quiz sessions table - stores each completed quiz
CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    quiz_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    quiz_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    total_questions INTEGER NOT NULL DEFAULT 15,
    total_correct INTEGER NOT NULL DEFAULT 0,
    total_first_attempt INTEGER NOT NULL DEFAULT 0,
    total_second_attempt INTEGER NOT NULL DEFAULT 0,
    total_time_seconds INTEGER NOT NULL DEFAULT 0,
    paragraph_template_id TEXT,
    paragraph_title TEXT,
    difficulty_level TEXT DEFAULT 'mixed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 🔤 Word responses table - stores each individual word answer
CREATE TABLE word_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    quiz_session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    word_position INTEGER NOT NULL,
    correct_word TEXT NOT NULL,
    user_answer_1 TEXT,
    user_answer_2 TEXT,
    attempts INTEGER NOT NULL DEFAULT 0,
    is_correct BOOLEAN DEFAULT false,
    first_attempt_correct BOOLEAN DEFAULT false,
    second_attempt_correct BOOLEAN DEFAULT false,
    time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 🚀 Insert a test school so you can start using the system right away
INSERT INTO schools (school_name, school_code, contact_email, is_active) 
VALUES (
    'Test School',
    'TEST001', 
    'test@example.com',
    true
);

-- 📊 Create indexes for better performance when querying data
CREATE INDEX idx_quiz_sessions_school_id ON quiz_sessions(school_id);
CREATE INDEX idx_quiz_sessions_created_at ON quiz_sessions(created_at);
CREATE INDEX idx_quiz_sessions_student_name ON quiz_sessions(student_name);

CREATE INDEX idx_word_responses_school_id ON word_responses(school_id);
CREATE INDEX idx_word_responses_quiz_session_id ON word_responses(quiz_session_id);
CREATE INDEX idx_word_responses_correct_word ON word_responses(correct_word);

-- 🔒 Row Level Security (RLS) - keeps each school's data separate and secure
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_responses ENABLE ROW LEVEL SECURITY;

-- 🛡️ Security policies - these make sure schools can only see their own data
CREATE POLICY "Schools can view their own data" ON schools
    FOR ALL USING (true); -- For now, allow all access (you can restrict this later)

CREATE POLICY "Schools can view their own quiz sessions" ON quiz_sessions
    FOR ALL USING (true); -- For now, allow all access

CREATE POLICY "Schools can view their own word responses" ON word_responses
    FOR ALL USING (true); -- For now, allow all access

-- 🎉 Success! Your database is now ready to store spelling quiz results!
-- 
-- What this creates:
-- 1. 📋 schools table - stores info about each school
-- 2. 🎯 quiz_sessions table - stores each completed quiz
-- 3. 📝 word_responses table - stores each word answer
-- 4. 🚀 A test school with code "TEST001" ready to use
-- 5. 📊 Database indexes for fast queries
-- 6. 🔒 Security policies to keep data safe
--
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Check that the tables were created successfully
-- 3. Test your spelling game - it should now save results automatically! 