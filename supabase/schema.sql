-- Drop tables if they exist to allow clean recreations
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS kards CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS kard_daily_reset CASCADE;

-- 1. Profiles Table
-- Extended from Supabase auth.users
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    alias TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Note: We disable RLS on Profiles temporarily for ease of development, 
-- but in production we would want users to only read their profile or others'.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Kards Table
-- Represents the topics/chat rooms
CREATE TABLE kards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE kards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kards are viewable by everyone." ON kards FOR SELECT USING (true);
-- For the scope of the app, AI/Admin functions will create kards. 
-- We'll allow authenticated users to insert/update kards for simplicity in this demo build.
CREATE POLICY "Authenticated users can update kards." ON kards FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert kards." ON kards FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Messages Table
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kard_id UUID REFERENCES kards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    alias TEXT NOT NULL,
    message TEXT NOT NULL,
    is_ai BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages are viewable by everyone." ON messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert messages." ON messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Daily Reset Tracking
CREATE TABLE kard_daily_reset (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    last_reset TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Configure Realtime replica identity
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE kards;

-- Seed data for initial 3 Kards
INSERT INTO kards (title, summary) VALUES
('Tech Startup Stacks', 'Developers are debating whether to use Next.js or stick to Vite for SPAs.'),
('Weekend Movie Suggestions', 'People are recommending their favorite A24 movies for the weekend.'),
('Exam Survival Tips', 'Students sharing effective Pomodoro techniques and caffeine limits.');
