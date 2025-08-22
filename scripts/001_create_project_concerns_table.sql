-- Create the project_concerns table for storing student project concern submissions
CREATE TABLE IF NOT EXISTS public.project_concerns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  group_number TEXT NOT NULL,
  project_title TEXT NOT NULL,
  student_names TEXT NOT NULL,
  mentor_name TEXT NOT NULL,
  concern_description TEXT NOT NULL,
  preferred_mentor TEXT NOT NULL CHECK (preferred_mentor IN ('Srikanth', 'Sanjana'))
);

-- Enable Row Level Security
ALTER TABLE public.project_concerns ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert data (for user form submissions)
CREATE POLICY "Allow anonymous insert on project_concerns" 
ON public.project_concerns 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow authenticated users to read all data (for admin dashboard)
CREATE POLICY "Allow authenticated read on project_concerns" 
ON public.project_concerns 
FOR SELECT 
TO authenticated 
USING (true);

-- Create an index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_project_concerns_created_at ON public.project_concerns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_concerns_group_number ON public.project_concerns(group_number);
CREATE INDEX IF NOT EXISTS idx_project_concerns_project_title ON public.project_concerns(project_title);
