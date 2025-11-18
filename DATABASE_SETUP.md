# Database Setup Guide for TranquilMind

This guide will help you set up the complete Supabase database for your TranquilMind application.

## 📋 Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A Supabase project created
3. Your project URL and anon key (found in Project Settings > API)

## 🚀 Quick Setup

### Step 1: Open SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Setup Script

1. Open the file `supabase_complete_setup.sql` in this project
2. Copy the entire contents
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Setup

After running the script, verify that everything was created:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('mood_entries', 'chat_messages', 'journals');

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('mood_entries', 'chat_messages', 'journals');
```

## 📊 Database Schema

### Tables Created

#### 1. `mood_entries`

Stores user mood tracking data.

**Columns:**

- `id` (UUID) - Primary key
- `user_id` (UUID) - References auth.users
- `mood_value` (INTEGER) - Mood rating 0-10
- `note` (TEXT) - Optional note
- `created_at` (TIMESTAMP) - Auto-generated

#### 2. `chat_messages`

Stores chat conversation history.

**Columns:**

- `id` (UUID) - Primary key
- `user_id` (UUID) - References auth.users
- `message` (TEXT) - User message
- `response` (TEXT) - Bot response
- `is_user` (BOOLEAN) - Message type flag
- `created_at` (TIMESTAMP) - Auto-generated

#### 3. `journals`

Stores journal entries with folder organization.

**Columns:**

- `id` (UUID) - Primary key
- `user_id` (UUID) - References auth.users
- `title` (TEXT) - Journal entry title
- `content` (TEXT) - Journal content
- `folder` (TEXT) - Folder name (default: 'general')
- `created_at` (TIMESTAMP) - Auto-generated
- `updated_at` (TIMESTAMP) - Auto-updated on changes

## 🔒 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:

- Users can only **view** their own data
- Users can only **insert** their own data
- Users can only **update** their own data
- Users can only **delete** their own data

### Indexes

Performance indexes are created on:

- `user_id` columns (for fast user queries)
- `created_at` columns (for chronological sorting)
- `folder` column (for journal filtering)
- Composite indexes for common query patterns

## 🛠️ Additional Features

### Automatic Timestamps

- `created_at` is automatically set on insert
- `updated_at` is automatically updated on journal modifications

### Folder Name Normalization

- Folder names are automatically converted to lowercase
- Spaces are replaced with hyphens
- Ensures consistent folder naming

### Helper Views

#### `journal_folders`

Shows folder statistics per user:

- Folder name
- Journal count per folder
- Last entry date

#### `user_statistics`

Aggregated user statistics:

- Total mood entries
- Average mood value
- Total journals
- Total chat messages
- Last activity dates

## 🧪 Testing the Setup

### Test User Creation

1. Go to **Authentication** > **Users** in Supabase
2. Create a test user or use email signup in your app

### Test Data Insertion

After signing in through your app, try:

1. Creating a mood entry
2. Sending a chat message
3. Creating a journal entry

### Verify Data Isolation

1. Create two test users
2. Each user should only see their own data
3. Try accessing another user's data (should fail due to RLS)

## 🔧 Configuration

### Update config.js

Make sure your `config.js` file has the correct Supabase credentials:

```javascript
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
```

Find these in: **Project Settings** > **API**

## 📝 Notes

- All tables use `ON DELETE CASCADE` - if a user is deleted, their data is automatically removed
- The `updated_at` field is only used in the journals table
- Folder names are automatically normalized for consistency
- All timestamps are stored in UTC

## 🐛 Troubleshooting

### "Permission denied" errors

- Make sure RLS policies are created correctly
- Verify the user is authenticated
- Check that `auth.uid()` matches the `user_id` in the data

### Tables not appearing

- Refresh the Supabase dashboard
- Check the SQL Editor for any error messages
- Verify you're looking at the correct project

### Data not saving

- Check browser console for errors
- Verify Supabase credentials in `config.js`
- Ensure user is signed in
- Check RLS policies are not blocking inserts

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase SQL Reference](https://supabase.com/docs/guides/database)

## ✅ Setup Checklist

- [ ] Supabase project created
- [ ] SQL script executed successfully
- [ ] All three tables created (mood_entries, chat_messages, journals)
- [ ] RLS enabled on all tables
- [ ] Indexes created
- [ ] config.js updated with credentials
- [ ] Test user created
- [ ] Test data inserted successfully
- [ ] Data isolation verified

---

**Need Help?** Check the Supabase documentation or review the error messages in the SQL Editor.
