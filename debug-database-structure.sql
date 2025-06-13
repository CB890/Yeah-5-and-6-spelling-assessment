-- 🔍 Debug Database Structure
-- Let's see exactly what columns exist in your tables

-- Check the exact structure of quiz_sessions table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check the exact structure of word_responses table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'word_responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check the exact structure of schools table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'schools' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- List all tables in your database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if there are any constraints
SELECT 
    constraint_name, 
    table_name, 
    constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public'
ORDER BY table_name, constraint_name; 