# Quick Journal Database Setup

## Problem
The error "Could not find the table 'public.journals'" means the journals table doesn't exist in your Supabase database yet.

## Solution: Create the Journals Table

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Log in and select your project

### Step 2: Open SQL Editor
1. Click on **SQL Editor** in the left sidebar
2. Click **New Query**

### Step 3: Copy and Run This SQL

Copy the entire SQL script below and paste it into the SQL Editor, then click **Run**:

```sql
-- Create journals table
CREATE TABLE IF NOT EXISTS journals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  folder TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS journals_user_id_idx ON journals(user_id);
CREATE INDEX IF NOT EXISTS journals_folder_idx ON journals(folder);
CREATE INDEX IF NOT EXISTS journals_created_at_idx ON journals(created_at DESC);
CREATE INDEX IF NOT EXISTS journals_user_folder_idx ON journals(user_id, folder);

-- Enable Row Level Security
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (users can only see/edit their own journals)
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

-- Function to normalize folder names (optional but helpful)
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
```

### Step 4: Verify Setup

After running the SQL, verify the table was created by running this in the SQL Editor:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'journals';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'journals';
```

### Step 5: Test
1. Go back to your app
2. Sign in (if not already signed in)
3. Try saving a journal entry again

## Complete Setup (All Tables)

If you want to set up all tables at once (mood, chat, and journals), run the complete setup from `supabase_complete_setup.sql` which includes all three tables.

---

**That's it!** After running the SQL, the journal feature should work. The error was simply that the database table didn't exist yet.

