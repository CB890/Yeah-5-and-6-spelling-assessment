-- Spelling Assessment Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    class_name VARCHAR(100),
    school VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL, -- For anonymous sessions
    quiz_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    quiz_end_time TIMESTAMP WITH TIME ZONE,
    total_questions INTEGER NOT NULL DEFAULT 15,
    total_correct INTEGER DEFAULT 0,
    total_first_attempt INTEGER DEFAULT 0,
    total_second_attempt INTEGER DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    paragraph_template_id INTEGER,
    paragraph_title VARCHAR(255),
    difficulty_level VARCHAR(50) DEFAULT 'mixed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create word_responses table
CREATE TABLE IF NOT EXISTS word_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    word_position INTEGER NOT NULL,
    correct_word VARCHAR(255) NOT NULL,
    user_answer_1 VARCHAR(255),
    user_answer_2 VARCHAR(255),
    attempts INTEGER NOT NULL DEFAULT 0,
    is_correct BOOLEAN DEFAULT FALSE,
    first_attempt_correct BOOLEAN DEFAULT FALSE,
    second_attempt_correct BOOLEAN DEFAULT FALSE,
    time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create word_analytics table for tracking word difficulty
CREATE TABLE IF NOT EXISTS word_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    word VARCHAR(255) NOT NULL UNIQUE,
    total_attempts INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    total_first_attempt_correct INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    difficulty_score INTEGER DEFAULT 3, -- 1-5 scale
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_analytics table for teacher insights
CREATE TABLE IF NOT EXISTS class_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    school VARCHAR(255),
    total_students INTEGER DEFAULT 0,
    total_quizzes INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    most_difficult_words TEXT[], -- Array of challenging words
    teaching_focus_words TEXT[], -- Array of words needing attention
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teacher_settings table
CREATE TABLE IF NOT EXISTS teacher_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_name VARCHAR(255),
    class_name VARCHAR(100) NOT NULL,
    school VARCHAR(255),
    default_word_count INTEGER DEFAULT 15,
    default_difficulty VARCHAR(50) DEFAULT 'mixed',
    custom_word_lists JSONB,
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_student_id ON quiz_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_created_at ON quiz_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_word_responses_quiz_session ON word_responses(quiz_session_id);
CREATE INDEX IF NOT EXISTS idx_word_responses_correct_word ON word_responses(correct_word);
CREATE INDEX IF NOT EXISTS idx_word_analytics_word ON word_analytics(word);
CREATE INDEX IF NOT EXISTS idx_class_analytics_class_name ON class_analytics(class_name);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for now - you can restrict later)
CREATE POLICY "Allow all operations on students" ON students FOR ALL USING (true);
CREATE POLICY "Allow all operations on quiz_sessions" ON quiz_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on word_responses" ON word_responses FOR ALL USING (true);
CREATE POLICY "Allow all operations on word_analytics" ON word_analytics FOR ALL USING (true);
CREATE POLICY "Allow all operations on class_analytics" ON class_analytics FOR ALL USING (true);
CREATE POLICY "Allow all operations on teacher_settings" ON teacher_settings FOR ALL USING (true);

-- Create or replace function to update word analytics
CREATE OR REPLACE FUNCTION update_word_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update word analytics
    INSERT INTO word_analytics (word, total_attempts, total_correct, total_first_attempt_correct)
    VALUES (
        NEW.correct_word,
        1,
        CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
        CASE WHEN NEW.first_attempt_correct THEN 1 ELSE 0 END
    )
    ON CONFLICT (word) DO UPDATE SET
        total_attempts = word_analytics.total_attempts + 1,
        total_correct = word_analytics.total_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
        total_first_attempt_correct = word_analytics.total_first_attempt_correct + CASE WHEN NEW.first_attempt_correct THEN 1 ELSE 0 END,
        success_rate = ROUND(
            (word_analytics.total_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END) * 100.0 / 
            (word_analytics.total_attempts + 1), 2
        ),
        difficulty_score = CASE 
            WHEN ROUND((word_analytics.total_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END) * 100.0 / (word_analytics.total_attempts + 1), 2) >= 80 THEN 1
            WHEN ROUND((word_analytics.total_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END) * 100.0 / (word_analytics.total_attempts + 1), 2) >= 60 THEN 2
            WHEN ROUND((word_analytics.total_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END) * 100.0 / (word_analytics.total_attempts + 1), 2) >= 40 THEN 3
            WHEN ROUND((word_analytics.total_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END) * 100.0 / (word_analytics.total_attempts + 1), 2) >= 20 THEN 4
            ELSE 5
        END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update word analytics
CREATE TRIGGER trigger_update_word_analytics
    AFTER INSERT ON word_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_word_analytics(); 