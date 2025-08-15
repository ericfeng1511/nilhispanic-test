-- RLS Policy for school_contacts table
-- This mirrors the existing policy for student_athletes table
-- Allows admin users to read all school contacts

-- First, ensure RLS is enabled on the school_contacts table
ALTER TABLE "public"."school_contacts" ENABLE ROW LEVEL SECURITY;

-- Create the policy that allows admin users to read all school contacts
CREATE POLICY "Admin users can read all school_contacts" 
ON "public"."school_contacts"
AS PERMISSIVE 
FOR SELECT 
TO authenticated 
USING (
  (EXISTS (
    SELECT 1
    FROM profiles
    WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))
  ))
);

-- Optional: If you want to allow admin users to also INSERT, UPDATE, DELETE school contacts
-- Uncomment the policies below:

/*
-- Allow admin users to insert school contacts
CREATE POLICY "Admin users can insert school_contacts" 
ON "public"."school_contacts"
AS PERMISSIVE 
FOR INSERT 
TO authenticated 
WITH CHECK (
  (EXISTS (
    SELECT 1
    FROM profiles
    WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))
  ))
);

-- Allow admin users to update school contacts
CREATE POLICY "Admin users can update school_contacts" 
ON "public"."school_contacts"
AS PERMISSIVE 
FOR UPDATE 
TO authenticated 
USING (
  (EXISTS (
    SELECT 1
    FROM profiles
    WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))
  ))
)
WITH CHECK (
  (EXISTS (
    SELECT 1
    FROM profiles
    WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))
  ))
);

-- Allow admin users to delete school contacts
CREATE POLICY "Admin users can delete school_contacts" 
ON "public"."school_contacts"
AS PERMISSIVE 
FOR DELETE 
TO authenticated 
USING (
  (EXISTS (
    SELECT 1
    FROM profiles
    WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))
  ))
);
*/
