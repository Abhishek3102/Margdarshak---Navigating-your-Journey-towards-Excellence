-- Table to store Generated Quiz Definitions
create table if not exists public.generated_quizzes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  video_url text not null,
  video_title text,
  difficulty text default 'Medium',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table to store Questions for a generated quiz
create table if not exists public.generated_questions (
  id uuid default gen_random_uuid() primary key,
  quiz_id uuid references public.generated_quizzes(id) on delete cascade not null,
  question_text text not null,
  options jsonb not null, -- {"A": "...", "B": "..."}
  correct_answer text not null, -- "A"
  hint text,
  explanation text,
  sequence_order integer default 0
);

-- RLS Policies
alter table public.generated_quizzes enable row level security;
alter table public.generated_questions enable row level security;

-- Allow users to insert/read their own quizzes
create policy "Users can manage own quizzes"
  on public.generated_quizzes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow users to manage questions of their own quizzes
-- (Complex join policy often simpler to just allow if they own the parent quiz, 
--  but for simplicity in Supabase, we often check auth.uid() against a user_id column if we denormalize, 
--  OR use a join. Let's try to keep it simple: "Insert if you can insert into parent?")
-- Actually, let's just allow ALL for authenticated users for now for Prototype speed, 
-- or duplicate user_id to questions table for easy RLS.
alter table public.generated_questions add column user_id uuid references auth.users(id);

create policy "Users can manage own questions"
  on public.generated_questions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
