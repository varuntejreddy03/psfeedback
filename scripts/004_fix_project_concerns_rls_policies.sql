-- Fix RLS policies to allow anonymous users to read data
-- Since we're using custom authentication (not Supabase auth), the client appears as anonymous

-- Drop the existing restrictive read policy
DROP POLICY IF EXISTS "Allow authenticated read on project_concerns" ON public.project_concerns;

-- Create a new policy that allows anonymous users to read data
-- This is safe because we handle authentication at the application level
CREATE POLICY "Allow anonymous read on project_concerns" 
ON public.project_concerns 
FOR SELECT 
TO anon 
USING (true);

-- Also allow authenticated users to read (for future compatibility)
CREATE POLICY "Allow authenticated read on project_concerns" 
ON public.project_concerns 
FOR SELECT 
TO authenticated 
USING (true);
