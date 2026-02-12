-- Add category column if not exists
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category text;

-- Update existing courses with correct categories and price
UPDATE public.courses 
SET category = 'python', price = 300 
WHERE id = 'python-basics';

UPDATE public.courses 
SET category = 'sql', price = 300 
WHERE id = 'database-fundamentals';

UPDATE public.courses 
SET category = 'networking', price = 300 
WHERE id = 'networking-essentials';

-- Ensure new revenue model consistency (optional, but good for data integrity)
UPDATE public.courses SET price = 300 WHERE price IS NULL;
