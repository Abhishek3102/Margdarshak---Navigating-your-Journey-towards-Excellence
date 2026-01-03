-- Create table for storing student quiz attempts
-- DROP TABLE first to ensure schema update (Development only)
drop table if exists public.quiz_results cascade;

create table public.quiz_results (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    quiz_id uuid references public.generated_quizzes(id) not null,
    score integer not null,
    ai_analysis text, -- Markdown text from Gemini
    responses jsonb, -- { qIdx: { selected: "A", time: 10, hint_used: false } }
    jira_ticket_key text, -- e.g. SCRUM-5
    jira_ticket_url text, -- e.g. https://...
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Constraint: One attempt per quiz per user
    unique(user_id, quiz_id)
);

-- Enable RLS
alter table public.quiz_results enable row level security;

-- Policies (Drop first to avoid duplication errors during re-runs)
drop policy if exists "Users can insert their own results" on public.quiz_results;
create policy "Users can insert their own results"
    on public.quiz_results for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can read their own results" on public.quiz_results;
create policy "Users can read their own results"
    on public.quiz_results for select
    using (auth.uid() = user_id);

drop policy if exists "Teachers can read all results" on public.quiz_results;
create policy "Teachers can read all results"
    on public.quiz_results for select
    using ( 
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'teacher'
    );
