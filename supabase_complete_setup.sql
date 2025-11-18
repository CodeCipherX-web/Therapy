-- ============================================
-- TranquilMind - Complete Supabase Database Setup
-- ============================================
-- Run this SQL in your Supabase SQL Editor to set up all tables
-- ============================================

-- ============================================
-- 1. MOOD ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_value INTEGER NOT NULL CHECK (mood_value >= 0 AND mood_value <= 10),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for mood_entries
CREATE INDEX IF NOT EXISTS mood_entries_user_id_idx ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS mood_entries_created_at_idx ON mood_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS mood_entries_mood_value_idx ON mood_entries(mood_value);

-- Enable RLS
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mood_entries
CREATE POLICY "Users can view their own mood entries"
  ON mood_entries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood entries"
  ON mood_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries"
  ON mood_entries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries"
  ON mood_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT,
  is_user BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their own chat messages"
  ON chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages"
  ON chat_messages
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages"
  ON chat_messages
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. JOURNALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS journals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  folder TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for journals
CREATE INDEX IF NOT EXISTS journals_user_id_idx ON journals(user_id);
CREATE INDEX IF NOT EXISTS journals_folder_idx ON journals(folder);
CREATE INDEX IF NOT EXISTS journals_created_at_idx ON journals(created_at DESC);
CREATE INDEX IF NOT EXISTS journals_user_folder_idx ON journals(user_id, folder);

-- Enable RLS
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for journals
CREATE POLICY "Users can view their own journals"
  ON journals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journals"
  ON journals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journals"
  ON journals
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journals"
  ON journals
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on journal updates
DROP TRIGGER IF EXISTS update_journals_updated_at ON journals;
CREATE TRIGGER update_journals_updated_at
  BEFORE UPDATE ON journals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. USEFUL VIEWS (Optional but helpful)
-- ============================================

-- View: Journal folders with counts
CREATE OR REPLACE VIEW journal_folders AS
SELECT 
  user_id,
  folder,
  COUNT(*) as journal_count,
  MAX(created_at) as last_entry
FROM journals
GROUP BY user_id, folder;

-- View: User statistics (mood averages, journal counts, etc.)
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  u.id as user_id,
  COUNT(DISTINCT me.id) as total_mood_entries,
  AVG(me.mood_value) as avg_mood,
  COUNT(DISTINCT j.id) as total_journals,
  COUNT(DISTINCT cm.id) as total_chat_messages,
  MAX(me.created_at) as last_mood_entry,
  MAX(j.created_at) as last_journal_entry
FROM auth.users u
LEFT JOIN mood_entries me ON u.id = me.user_id
LEFT JOIN journals j ON u.id = j.user_id
LEFT JOIN chat_messages cm ON u.id = cm.user_id
GROUP BY u.id;

-- ============================================
-- 6. DATA VALIDATION & CONSTRAINTS
-- ============================================

-- Add constraint to ensure folder names are lowercase (optional)
-- This helps with consistency
CREATE OR REPLACE FUNCTION validate_folder_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.folder = LOWER(TRIM(NEW.folder));
  -- Replace spaces with hyphens
  NEW.folder = REGEXP_REPLACE(NEW.folder, '\s+', '-', 'g');
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS validate_journal_folder ON journals;
CREATE TRIGGER validate_journal_folder
  BEFORE INSERT OR UPDATE ON journals
  FOR EACH ROW
  EXECUTE FUNCTION validate_folder_name();

-- ============================================
-- 7. CLEANUP FUNCTIONS (Optional)
-- ============================================

-- Function to delete old chat messages (older than specified days)
-- Useful for data cleanup if needed
CREATE OR REPLACE FUNCTION cleanup_old_chat_messages(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM chat_messages
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ language 'plpgsql';

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now ready to use with:
-- 1. mood_entries - for mood tracking
-- 2. chat_messages - for chat history
-- 3. journals - for journal entries with folders
--
-- All tables have:
-- - Row Level Security (RLS) enabled
-- - Proper indexes for performance
-- - User isolation (users can only see their own data)
-- - Automatic timestamp management
--
-- To verify everything is set up correctly:
-- 1. Check that all tables exist: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- 2. Check RLS is enabled: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- 3. Test by creating a test user and inserting data
-- ============================================

