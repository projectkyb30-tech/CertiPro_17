-- RE-SEED DATABASE (Corrected for your schema)

-- 1. Inserare Cursuri (Doar dacă lipsesc)
INSERT INTO public.courses (id, title, description, icon, total_lessons, duration_hours, price, is_published, category)
VALUES 
('python-basics', 'ITS - Python', 'Certificare oficială Certiport IT Specialist în Python.', 'python', 20, 50, 300.00, true, 'python'),
('database-fundamentals', 'ITS - Databases (SQL)', 'Certificare oficială Certiport IT Specialist în Baze de Date.', 'database', 25, 55, 300.00, true, 'sql')
ON CONFLICT (id) DO UPDATE SET price = 300, is_published = true;

-- 2. Inserare Module (FOLOSIM order_index in loc de "order")
INSERT INTO public.modules (id, course_id, title, order_index) VALUES
('py-mod-1', 'python-basics', '1. Data Types and Operators', 1),
('py-mod-2', 'python-basics', '2. Flow Control', 2),
('db-mod-1', 'database-fundamentals', '1. Database Design', 1),
('db-mod-2', 'database-fundamentals', '2. Database Object Management', 2)
ON CONFLICT (id) DO NOTHING;

-- 3. Inserare Lecții (FOLOSIM order_index in loc de "order")
INSERT INTO public.lessons (id, module_id, title, type, duration, is_free, order_index) VALUES
-- Python Lessons
('py-intro', 'py-mod-1', '0. Introducere în Python', 'text', '5 min', true, 1),
('py-1.1', 'py-mod-1', '1.1 Data operations', 'code', '20 min', false, 2),
('py-2.1', 'py-mod-2', '2.1 Conditional statements', 'code', '25 min', false, 1),
-- SQL Lessons
('db-intro', 'db-mod-1', '0. Introducere în SQL', 'text', '5 min', true, 1),
('db-1.1', 'db-mod-1', '1.1 Design tables', 'text', '20 min', false, 2)
ON CONFLICT (id) DO NOTHING;

-- 4. Sincronizare Enrollments cu Purchases
INSERT INTO public.enrollments (user_id, course_id, enrolled_at, progress_percent, is_completed)
SELECT 
    up.user_id, 
    up.course_id, 
    NOW(), 
    0, 
    FALSE
FROM public.user_purchases up
WHERE NOT EXISTS (
    SELECT 1 FROM public.enrollments e 
    WHERE e.user_id = up.user_id AND e.course_id = up.course_id
);
