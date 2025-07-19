-- Create smart matches for existing sponsors and events

-- Function to generate matches for all sponsors and events
CREATE OR REPLACE FUNCTION generate_smart_matches()
RETURNS void AS $$
DECLARE
  sponsor_rec RECORD;
  event_rec RECORD;
  match_score INTEGER;
BEGIN
  -- Clear existing matches
  DELETE FROM matches;
  
  -- Generate matches for all sponsor-event combinations
  FOR sponsor_rec IN SELECT id FROM sponsors LOOP
    FOR event_rec IN SELECT id FROM events WHERE status = 'published' LOOP
      -- Calculate match score
      match_score := calculate_match_score(event_rec.id, sponsor_rec.id);
      
      -- Only create matches with score >= 50
      IF match_score >= 50 THEN
        INSERT INTO matches (event_id, sponsor_id, match_score, is_featured)
        VALUES (
          event_rec.id, 
          sponsor_rec.id, 
          match_score,
          match_score >= 80  -- Featured if score is 80 or higher
        )
        ON CONFLICT (event_id, sponsor_id) DO UPDATE SET
          match_score = EXCLUDED.match_score,
          is_featured = EXCLUDED.is_featured;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Smart matches generated successfully!';
END;
$$ LANGUAGE plpgsql;

-- Improved match scoring algorithm
CREATE OR REPLACE FUNCTION calculate_match_score(event_id UUID, sponsor_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  event_rec RECORD;
  sponsor_rec RECORD;
  category_match BOOLEAN := FALSE;
  sponsorship_match BOOLEAN := FALSE;
  audience_bonus INTEGER := 0;
BEGIN
  -- Get event and sponsor data
  SELECT * INTO event_rec FROM events WHERE id = event_id;
  SELECT * INTO sponsor_rec FROM sponsors WHERE id = sponsor_id;
  
  -- Base score
  score := 30;
  
  -- Category match (40 points)
  IF event_rec.category = ANY(sponsor_rec.preferred_event_types) THEN
    score := score + 40;
    category_match := TRUE;
  END IF;
  
  -- Sponsorship type match (20 points)
  IF sponsor_rec.preferred_sponsorship_types && event_rec.sponsorship_needs THEN
    score := score + 20;
    sponsorship_match := TRUE;
  END IF;
  
  -- Audience size bonus (up to 10 points)
  IF event_rec.expected_audience >= 1000 THEN
    audience_bonus := 10;
  ELSIF event_rec.expected_audience >= 500 THEN
    audience_bonus := 7;
  ELSIF event_rec.expected_audience >= 100 THEN
    audience_bonus := 5;
  END IF;
  
  score := score + audience_bonus;
  
  -- Perfect match bonus
  IF category_match AND sponsorship_match THEN
    score := score + 10;
  END IF;
  
  -- Ensure score is within bounds
  RETURN LEAST(GREATEST(score, 0), 100);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate matches when events are published
CREATE OR REPLACE FUNCTION auto_generate_matches()
RETURNS TRIGGER AS $$
DECLARE
  sponsor_rec RECORD;
  match_score INTEGER;
BEGIN
  -- Only generate matches for published events
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    -- Generate matches with all sponsors
    FOR sponsor_rec IN SELECT id FROM sponsors LOOP
      match_score := calculate_match_score(NEW.id, sponsor_rec.id);
      
      IF match_score >= 50 THEN
        INSERT INTO matches (event_id, sponsor_id, match_score, is_featured)
        VALUES (NEW.id, sponsor_rec.id, match_score, match_score >= 80)
        ON CONFLICT (event_id, sponsor_id) DO UPDATE SET
          match_score = EXCLUDED.match_score,
          is_featured = EXCLUDED.is_featured;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating matches
DROP TRIGGER IF EXISTS auto_generate_matches_trigger ON events;
CREATE TRIGGER auto_generate_matches_trigger
  AFTER INSERT OR UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION auto_generate_matches();

-- Generate matches for existing data
SELECT generate_smart_matches();

SELECT 'Smart matching system created successfully!' as status;
