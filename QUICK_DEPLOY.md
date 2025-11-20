# 🚀 Quick Deploy Guide - Supabase Edge Function

## Easiest Method: Use Supabase Dashboard

Since CLI installation has issues on Windows, use the dashboard:

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Login and select your project: **rgdvmeljlxedhxnkmmgh**

### Step 2: Create Edge Function
1. Click **"Edge Functions"** in the left sidebar
2. Click **"Create a new function"**
3. Function name: **`chat`**
4. Copy the entire code from: `supabase/functions/chat/index.ts`
5. Paste it into the code editor
6. Click **"Deploy"**

### Step 3: Set Secrets (IMPORTANT!)
1. Go to **Project Settings** → **Edge Functions** → **Secrets**
2. Add these secrets (click "Add secret" for each):

   **Secret 1:**
   - Name: `OPENROUTER_API_KEY`
   - Value: Your OpenRouter API key

   **Secret 2:**
   - Name: `OPENROUTER_MODEL`
   - Value: `tngtech/deepseek-r1t2-chimera:free`

   **Secret 3:**
   - Name: `SITE_URL`
   - Value: `https://tranquilmind.app`

### Step 4: Test the Function
Your function URL will be:
```
https://rgdvmeljlxedhxnkmmgh.supabase.co/functions/v1/chat
```

You can test it in the dashboard or wait for GitHub Pages to deploy.

### Step 5: Verify GitHub Pages Deployment
1. Go to your GitHub repository
2. Check the Actions tab - the workflow should be running
3. Once complete, your site will be live with the chatbot working!

---

## Alternative: Install CLI via Scoop (Windows)

If you prefer CLI:

```powershell
# Install Scoop (if not installed)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Then follow the CLI deployment steps
supabase login
supabase link --project-ref rgdvmeljlxedhxnkmmgh
supabase secrets set OPENROUTER_API_KEY=your-key-here
supabase secrets set OPENROUTER_MODEL=tngtech/deepseek-r1t2-chimera:free
supabase secrets set SITE_URL=https://tranquilmind.app
supabase functions deploy chat
```

---

## ✅ After Deployment

Once deployed, your chatbot will automatically:
- Use Supabase Edge Function in production (GitHub Pages)
- Use local Node.js backend when running on localhost

No code changes needed - it's already configured!

