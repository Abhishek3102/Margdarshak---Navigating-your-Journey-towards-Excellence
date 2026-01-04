-- FINAL FIX: DECOUPLING DIAGNOSTIC QUIZ FROM GENERATED QUIZ
-- Run this in Supabase SQL Editor

-- 1. Remove the strict link between Quiz Results and Generated Quizzes
-- This allows "Diagnostic Quizzes" (which are static files) to exist without a parent "Generated Quiz" DB entry.
ALTER TABLE public.quiz_results DROP CONSTRAINT IF EXISTS quiz_results_quiz_id_fkey;

-- 2. Allow quiz_id to be NULL (Optional, but good safety if we just want to track student performance)
ALTER TABLE public.quiz_results ALTER COLUMN quiz_id DROP NOT NULL;

-- 3. Ensure all Data Columns exist (for the rich analysis you requested)
ALTER TABLE public.quiz_results ADD COLUMN IF NOT EXISTS subject_scores JSONB;
ALTER TABLE public.quiz_results ADD COLUMN IF NOT EXISTS time_analysis JSONB;
ALTER TABLE public.quiz_results ADD COLUMN IF NOT EXISTS ai_review TEXT;
ALTER TABLE public.quiz_results ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.quiz_results ADD COLUMN IF NOT EXISTS student_grade TEXT;
ALTER TABLE public.quiz_results ADD COLUMN IF NOT EXISTS total_questions INTEGER;

-- 4. Clean up any "Bad" data constraints if they exist
-- (None usually, but good to be safe)

-- 5. Force Reload Schema Cache
NOTIFY pgrst, 'reload schema';
