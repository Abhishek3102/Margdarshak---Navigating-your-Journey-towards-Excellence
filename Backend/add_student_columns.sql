-- Run this in your Supabase SQL Editor

ALTER TABLE quiz_results 
ADD COLUMN IF NOT EXISTS student_name TEXT,
ADD COLUMN IF NOT EXISTS student_grade TEXT;

-- Optional: Create an index for faster filtering by grade
CREATE INDEX IF NOT EXISTS idx_quiz_results_grade ON quiz_results(student_grade);
