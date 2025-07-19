-- Insert sample data for testing

-- Sample organizer profile
INSERT INTO profiles (id, email, full_name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'organizer@university.edu', 'Sarah Johnson', 'organizer'),
('550e8400-e29b-41d4-a716-446655440002', 'sponsor@techcorp.com', 'Mike Chen', 'sponsor');

INSERT INTO organizers (id, university, position, phone, profile_completion) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Stanford University', 'Event Coordinator', '+1-555-0123', 85);

INSERT INTO sponsors (id, company_name, industry, description, preferred_event_types, profile_completion) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'TechCorp Solutions', 'Technology', 'Leading software development company', ARRAY['tech', 'workshop'], 90);

-- Sample event
INSERT INTO events (id, organizer_id, title, description, category, event_date, expected_audience, sponsorship_needs) VALUES 
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Tech Innovation Summit 2024', 'Annual technology conference featuring latest innovations', 'tech', '2024-06-15', 500, ARRAY['monetary', 'product']);

-- Generate match
INSERT INTO matches (event_id, sponsor_id, match_score) VALUES 
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 
 calculate_match_score('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'));

-- Note: This script should be run after users are created through the auth system
-- The profiles will be automatically created via the trigger

-- Sample data - these IDs should match actual user IDs from auth.users
-- You can get these IDs after creating users through the signup process

-- Update organizer data (replace with actual user ID)
-- INSERT INTO organizers (id, university, position, phone, profile_completion) VALUES 
-- ('your-actual-organizer-user-id', 'Stanford University', 'Event Coordinator', '+1-555-0123', 85);

-- Update sponsor data (replace with actual user ID)  
-- INSERT INTO sponsors (id, company_name, industry, description, preferred_event_types, profile_completion) VALUES 
-- ('your-actual-sponsor-user-id', 'TechCorp Solutions', 'Technology', 'Leading software development company', ARRAY['tech', 'workshop'], 90);

-- Sample event (replace organizer_id with actual user ID)
-- INSERT INTO events (id, organizer_id, title, description, category, event_date, expected_audience, sponsorship_needs) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440003', 'your-actual-organizer-user-id', 'Tech Innovation Summit 2024', 'Annual technology conference featuring latest innovations', 'tech', '2024-06-15', 500, ARRAY['monetary', 'product']);

-- Generate match (replace with actual IDs)
-- INSERT INTO matches (event_id, sponsor_id, match_score) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440003', 'your-actual-sponsor-user-id', 
--  calculate_match_score('550e8400-e29b-41d4-a716-446655440003', 'your-actual-sponsor-user-id'));

-- For testing purposes, you can create sample data after signing up users through the app
SELECT 'Database schema created successfully. Sign up users through the app to populate data.' as status;
