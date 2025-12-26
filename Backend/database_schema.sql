-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text check (role in ('student', 'teacher', 'admin')) default 'student',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. ACADEMIC HIERARCHY

-- Standards (Class 10, Class 11, etc.)
create table public.standards (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subjects (Physics, Math)
create table public.subjects (
  id uuid default uuid_generate_v4() primary key,
  standard_id uuid references public.standards(id) not null,
  name text not null,
  icon_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chapters (Kinematics, Integration)
create table public.chapters (
  id uuid default uuid_generate_v4() primary key,
  subject_id uuid references public.subjects(id) not null,
  title text not null,
  description text,
  sequence_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chapter Prerequisites (Self-Join Request)
-- e.g. "Integration" (chapter_id) requires "Limits" (prerequisite_chapter_id)
create table public.chapter_prerequisites (
  chapter_id uuid references public.chapters(id) not null,
  prerequisite_chapter_id uuid references public.chapters(id) not null,
  primary key (chapter_id, prerequisite_chapter_id)
);

-- Videos
create table public.videos (
  id uuid default uuid_generate_v4() primary key,
  chapter_id uuid references public.chapters(id) not null,
  title text not null,
  video_url text not null, -- Cloudinary URL
  duration_seconds integer default 0,
  sequence_order integer default 0,
  concept_tags text[], -- Array of strings e.g. ['calculus', 'limits']
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ROW LEVEL SECURITY (RLS) policies
alter table profiles enable row level security;
alter table standards enable row level security;
alter table subjects enable row level security;
alter table chapters enable row level security;
alter table videos enable row level security;

-- Policies (Simple for now: Read for everyone, Write for Admins)
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

create policy "Content is viewable by everyone" on standards for select using (true);
create policy "Content is viewable by everyone" on subjects for select using (true);
create policy "Content is viewable by everyone" on chapters for select using (true);
create policy "Content is viewable by everyone" on videos for select using (true);
