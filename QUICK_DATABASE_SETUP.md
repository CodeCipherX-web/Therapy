# Quick Database Setup for Mood Tracker

## Problem
The error "Could not find the table 'public.mood_entries'" means the table doesn't exist in your Supabase database yet.

## Solution: Create the Table

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Log in and select your project

### Step 2: Open SQL Editor
1. Click on **SQL Editor** in the left sidebar
2. Click **New Query**

### Step 3: Copy and Run This SQL

Copy the entire SQL script below and paste it into the SQL Editor, then click **Run**:

```sql
-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_value INTEGER NOT NULL CHECK (mood_value >= 0 AND mood_value <= 10),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS mood_entries_user_id_idx ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS mood_entries_created_at_idx ON mood_entries(created_at DESC);

-- Enable Row Level Security
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (users can only see/edit their own entries)
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
```

### Step 4: Verify Setup

After running the SQL, verify the table was created by running this in the SQL Editor:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'mood_entries';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'mood_entries';
```

### Step 5: Test
1. Go back to your app
2. Sign in (if not already signed in)
3. Try saving a mood entry again

## For Complete Setup (All Tables)

If you also want to set up chat and journal features, run the complete setup from `supabase_complete_setup.sql` which includes:
- `mood_entries` table
- `chat_messages` table
- `journals` table

---

**That's it!** After running the SQL, the mood tracker should work. The error was simply that the database table didn't exist yet.

