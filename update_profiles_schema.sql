-- UPGRADE PROFILES TABLE
-- Add missing columns for Complete Profile flow
-- STATUS: ⏳ PENDING EXECUTION

alter table public.profiles 
add column if not exists phone text,
add column if not exists bio text,
add column if not exists birth_date date;

-- Add a check to ensure we can store these details
comment on column public.profiles.phone is 'User phone number';
comment on column public.profiles.bio is 'Short biography';
comment on column public.profiles.birth_date is 'Date of birth';
