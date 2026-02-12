-- 09_seed_courses.sql
-- Populates courses, modules, and lessons from the mock data

-- =============================================
-- 1. Python Course
-- =============================================
INSERT INTO public.courses (id, title, description, icon, total_lessons, duration_hours, price, is_published, category)
VALUES 
('python-basics', 'ITS - Python', 'Certificare oficială Certiport IT Specialist în Python.', 'python', 20, 50, 150.00, true, 'python')
ON CONFLICT (id) DO UPDATE SET 
  category = 'python',
  price = 300; -- Updating price to 300 as per new revenue model

-- Modules for Python
INSERT INTO public.modules (id, course_id, title, "order") VALUES
('py-mod-1', 'python-basics', '1. Data Types and Operators', 1),
('py-mod-2', 'python-basics', '2. Flow Control', 2),
('py-mod-3', 'python-basics', '3. Input and Output', 3),
('py-mod-4', 'python-basics', '4. Code Structure', 4),
('py-mod-5', 'python-basics', '5. Troubleshooting and Errors', 5),
('py-mod-6', 'python-basics', '6. Modules and Tools', 6)
ON CONFLICT (id) DO NOTHING;

-- Lessons for Python
INSERT INTO public.lessons (id, module_id, title, type, duration, is_free, "order") VALUES
-- Mod 1
('py-intro', 'py-mod-1', '0. Introducere în Python', 'text', '5 min', true, 1),
('py-1.1', 'py-mod-1', '1.1 Data operations', 'code', '20 min', false, 2),
('py-1.2', 'py-mod-1', '1.2 Operator precedence', 'text', '10 min', false, 3),
('py-1.3', 'py-mod-1', '1.3 Choose correct operators', 'quiz', '10 min', false, 4),
-- Mod 2
('py-2.1', 'py-mod-2', '2.1 Conditional statements', 'code', '25 min', false, 1),
('py-2.2', 'py-mod-2', '2.2 Loops', 'code', '30 min', false, 2),
-- Mod 3
('py-3.1', 'py-mod-3', '3.1 File input/output', 'code', '20 min', false, 1),
('py-3.2', 'py-mod-3', '3.2 Console input/output', 'code', '15 min', false, 2),
-- Mod 4
('py-4.1', 'py-mod-4', '4.1 Code documentation', 'text', '10 min', false, 1),
('py-4.2', 'py-mod-4', '4.2 Functions', 'code', '30 min', false, 2),
-- Mod 5
('py-5.1', 'py-mod-5', '5.1 Syntax, logic, runtime errors', 'text', '15 min', false, 1),
('py-5.2', 'py-mod-5', '5.2 Exception handling', 'code', '20 min', false, 2),
('py-5.3', 'py-mod-5', '5.3 Unit testing', 'code', '20 min', false, 3),
-- Mod 6
('py-6.1', 'py-mod-6', '6.1 System modules', 'code', '15 min', false, 1),
('py-6.2', 'py-mod-6', '6.2 Built-in modules', 'code', '15 min', false, 2)
ON CONFLICT (id) DO NOTHING;


-- =============================================
-- 2. SQL Course
-- =============================================
INSERT INTO public.courses (id, title, description, icon, total_lessons, duration_hours, price, is_published, category)
VALUES 
('database-fundamentals', 'ITS - Databases (SQL)', 'Certificare oficială Certiport IT Specialist în Baze de Date.', 'database', 25, 55, 150.00, true, 'sql')
ON CONFLICT (id) DO UPDATE SET 
  category = 'sql',
  price = 300;

-- Modules for SQL
INSERT INTO public.modules (id, course_id, title, "order") VALUES
('db-mod-1', 'database-fundamentals', '1. Database Design', 1),
('db-mod-2', 'database-fundamentals', '2. Database Object Management', 2),
('db-mod-3', 'database-fundamentals', '3. Data Retrieval', 3),
('db-mod-4', 'database-fundamentals', '4. Data Manipulation', 4),
('db-mod-5', 'database-fundamentals', '5. Troubleshooting', 5)
ON CONFLICT (id) DO NOTHING;

