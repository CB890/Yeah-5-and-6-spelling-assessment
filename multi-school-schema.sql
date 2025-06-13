-- Multi-School Spelling Assessment Database Schema
-- Enhanced for multi-tenant architecture with school isolation

-- Create schools table as the master tenant table
CREATE TABLE IF NOT EXISTS schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    school_code VARCHAR(50) UNIQUE NOT NULL, -- Unique identifier for each school
    district VARCHAR(255),
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    subscription_tier VARCHAR(50) DEFAULT 'basic', -- basic, premium, enterprise
    max_students INTEGER DEFAULT 1000,
    max_teachers INTEGER DEFAULT 50,
    features JSONB DEFAULT '{"analytics": true, "exports": true, "api_access": false}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teachers table (each teacher belongs to a school)
CREATE TABLE IF NOT EXISTS teachers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    teacher_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50) DEFAULT 'teacher', -- teacher, admin, super_admin
    class_names TEXT[], -- Array of classes they teach
    permissions JSONB DEFAULT '{"view_analytics": true, "export_data": true, "manage_students": true}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced students table with school association
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    student_name VARCHAR(255) NOT NULL,
    student_id VARCHAR(100), -- School's internal student ID
    class_name VARCHAR(100),
    year_group VARCHAR(50), -- Year 5, Year 6, etc.
    additional_info JSONB, -- Special needs, language support, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced quiz_sessions with school context
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
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
    quiz_settings JSONB, -- Custom settings used for this quiz
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced word_responses with school context
CREATE TABLE IF NOT EXISTS word_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
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

-- School-specific word analytics
CREATE TABLE IF NOT EXISTS word_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    word VARCHAR(255) NOT NULL,
    total_attempts INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    total_first_attempt_correct INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    difficulty_score INTEGER DEFAULT 3, -- 1-5 scale
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(school_id, word) -- Each school has its own word analytics
);

-- School-specific class analytics
CREATE TABLE IF NOT EXISTS class_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    class_name VARCHAR(100) NOT NULL,
    year_group VARCHAR(50),
    total_students INTEGER DEFAULT 0,
    total_quizzes INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    most_difficult_words TEXT[], -- Array of challenging words
    teaching_focus_words TEXT[], -- Array of words needing attention
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(school_id, class_name, year_group)
);

-- Enhanced teacher_settings with school context
CREATE TABLE IF NOT EXISTS teacher_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    default_word_count INTEGER DEFAULT 15,
    default_difficulty VARCHAR(50) DEFAULT 'mixed',
    custom_word_lists JSONB,
    dashboard_preferences JSONB,
    notification_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(school_id, teacher_id)
);

-- School usage analytics for billing/monitoring
CREATE TABLE IF NOT EXISTS school_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL,
    total_quizzes INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    total_teachers INTEGER DEFAULT 0,
    storage_used_mb INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(school_id, usage_date)
);

-- Audit log for tracking changes across schools
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'quiz_completed', 'student_added', 'settings_changed'
    entity_type VARCHAR(50), -- 'student', 'quiz', 'settings'
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comprehensive indexes for multi-tenant performance
CREATE INDEX IF NOT EXISTS idx_schools_code ON schools(school_code);
CREATE INDEX IF NOT EXISTS idx_schools_active ON schools(is_active);

CREATE INDEX IF NOT EXISTS idx_teachers_school ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);
CREATE INDEX IF NOT EXISTS idx_teachers_active ON teachers(school_id, is_active);

CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_teacher ON students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(school_id, class_name);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_school ON quiz_sessions(school_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_teacher ON quiz_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_student ON quiz_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_date ON quiz_sessions(school_id, created_at);

CREATE INDEX IF NOT EXISTS idx_word_responses_school ON word_responses(school_id);
CREATE INDEX IF NOT EXISTS idx_word_responses_session ON word_responses(quiz_session_id);
CREATE INDEX IF NOT EXISTS idx_word_responses_word ON word_responses(school_id, correct_word);

CREATE INDEX IF NOT EXISTS idx_word_analytics_school ON word_analytics(school_id);
CREATE INDEX IF NOT EXISTS idx_word_analytics_difficulty ON word_analytics(school_id, difficulty_score);

CREATE INDEX IF NOT EXISTS idx_class_analytics_school ON class_analytics(school_id);
CREATE INDEX IF NOT EXISTS idx_class_analytics_teacher ON class_analytics(teacher_id);

CREATE INDEX IF NOT EXISTS idx_school_usage_date ON school_usage(school_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_audit_log_school ON audit_log(school_id, created_at);

-- Enable Row Level Security for all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for School Isolation

-- Schools: Only system admins or school admins can see school data
CREATE POLICY "Schools can see own data" ON schools 
FOR ALL USING (
    auth.jwt() ->> 'school_id' = id::text OR 
    auth.jwt() ->> 'role' = 'super_admin'
);

-- Teachers: Can only see teachers from their school
CREATE POLICY "Teachers school isolation" ON teachers 
FOR ALL USING (
    auth.jwt() ->> 'school_id' = school_id::text OR
    auth.jwt() ->> 'role' = 'super_admin'
);

-- Students: Can only see students from their school
CREATE POLICY "Students school isolation" ON students 
FOR ALL USING (
    auth.jwt() ->> 'school_id' = school_id::text OR
    auth.jwt() ->> 'role' = 'super_admin'
);

-- Quiz sessions: School isolation
CREATE POLICY "Quiz sessions school isolation" ON quiz_sessions 
FOR ALL USING (
    auth.jwt() ->> 'school_id' = school_id::text OR
    auth.jwt() ->> 'role' = 'super_admin'
);

-- Word responses: School isolation
CREATE POLICY "Word responses school isolation" ON word_responses 
FOR ALL USING (
    auth.jwt() ->> 'school_id' = school_id::text OR
    auth.jwt() ->> 'role' = 'super_admin'
);

-- Word analytics: School isolation
CREATE POLICY "Word analytics school isolation" ON word_analytics 
FOR ALL USING (
    auth.jwt() ->> 'school_id' = school_id::text OR
    auth.jwt() ->> 'role' = 'super_admin'
);

-- Class analytics: School isolation
CREATE POLICY "Class analytics school isolation" ON class_analytics 
FOR ALL USING (
    auth.jwt() ->> 'school_id' = school_id::text OR
    auth.jwt() ->> 'role' = 'super_admin'
);

-- Teacher settings: Teachers can only see their own settings
CREATE POLICY "Teacher settings isolation" ON teacher_settings 
FOR ALL USING (
    (auth.jwt() ->> 'school_id' = school_id::text AND auth.jwt() ->> 'teacher_id' = teacher_id::text) OR
    auth.jwt() ->> 'role' = 'super_admin'
);

-- School usage: School admins can see their usage
CREATE POLICY "School usage isolation" ON school_usage 
FOR ALL USING (
    auth.jwt() ->> 'school_id' = school_id::text OR
    auth.jwt() ->> 'role' = 'super_admin'
);

-- Audit log: School isolation
CREATE POLICY "Audit log school isolation" ON audit_log 
FOR ALL USING (
    auth.jwt() ->> 'school_id' = school_id::text OR
    auth.jwt() ->> 'role' = 'super_admin'
);

-- Functions for multi-school operations

-- Function to create a new school with initial setup
CREATE OR REPLACE FUNCTION create_school(
    p_school_name TEXT,
    p_school_code TEXT,
    p_district TEXT DEFAULT NULL,
    p_contact_email TEXT DEFAULT NULL,
    p_admin_name TEXT DEFAULT NULL,
    p_admin_email TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    new_school_id UUID;
    new_teacher_id UUID;
BEGIN
    -- Create the school
    INSERT INTO schools (school_name, school_code, district, contact_email)
    VALUES (p_school_name, p_school_code, p_district, p_contact_email)
    RETURNING id INTO new_school_id;
    
    -- Create the initial admin teacher if provided
    IF p_admin_name IS NOT NULL THEN
        INSERT INTO teachers (school_id, teacher_name, email, role)
        VALUES (new_school_id, p_admin_name, p_admin_email, 'admin')
        RETURNING id INTO new_teacher_id;
    END IF;
    
    -- Create initial usage record
    INSERT INTO school_usage (school_id, usage_date)
    VALUES (new_school_id, CURRENT_DATE);
    
    -- Log the creation
    INSERT INTO audit_log (school_id, action, entity_type, entity_id, new_values)
    VALUES (new_school_id, 'school_created', 'school', new_school_id, 
            jsonb_build_object('school_name', p_school_name, 'school_code', p_school_code));
    
    RETURN new_school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update school usage statistics
CREATE OR REPLACE FUNCTION update_school_usage(p_school_id UUID) RETURNS VOID AS $$
BEGIN
    INSERT INTO school_usage (
        school_id, 
        usage_date, 
        total_quizzes, 
        total_students, 
        total_teachers
    )
    VALUES (
        p_school_id,
        CURRENT_DATE,
        (SELECT COUNT(*) FROM quiz_sessions WHERE school_id = p_school_id AND DATE(created_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM students WHERE school_id = p_school_id AND is_active = true),
        (SELECT COUNT(*) FROM teachers WHERE school_id = p_school_id AND is_active = true)
    )
    ON CONFLICT (school_id, usage_date) DO UPDATE SET
        total_quizzes = EXCLUDED.total_quizzes,
        total_students = EXCLUDED.total_students,
        total_teachers = EXCLUDED.total_teachers;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced word analytics function for school-specific data
CREATE OR REPLACE FUNCTION update_word_analytics_for_school()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update word analytics for the specific school
    INSERT INTO word_analytics (school_id, word, total_attempts, total_correct, total_first_attempt_correct)
    VALUES (
        NEW.school_id,
        NEW.correct_word,
        1,
        CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
        CASE WHEN NEW.first_attempt_correct THEN 1 ELSE 0 END
    )
    ON CONFLICT (school_id, word) DO UPDATE SET
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

-- Create trigger for school-specific word analytics
CREATE TRIGGER trigger_update_word_analytics_school
    AFTER INSERT ON word_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_word_analytics_for_school();

-- Sample data for testing (remove in production)
INSERT INTO schools (school_name, school_code, district, contact_email) VALUES 
('Westfield Primary School', 'WPS001', 'Central District', 'admin@westfield.edu'),
('Riverside Elementary', 'RES002', 'North District', 'contact@riverside.edu'),
('Oakwood Academy', 'OAK003', 'South District', 'info@oakwood.edu');

-- Sample teachers
INSERT INTO teachers (school_id, teacher_name, email, role) VALUES 
((SELECT id FROM schools WHERE school_code = 'WPS001'), 'Sarah Johnson', 'sarah.johnson@westfield.edu', 'admin'),
((SELECT id FROM schools WHERE school_code = 'WPS001'), 'Michael Brown', 'michael.brown@westfield.edu', 'teacher'),
((SELECT id FROM schools WHERE school_code = 'RES002'), 'Emma Wilson', 'emma.wilson@riverside.edu', 'admin'); 