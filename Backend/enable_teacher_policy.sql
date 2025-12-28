-- Enable RLS on the table (if not already enabled)
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- 1. Policy for insertion (Students can submit their own results)
-- Ensuring user can insert only their own data is good practice
CREATE POLICY "Enable insert for authenticated users" 
ON quiz_results FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 2. Policy for Students (View own results)
-- This allows students to see their own past attempts
CREATE POLICY "Enable select for users based on user_id" 
ON quiz_results FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 3. Policy for Teachers (View ALL results)
-- We check if the user has the 'teacher' role in their metadata
CREATE POLICY "Enable select for teachers to view all" 
ON quiz_results FOR SELECT 
TO authenticated 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'teacher'
);
