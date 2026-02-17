-- 22_secure_profiles_pii.sql
-- Secures PII (Personally Identifiable Information) in profiles table

-- 1. Drop the overly permissive public view policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 2. Create a restricted policy: users can only see their own FULL profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

-- 3. Create a public view for leaderboards/public info (No PII)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    id, 
    full_name, 
    avatar_url, 
    streak, 
    xp, 
    created_at
FROM public.profiles;

-- 4. Allow authenticated users to see the public view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- 5. Add a comment for documentation
COMMENT ON VIEW public.public_profiles IS 'Publicly accessible profile information excluding PII like email, phone, and birth_date.';
