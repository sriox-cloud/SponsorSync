-- First, let's clean up any existing tables and start fresh
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS sponsors CASCADE;
DROP TABLE IF EXISTS organizers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS sponsorship_type CASCADE;
DROP TYPE IF EXISTS event_category CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS calculate_match_score(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

SELECT 'Database reset complete' as status;
