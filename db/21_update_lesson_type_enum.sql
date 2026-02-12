-- Add 'react' and 'presentation' to lesson_type enum
ALTER TYPE public.lesson_type ADD VALUE IF NOT EXISTS 'react';
ALTER TYPE public.lesson_type ADD VALUE IF NOT EXISTS 'presentation';

-- Reload schema cache
NOTIFY pgrst, 'reload schema';