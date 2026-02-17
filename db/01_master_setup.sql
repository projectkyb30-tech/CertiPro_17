-- ==========================================
-- CERTIPRO MASTER DATABASE SETUP SCRIPT
-- ==========================================
-- Data: 05 Feb 2026
-- Descriere: Script complet de resetare și inițializare a bazei de date.
-- ATENTIE: Acest script STERGE toate datele existente în tabelele publice!

-- 1. CURĂȚARE (RESET)
-- ATENȚIE: DROP TABLE este dezactivat pentru siguranță în scriptul master.
-- Folosiți migrații incrementale pentru modificări de schemă.
/*
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.modules CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.user_purchases CASCADE;
*/

-- Ștergem tipurile custom dacă există
DROP TYPE IF EXISTS public.lesson_type;
DROP TYPE IF EXISTS public.payment_status;

-- Activăm extensii necesare
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DEFINIRE TIPURI (ENUMS)
CREATE TYPE public.lesson_type AS ENUM ('text', 'video', 'quiz', 'code');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- 3. CREARE TABELE

-- 3.1 PROFILES (Extinde auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    phone TEXT,
    birth_date DATE,
    streak INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    lessons_completed_today INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.2 COURSES (Catalogul de cursuri)
CREATE TABLE public.courses (
    id TEXT PRIMARY KEY, -- ex: 'python-basics'
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- nume iconita (ex: 'python')
    total_lessons INTEGER DEFAULT 0,
    duration_hours NUMERIC(10, 2) DEFAULT 0,
    price NUMERIC(10, 2) DEFAULT 0.00 CHECK (price >= 0),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.3 MODULES (Structura cursurilor)
CREATE TABLE public.modules (
    id TEXT PRIMARY KEY, -- ex: 'py-mod-1'
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.4 LESSONS (Conținutul)
CREATE TABLE public.lessons (
    id TEXT PRIMARY KEY, -- ex: 'py-intro'
    module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type public.lesson_type DEFAULT 'text',
    duration TEXT, -- ex: '5 min'
    content TEXT, -- Markdown sau URL video
    is_free BOOLEAN DEFAULT FALSE, -- Pentru preview
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.5 ENROLLMENTS (Înscrieri utilizatori la cursuri)
CREATE TABLE public.enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    progress_percent INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, course_id)
);

-- 3.6 USER PURCHASES (Consolidat)
CREATE TABLE IF NOT EXISTS public.user_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    course_id TEXT NOT NULL,
    stripe_session_id TEXT UNIQUE NOT NULL,
    payment_intent_id TEXT,
    amount_total INTEGER NOT NULL, -- Suma în bani/cents
    currency TEXT NOT NULL DEFAULT 'ron',
    status TEXT NOT NULL DEFAULT 'paid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.7 USER PROGRESS (Progres detaliat per lecție)
CREATE TABLE public.user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER, -- Pentru quiz-uri
    UNIQUE(user_id, lesson_id)
);

-- 4. SECURITATE (RLS - Row Level Security)

-- Activare RLS pe toate tabelele
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Politici PROFILES
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Politici COURSES, MODULES, LESSONS (Catalog public)
CREATE POLICY "Courses are viewable by everyone" 
ON public.courses FOR SELECT USING (true);

CREATE POLICY "Modules are viewable by everyone" 
ON public.modules FOR SELECT USING (true);

CREATE POLICY "Lessons are viewable by everyone" 
ON public.lessons FOR SELECT USING (true);

-- Politici ENROLLMENTS
CREATE POLICY "Users can view own enrollments" 
ON public.enrollments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own enrollment" 
ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politici USER PURCHASES
CREATE POLICY "Users can view own purchases" 
ON public.user_purchases FOR SELECT USING (auth.uid() = user_id);

-- Politici USER PROGRESS
CREATE POLICY "Users can view own progress" 
ON public.user_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update own progress" 
ON public.user_progress FOR ALL USING (auth.uid() = user_id);


-- 5. AUTOMATIZĂRI (TRIGGERS)

-- 5.1 Trigger pentru crearea automată a profilului la Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    now(), 
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreăm trigger-ul pe auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5.2 Trigger pentru updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- 6. DATE INIȚIALE (SEED DATA)
-- Inserăm cursurile de bază (Metadata doar, fără lecții detaliate momentan)

INSERT INTO public.courses (id, title, description, icon, total_lessons, duration_hours, price, is_published)
VALUES 
('python-basics', 'ITS - Python', 'Certificare oficială Certiport IT Specialist în Python.', 'python', 20, 50.00, 150.00, true),
('database-fundamentals', 'ITS - Databases (SQL)', 'Certificare oficială Certiport IT Specialist în Baze de Date.', 'database', 25, 55.00, 150.00, true),
('networking-basics', 'ITS - Networking', 'Bazele rețelelor de calculatoare și internetului.', 'network', 18, 40.00, 150.00, true);

-- 7. INDECȘI PENTRU PERFORMANȚĂ
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON public.user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_course_id ON public.user_purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);

-- GATA! Baza de date este pregătită pentru producție.
