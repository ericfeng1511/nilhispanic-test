-- Enable RLS on student_athletes table (if not already enabled)
ALTER TABLE student_athletes ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view student athletes (for public browsing)
DROP POLICY IF EXISTS "Anyone can view student athletes" ON student_athletes;
CREATE POLICY "Anyone can view student athletes" ON student_athletes
  FOR SELECT USING (true);

-- Policy to allow authenticated users to insert new student athlete entries
-- This is needed for the signup process
DROP POLICY IF EXISTS "Authenticated users can insert student athletes" ON student_athletes;
CREATE POLICY "Authenticated users can insert student athletes" ON student_athletes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow athletes to update their own data
DROP POLICY IF EXISTS "Athletes can update their own data" ON student_athletes;
CREATE POLICY "Athletes can update their own data" ON student_athletes
  FOR UPDATE USING (
    auth.uid() = profile_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy to allow admins to manage all student athletes
DROP POLICY IF EXISTS "Admins can manage student athletes" ON student_athletes;
CREATE POLICY "Admins can manage student athletes" ON student_athletes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