-- Lessons for SQL
INSERT INTO public.lessons (id, module_id, title, type, duration, is_free, "order") VALUES
-- Mod 1
('db-intro', 'db-mod-1', '0. Introducere în SQL', 'text', '5 min', true, 1),
('db-1.1', 'db-mod-1', '1.1 Design tables', 'text', '20 min', false, 2),
('db-1.2', 'db-mod-1', '1.2 Identify primary keys', 'quiz', '10 min', false, 3),
('db-1.3', 'db-mod-1', '1.3 Choose correct data types', 'text', '15 min', false, 4),
('db-1.4', 'db-mod-1', '1.4 Design table relationships', 'text', '25 min', false, 5),
('db-1.5', 'db-mod-1', '1.5 Normalize a database', 'text', '30 min', false, 6),
('db-1.6', 'db-mod-1', '1.6 Data protection measures', 'text', '15 min', false, 7),
-- Mod 2
('db-2.1', 'db-mod-2', '2.1 Create / alter / drop tables', 'code', '30 min', false, 1),
('db-2.2', 'db-mod-2', '2.2 Create / alter / drop views', 'code', '20 min', false, 2),
('db-2.3', 'db-mod-2', '2.3 Stored procedures and functions', 'code', '35 min', false, 3),
('db-2.4', 'db-mod-2', '2.4 Clustered vs non-clustered indexes', 'text', '15 min', false, 4),
-- Mod 3
('db-3.1', 'db-mod-3', '3.1 SELECT queries', 'code', '40 min', false, 1),
('db-3.2', 'db-mod-3', '3.2 Filtering and sorting', 'code', '30 min', false, 2),
('db-3.3', 'db-mod-3', '3.3 Aggregation', 'code', '30 min', false, 3),
-- Mod 4
('db-4.1', 'db-mod-4', '4.1 INSERT statements', 'code', '15 min', false, 1),
('db-4.2', 'db-mod-4', '4.2 UPDATE statements', 'code', '15 min', false, 2),
('db-4.3', 'db-mod-4', '4.3 DELETE statements', 'code', '10 min', false, 3),
-- Mod 5
('db-5.1', 'db-mod-5', '5.1 Fix DDL errors', 'code', '20 min', false, 1),
('db-5.2', 'db-mod-5', '5.2 Fix SELECT / JOIN errors', 'code', '25 min', false, 2),
('db-5.3', 'db-mod-5', '5.3 Fix DML errors', 'code', '20 min', false, 3)
ON CONFLICT (id) DO NOTHING;


-- =============================================
-- 3. Networking Course
-- =============================================
INSERT INTO public.courses (id, title, description, icon, total_lessons, duration_hours, price, is_published, category)
VALUES 
('networking-essentials', 'ITS - Networking', 'Certificare oficială Certiport IT Specialist în Rețelistică.', 'network', 23, 48, 150.00, true, 'networking')
ON CONFLICT (id) DO UPDATE SET 
  category = 'networking',
  price = 300;

-- Modules for Networking
INSERT INTO public.modules (id, course_id, title, "order") VALUES
('net-mod-1', 'networking-essentials', '1. Networking Fundamentals', 1),
('net-mod-2', 'networking-essentials', '2. Network Infrastructure', 2),
('net-mod-3', 'networking-essentials', '3. Network Hardware', 3),
('net-mod-4', 'networking-essentials', '4. Protocols and Services', 4),
('net-mod-5', 'networking-essentials', '5. Troubleshooting', 5)
ON CONFLICT (id) DO NOTHING;

-- Lessons for Networking
INSERT INTO public.lessons (id, module_id, title, type, duration, is_free, "order") VALUES
-- Mod 1
('net-intro', 'net-mod-1', '0. Introducere în Rețelistică', 'text', '5 min', true, 1),
('net-1.1', 'net-mod-1', '1.1 Network concepts', 'text', '20 min', false, 2),
('net-1.2', 'net-mod-1', '1.2 Cloud and virtualization', 'text', '25 min', false, 3),
('net-1.3', 'net-mod-1', '1.3 Remote access', 'text', '15 min', false, 4),
-- Mod 2
('net-2.1', 'net-mod-2', '2.1 LAN concepts', 'text', '20 min', false, 1),
('net-2.2', 'net-mod-2', '2.2 WAN concepts', 'text', '15 min', false, 2),
('net-2.3', 'net-mod-2', '2.3 Wireless networking', 'text', '20 min', false, 3),
('net-2.4', 'net-mod-2', '2.4 Network topologies', 'video', '15 min', false, 4),
-- Mod 3
('net-3.1', 'net-mod-3', '3.1 Switches', 'text', '25 min', false, 1),
('net-3.2', 'net-mod-3', '3.2 Routers', 'text', '25 min', false, 2),
('net-3.3', 'net-mod-3', '3.3 Physical media', 'text', '20 min', false, 3),
-- Mod 4
('net-4.1', 'net-mod-4', '4.1 OSI model', 'text', '30 min', false, 1),
('net-4.2', 'net-mod-4', '4.2 TCP/IP model', 'text', '25 min', false, 2),
('net-4.3', 'net-mod-4', '4.3 IPv4 concepts', 'text', '30 min', false, 3),
('net-4.4', 'net-mod-4', '4.4 IPv6 concepts', 'text', '15 min', false, 4),
('net-4.5', 'net-mod-4', '4.5 Well-known ports', 'quiz', '15 min', false, 5),
('net-4.6', 'net-mod-4', '4.6 Name resolution', 'text', '15 min', false, 6),
('net-4.7', 'net-mod-4', '4.7 Network services', 'text', '20 min', false, 7),
-- Mod 5
('net-5.1', 'net-mod-5', '5.1 Network troubleshooting process', 'text', '20 min', false, 1),
('net-5.2', 'net-mod-5', '5.2 Hardware tools', 'text', '15 min', false, 2),
('net-5.3', 'net-mod-5', '5.3 Windows network tools', 'code', '25 min', false, 3),
('net-5.4', 'net-mod-5', '5.4 Linux network tools', 'code', '20 min', false, 4)
ON CONFLICT (id) DO NOTHING;
