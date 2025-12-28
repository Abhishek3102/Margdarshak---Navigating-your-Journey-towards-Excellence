-- Feedback Table
create table if not exists public.feedback (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  type text not null, -- 'course', 'platform', 'bug', 'quick'
  course_id uuid references public.subjects(id), -- Optional link to subject/course
  rating integer,
  message text,
  status text default 'new', -- 'new', 'reviewed', 'resolved'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.feedback enable row level security;

-- Policy: Users can see only their own feedback (Or maybe none if it's submit-only)
create policy "Users can insert their own feedback" on public.feedback for insert with check (auth.uid() = user_id);
create policy "Users can view their own feedback" on public.feedback for select using (auth.uid() = user_id);

-- Admin Policy (Conceptual - strictly enforced by Service Role in API for now)
-- create policy "Admins can view all" on feedback for select using ( ... role check ... );
