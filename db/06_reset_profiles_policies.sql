-- 06_reset_profiles_policies.sql
-- Acest script resetează complet politicile pentru tabela profiles.
-- Rezolvă eroarea "policy already exists" și asigură că regulile sunt corecte pentru a evita "RLS violation".

-- 1. Ștergem politicile existente (indiferent dacă există sau nu)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles; -- În caz că există

-- 2. Activăm RLS (siguranță)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Recreăm politicile corecte

-- SELECT: Oricine poate vedea profilurile (public)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- INSERT: Utilizatorii își pot crea propriul profil (CRITIC pentru înregistrare/profil nou)
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE: Utilizatorii își pot modifica doar propriul profil
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. Permisiuni (Grants) - Asigurăm că rolul 'authenticated' are drepturile necesare
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

SELECT 'Policies reset successfully' as status;
