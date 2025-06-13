-- 🔄 Reset Database (ONLY if you want to start fresh)
-- ⚠️ WARNING: This will delete ALL existing quiz data!
-- Only run this if you want to completely start over

-- Drop existing tables (this removes all data!)
DROP TABLE IF EXISTS word_responses CASCADE;
DROP TABLE IF EXISTS quiz_sessions CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- Now you can run the database-setup.sql code without errors 