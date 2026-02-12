-- Fix missing columns in enrollments table
-- Run this script in your Supabase SQL Editor to fix the "column does not exist" error.

DO $$
BEGIN
    -- Add progress_percent if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'progress_percent'
    ) THEN
        ALTER TABLE public.enrollments ADD COLUMN progress_percent INTEGER DEFAULT 0;
    END IF;

    -- Add is_completed if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'is_completed'
    ) THEN
        ALTER TABLE public.enrollments ADD COLUMN is_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
