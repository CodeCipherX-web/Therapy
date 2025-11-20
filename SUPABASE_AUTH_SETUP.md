# Supabase Authentication Setup

## Disable Email Confirmation (Required)

To allow automatic login after signup without email verification, you need to disable email confirmation in your Supabase project.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Open Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on **Settings** tab

3. **Disable Email Confirmation**
   - Find the section **"Email Auth"** or **"Email Confirmation"**
   - Toggle **"Enable email confirmations"** to **OFF**
   - Or set **"Confirm email"** to **Disabled**

4. **Save Changes**
   - Click **Save** if needed
   - Changes take effect immediately

### Alternative: Using SQL

You can also disable email confirmation using SQL in the Supabase SQL Editor:

```sql
-- Disable email confirmation for all users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Or disable it at the project level via Dashboard Settings
```

### What This Does:

- **Before**: Users must click a confirmation link in their email before they can sign in
- **After**: Users are automatically logged in immediately after signup

### Security Note:

Disabling email confirmation means anyone can sign up with any email address, even if they don't own it. For production apps, consider:
- Using email confirmation in production
- Using other authentication methods (OAuth, Magic Links)
- Implementing additional verification steps

### Test It:

1. Sign up with a new account
2. You should be automatically logged in (no email check needed)
3. The "Sign out" button should appear immediately

---

**Need Help?** Check the [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

