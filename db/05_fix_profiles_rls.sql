-- FIX RLS POLICY FOR PROFILES TABLE
-- Data: 05 Feb 2026
-- Descriere: Adaugă politica lipsă de INSERT pentru tabela profiles.
-- Aceasta rezolvă eroarea "new row violates row-level security policy" la crearea/actualizarea profilului.

-- 1. Verificăm dacă politica există deja (pentru a evita erori la rulare multiplă)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        -- 2. Creăm politica de INSERT
        CREATE POLICY "Users can insert own profile" 
        ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END
$$;

-- 3. Asigurăm că politicile de SELECT și UPDATE sunt corecte (idempotent)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Confirmare
SELECT 'RLS Policies for profiles table updated successfully' as status;
