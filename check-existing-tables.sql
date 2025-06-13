-- 🔍 Check What Tables Already Exist
-- Run this in your Supabase SQL Editor to see what you have

-- Check if tables exist and their structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('schools', 'quiz_sessions', 'word_responses')
ORDER BY table_name, ordinal_position;

-- Check if you have any schools in the schools table
SELECT * FROM schools LIMIT 5;

-- Check if you have any quiz data
SELECT COUNT(*) as total_quizzes FROM quiz_sessions;
SELECT COUNT(*) as total_word_responses FROM word_responses;

-- Show recent quiz sessions if any exist
SELECT 
    student_name, 
    created_at, 
    total_correct, 
    total_questions,
    paragraph_title
FROM quiz_sessions 
ORDER BY created_at DESC 
LIMIT 5; 