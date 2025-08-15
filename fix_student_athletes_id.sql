-- Create the sequence for auto-incrementing id
CREATE SEQUENCE student_athletes_id_seq;

-- Set the id column to use the sequence as default
ALTER TABLE student_athletes 
ALTER COLUMN id SET DEFAULT nextval('student_athletes_id_seq'::regclass);

-- Make the sequence owned by the id column (for proper cleanup)
ALTER SEQUENCE student_athletes_id_seq OWNED BY student_athletes.id;

-- Set the sequence to start from the next available number
-- (in case there are existing records)
SELECT setval('student_athletes_id_seq', COALESCE(MAX(id), 0) + 1, false) FROM student_athletes;
