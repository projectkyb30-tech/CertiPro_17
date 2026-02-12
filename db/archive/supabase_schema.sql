-- Enable UUID extension
-- STATUS: ✅ EXECUTAT PE 04.02.2026
-- ACESTA ESTE CODUL PE CARE TREBUIE SA IL COPIEZI IN SUPABASE SQL EDITOR
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  streak integer default 0,
  xp integer default 0,
  lessons_completed_today integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- COURSES TABLE
create table public.courses (
  id text primary key, -- using text id like 'python-basics' for URL friendliness
  title text not null,
  description text,
  icon text,
  total_lessons integer default 0,
  duration_hours integer default 0,
  price numeric default 0,
  is_locked boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.courses enable row level security;
create policy "Courses are viewable by everyone." on public.courses for select using ( true );

-- MODULES TABLE
create table public.modules (
  id text primary key,
  course_id text references public.courses(id) on delete cascade not null,
  title text not null,
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.modules enable row level security;
create policy "Modules are viewable by everyone." on public.modules for select using ( true );

-- LESSONS TABLE
create table public.lessons (
  id text primary key,
  module_id text references public.modules(id) on delete cascade not null,
  title text not null,
  type text check (type in ('text', 'quiz', 'code', 'video')),
  duration text,
  content text, -- Markdown content
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.lessons enable row level security;
create policy "Lessons are viewable by everyone." on public.lessons for select using ( true );

-- USER PROGRESS TABLE
create table public.user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id text references public.lessons(id) on delete cascade not null,
  is_completed boolean default false,
  completed_at timestamp with time zone,
  unique(user_id, lesson_id)
);

alter table public.user_progress enable row level security;

create policy "Users can view own progress"
  on public.user_progress for select
  using ( auth.uid() = user_id );

create policy "Users can update own progress"
  on public.user_progress for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own progress update"
  on public.user_progress for update
  using ( auth.uid() = user_id );

-- STORAGE BUCKETS (Optional for now, but good to have)
insert into storage.buckets (id, name)
values ('avatars', 'avatars')
on conflict do nothing;

create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );
