-- 1. CLEANUP (Drop tables if they exist to force a fresh structure)
DROP TABLE IF EXISTS public.exam_attempts CASCADE;
DROP TABLE IF EXISTS public.question_answers CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.exams CASCADE;
DROP TABLE IF EXISTS public.user_notes CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.modules CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  streak integer default 0,
  xp integer default 0,
  lessons_completed_today integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. COURSES (Catalog - Public Metadata)
create table public.courses (
  id text primary key, 
  title text not null,
  description text,
  icon text, 
  total_lessons integer default 0,
  duration_hours numeric(5,2) default 0,
  price numeric(10,2) default 0.00,
  is_published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. MODULES (Structure - Public Metadata)
create table public.modules (
  id text primary key, 
  course_id text references public.courses(id) on delete cascade not null,
  title text not null,
  order_index integer not null default 0
);

-- 5. LESSONS (Protected Content)
do $$ begin
    if not exists (select 1 from pg_type where typname = 'lesson_type') then
        create type lesson_type as enum ('text', 'code', 'quiz');
    end if;
end $$;

create table public.lessons (
  id text primary key, 
  module_id text references public.modules(id) on delete cascade not null,
  title text not null,
  type lesson_type not null default 'text',
  duration text, 
  content text, -- SENSITIVE: Protected by RLS
  order_index integer not null default 0
);

-- 6. ENROLLMENTS (Access Control)
create table public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id text references public.courses(id) on delete cascade not null,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  progress_percent integer default 0,
  is_completed boolean default false,
  unique(user_id, course_id)
);

-- 7. PROGRESS (User Data)
create table public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id text references public.lessons(id) on delete cascade not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, lesson_id)
);

-- 8. USER NOTES (User Data)
create table public.user_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  created_at date default current_date not null
);

-- 9. EXAMS (Metadata)
create table public.exams (
  id text primary key, 
  course_id text references public.courses(id) on delete set null,
  title text not null,
  total_questions integer default 0,
  time_limit_minutes integer default 60,
  passing_score integer default 70,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. EXAM ATTEMPTS (User Data)
create table public.exam_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text references public.courses(id) on delete cascade not null,
  score integer not null default 0,
  passed boolean not null default false,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone null
);

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table courses enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table enrollments enable row level security;
alter table user_progress enable row level security;
alter table user_notes enable row level security;
alter table exam_attempts enable row level security;

-- === PUBLIC ACCESS (Catalog) ===
create policy "Public courses viewable" on courses for select using (true);
create policy "Public modules viewable" on modules for select using (true);

-- === PROTECTED CONTENT (Lessons) ===
create policy "Enrolled users view lessons" on lessons
  for select
  using (
    exists (
      select 1 from enrollments e
      join modules m on m.course_id = e.course_id
      where m.id = lessons.module_id
      and e.user_id = auth.uid()
    )
  );

-- === USER DATA (Granular) ===

-- PROFILES
create policy "View own profile" on profiles for select using (auth.uid() = id);
create policy "Update own profile" on profiles for update using (auth.uid() = id);

-- ENROLLMENTS
create policy "View own enrollments" on enrollments for select using (auth.uid() = user_id);

-- USER PROGRESS
create policy "View own progress" on user_progress for select using (auth.uid() = user_id);
create policy "Create own progress" on user_progress for insert with check (auth.uid() = user_id);
create policy "Update own progress" on user_progress for update using (auth.uid() = user_id);
create policy "Delete own progress" on user_progress for delete using (auth.uid() = user_id);

-- USER NOTES
create policy "View own notes" on user_notes for select using (auth.uid() = user_id);
create policy "Create own notes" on user_notes for insert with check (auth.uid() = user_id);
create policy "Update own notes" on user_notes for update using (auth.uid() = user_id);
create policy "Delete own notes" on user_notes for delete using (auth.uid() = user_id);

-- EXAM RESULTS
create policy "Users can view own exam attempts" on exam_attempts for select using (auth.uid() = user_id);
