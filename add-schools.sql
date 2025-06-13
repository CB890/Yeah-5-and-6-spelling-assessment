-- 🏫 Add Kent College & Victory Heights Primary School
-- Run this to add the two schools to your database

INSERT INTO schools (school_name, school_code, contact_email, is_active) 
VALUES 
    ('Kent College', 'KENT001', 'admin@kentcollege.edu', true),
    ('Victory Heights Primary School', 'VICT001', 'office@victoryheights.edu', true)
ON CONFLICT (school_code) DO NOTHING;

-- Check all schools
SELECT school_name, school_code, created_at FROM schools ORDER BY school_name; 