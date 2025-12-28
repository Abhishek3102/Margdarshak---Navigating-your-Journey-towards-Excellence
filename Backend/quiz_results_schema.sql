
create table if not exists public.quiz_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  score integer not null,
  total_questions integer not null,
  subject_scores jsonb not null,
  time_analysis jsonb,
  ai_review text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.quiz_results enable row level security;

-- Policies
create policy "Users can insert their own results"
  on public.quiz_results for insert
  with check (auth.uid() = user_id);

create policy "Users can read their own results"
  on public.quiz_results for select
  using (auth.uid() = user_id);
