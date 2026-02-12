-- 20_add_interactive_lessons.sql
-- Adds interactive React lessons and Presentations to existing courses

-- 1. Python Interactive Lab
INSERT INTO public.lessons (id, module_id, title, type, duration, is_free, "order", content)
VALUES 
('py-intro-lab', 'py-mod-1', '0.1 Python Interactive Lab', 'react', '15 min', true, 2, 'PythonVisualizer')
ON CONFLICT (id) DO UPDATE SET 
  type = 'react',
  content = 'PythonVisualizer',
  title = '0.1 Python Interactive Lab';

-- 2. Python Presentation Demo
INSERT INTO public.lessons (id, module_id, title, type, duration, is_free, "order", content)
VALUES 
('py-intro-pres', 'py-mod-1', '0.2 Python Overview (Slides)', 'presentation', '10 min', true, 3, '/uploads/demo-presentation.json')
ON CONFLICT (id) DO UPDATE SET 
  type = 'presentation',
  content = '/uploads/demo-presentation.json',
  title = '0.2 Python Overview (Slides)';

-- Reorder existing Python lessons to make space (Shift by 2)
UPDATE public.lessons 
SET "order" = "order" + 2 
WHERE module_id = 'py-mod-1' 
  AND id != 'py-intro-lab' 
  AND id != 'py-intro-pres' 
  AND "order" >= 2 
  AND id != 'py-intro';


-- 3. SQL Playground
INSERT INTO public.lessons (id, module_id, title, type, duration, is_free, "order", content)
VALUES 
('db-intro-lab', 'db-mod-1', '0.1 SQL Playground', 'react', '15 min', true, 2, 'SQLPlayground')
ON CONFLICT (id) DO UPDATE SET 
  type = 'react',
  content = 'SQLPlayground',
  title = '0.1 SQL Playground';

-- Reorder existing SQL lessons (Shift by 1)
UPDATE public.lessons 
SET "order" = "order" + 1 
WHERE module_id = 'db-mod-1' 
  AND id != 'db-intro-lab' 
  AND "order" >= 2 
  AND id != 'db-intro';
