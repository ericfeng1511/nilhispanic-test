-- Add profile_id column to student_athletes table
ALTER TABLE student_athletes 
ADD COLUMN profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_student_athletes_profile_id ON student_athletes(profile_id);

-- Create a function to automatically create student_athlete entry when a new athlete profile is created
CREATE OR REPLACE FUNCTION create_student_athlete_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create entry if the new profile has role 'athlete'
  IF NEW.role = 'athlete' THEN
    INSERT INTO student_athletes (
      profile_id,
      name,
      sport,
      year,
      college,
      hometown,
      gender,
      photo,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(NEW.full_name, 'Unknown'), -- Use profile name or default
      'Unknown', -- Default sport, can be updated later
      'FR', -- Default year, can be updated later
      'Unknown', -- Default college, can be updated later
      'Unknown', -- Default hometown, can be updated later
      'Unknown', -- Default gender, can be updated later
      COALESCE(NEW.avatar_url, ''), -- Use profile avatar or empty string
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically run the function when a new profile is inserted
CREATE OR REPLACE TRIGGER trigger_create_student_athlete
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_student_athlete_entry();

-- Update RLS policy for student_athletes to include profile_id access
DROP POLICY IF EXISTS "Users can view student athletes" ON student_athletes;
CREATE POLICY "Users can view student athletes" ON student_athletes
  FOR SELECT USING (true);

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

DROP POLICY IF EXISTS "Admins can manage student athletes" ON student_athletes;
CREATE POLICY "Admins can manage student athletes" ON student_athletes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
