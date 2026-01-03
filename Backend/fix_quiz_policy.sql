-- Allow students (and all users) to READ quizzes
drop policy "Users can manage own quizzes" on public.generated_quizzes;
create policy "Public Read Quizzes" on public.generated_quizzes for select using (true);
create policy "Owner Write Quizzes" on public.generated_quizzes for insert with check (auth.uid() = user_id);
create policy "Owner Delete Quizzes" on public.generated_quizzes for delete using (auth.uid() = user_id);

-- Allow students to READ questions
drop policy "Users can manage own questions" on public.generated_questions;
create policy "Public Read Questions" on public.generated_questions for select using (true);
create policy "Owner Write Questions" on public.generated_questions for insert with check (auth.uid() = user_id);
create policy "Owner Delete Questions" on public.generated_questions for delete using (auth.uid() = user_id);
