-- Step 1: Create the basic types
CREATE TYPE user_role AS ENUM ('organizer', 'sponsor', 'admin');
CREATE TYPE event_category AS ENUM ('tech', 'culture', 'sports', 'workshop', 'seminar', 'conference', 'other');
CREATE TYPE sponsorship_type AS ENUM ('monetary', 'product', 'swag', 'media', 'venue', 'other');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'declined', 'withdrawn');

-- Step 2: Create the profiles table (most important)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create organizers table
CREATE TABLE organizers (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  university TEXT,
  position TEXT,
  phone TEXT,
  social_media JSONB DEFAULT '{}',
  verification_status BOOLEAN DEFAULT FALSE,
  profile_completion INTEGER DEFAULT 0
);

-- Step 4: Create sponsors table
CREATE TABLE sponsors (
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

-- Step 5: Create remaining tables
CREATE TABLE events (
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

CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE NOT NULL,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, sponsor_id)
);

CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE NOT NULL,
  status application_status DEFAULT 'pending',
  proposal_message TEXT,
  response_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sponsor_id, event_id)
);

-- Disable RLS for now to avoid permission issues
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizers DISABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;

-- Create function for match scoring
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

-- Create trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Success message without test insert
SELECT 'Database setup completed successfully!' as status;
SELECT 'Tables created: profiles, organizers, sponsors, events, matches, applications, messages, bookmarks' as tables;
SELECT 'RLS disabled for testing. Trigger created for automatic profile creation.' as notes;
