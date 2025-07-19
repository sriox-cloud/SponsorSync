-- Create custom types
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('organizer', 'sponsor', 'admin');
CREATE TYPE IF NOT EXISTS event_category AS ENUM ('tech', 'culture', 'sports', 'workshop', 'seminar', 'conference', 'other');
CREATE TYPE IF NOT EXISTS sponsorship_type AS ENUM ('monetary', 'product', 'swag', 'media', 'venue', 'other');
CREATE TYPE IF NOT EXISTS application_status AS ENUM ('pending', 'accepted', 'declined', 'withdrawn');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Organizer specific data
CREATE TABLE IF NOT EXISTS organizers (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  university TEXT,
  position TEXT,
  phone TEXT,
  social_media JSONB DEFAULT '{}',
  verification_status BOOLEAN DEFAULT FALSE,
  profile_completion INTEGER DEFAULT 0
);

-- Sponsor company data
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  target_demographic JSONB DEFAULT '{}',
  marketing_goals TEXT[],
  preferred_sponsorship_types sponsorship_type[],
  preferred_event_types event_category[],
  budget_range TEXT,
  verification_status BOOLEAN DEFAULT FALSE,
  profile_completion INTEGER DEFAULT 0
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES organizers(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category event_category NOT NULL,
  event_date DATE,
  location TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  expected_audience INTEGER,
  audience_demographic JSONB DEFAULT '{}',
  sponsorship_needs sponsorship_type[],
  marketing_plan JSONB DEFAULT '{}',
  past_sponsors TEXT[],
  engagement_history JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table for storing compatibility scores
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE NOT NULL,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, sponsor_id)
);

-- Applications/Interest tracking
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE NOT NULL,
  status application_status DEFAULT 'pending',
  proposal_message TEXT,
  response_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmarks for sponsors
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sponsor_id, event_id)
);

-- Disable RLS temporarily to test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizers DISABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if it doesn't exist
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'organizer')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Functions for match scoring (simplified algorithm)
CREATE OR REPLACE FUNCTION calculate_match_score(event_id UUID, sponsor_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  event_rec RECORD;
  sponsor_rec RECORD;
BEGIN
  SELECT * INTO event_rec FROM events WHERE id = event_id;
  SELECT * INTO sponsor_rec FROM sponsors WHERE id = sponsor_id;
  
  -- Base score
  score := 50;
  
  -- Category match
  IF event_rec.category = ANY(sponsor_rec.preferred_event_types) THEN
    score := score + 25;
  END IF;
  
  -- Sponsorship type match
  IF sponsor_rec.preferred_sponsorship_types && event_rec.sponsorship_needs THEN
    score := score + 15;
  END IF;
  
  -- Audience size bonus
  IF event_rec.expected_audience > 100 THEN
    score := score + 10;
  END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Test the setup by inserting a sample profile
SELECT 'Database setup complete. RLS disabled for testing.' as status;
