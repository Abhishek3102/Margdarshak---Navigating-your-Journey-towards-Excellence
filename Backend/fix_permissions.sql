-- Disable RLS on content tables to allow the seed script to run without a Service Role Key
alter table public.standards disable row level security;
alter table public.subjects disable row level security;
alter table public.chapters disable row level security;
alter table public.videos disable row level security;
alter table public.chapter_prerequisites disable row level security;
