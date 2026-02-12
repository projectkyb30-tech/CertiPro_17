-- 10_seed_exams.sql
-- Populates exams and dummy questions

-- 1. Create Exams
INSERT INTO public.exams (id, course_id, title, description, time_limit_minutes, passing_score, total_questions, is_active) VALUES
('exam_py', 'python-basics', 'IT Specialist - Python', 'Examen final pentru certificarea Python.', 50, 70, 40, true),
('exam_sql', 'database-fundamentals', 'IT Specialist - Databases', 'Examen final pentru certificarea Baze de Date.', 50, 70, 40, true),
('exam_net', 'networking-essentials', 'IT Specialist - Networking', 'Examen final pentru certificarea Rețelistică.', 50, 70, 35, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Dummy Questions for Python (Just samples to make it work)
-- Since questions table likely uses UUID for ID (if not specified otherwise in 08_exam_system_setup.sql), we can't easily insert without generating UUIDs.
-- Assuming 08_exam_system_setup.sql defined id as UUID DEFAULT uuid_generate_v4().
-- We will just insert without ID and let DB generate it.

INSERT INTO public.questions (course_id, text, points) VALUES
('python-basics', 'Care este rezultatul expresiei: print(2 ** 3)?', 1),
('python-basics', 'Cum definești o funcție în Python?', 1),
('python-basics', 'Ce keyword este folosit pentru a importa un modul?', 1),
('python-basics', 'Care dintre următoarele este un tip de date mutabil?', 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.questions (course_id, text, points) VALUES
('database-fundamentals', 'Care comandă SQL este folosită pentru a extrage date?', 1),
('database-fundamentals', 'Ce reprezintă cheia primară?', 1)
ON CONFLICT DO NOTHING;
