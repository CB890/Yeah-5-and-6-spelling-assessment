-- 🔍 Show Column Names Simply
-- Let's see exactly what columns exist in your quiz_sessions table

-- Show all columns in quiz_sessions table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'quiz_sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show all columns in word_responses table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'word_responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show all columns in schools table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'schools' 
AND table_schema = 'public'
ORDER BY ordinal_position; 