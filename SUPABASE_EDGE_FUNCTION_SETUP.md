# Supabase Edge Function Setup Guide

This guide explains how to set up Supabase Edge Functions for your project.

## 📋 Prerequisites

1. Supabase account and project
2. Supabase CLI installed

## 🚀 Step-by-Step Setup

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

Or using other package managers:
```bash
# Homebrew (Mac)
brew install supabase/tap/supabase

# Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate.

### Step 3: Link Your Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Find your project ref in Supabase Dashboard → Settings → General → Reference ID

### Step 4: Set Environment Secrets

Store your secrets:

```bash
supabase secrets set SITE_URL=https://tranquilmind.app
```

**Important:** These secrets are encrypted and only accessible to your Edge Functions.

### Step 5: Deploy the Edge Function

```bash
supabase functions deploy chat
```

This will deploy the function located at `supabase/functions/chat/index.ts`

### Step 6: Get Your Function URL

After deployment, your function will be available at:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/chat
```

### Step 7: Update Frontend Configuration

The chat now uses enhanced pattern matching and doesn't require a backend server or Edge Function. The configuration is already set up in `config.js`.

### Step 9: Test the Function

1. Open your app in the browser
2. Try sending a chat message
3. Check browser console for any errors
4. Check Supabase Dashboard → Edge Functions → Logs for function logs

## 🔧 Local Development

To test the Edge Function locally before deploying:

```bash
# Start local Supabase (includes Edge Functions)
supabase start

# Serve functions locally
supabase functions serve chat

# Function will be available at:
# http://localhost:54321/functions/v1/chat
```

The chat now uses pattern matching and doesn't require a backend server or Edge Function for local testing.

## 📊 Monitoring

View function logs and metrics in Supabase Dashboard:
- **Edge Functions** → **chat** → **Logs**
- **Edge Functions** → **chat** → **Metrics**

## 🗑️ Cleanup

The chat now uses pattern matching and doesn't require a backend server or Edge Function. All backend-related files have been removed.

## ⚠️ Important Notes

1. **Authentication:** Edge Functions can verify Supabase auth tokens automatically
2. **CORS:** Already handled in the Edge Function code
3. **Rate Limiting:** Supabase has built-in rate limiting
4. **Cost:** Free tier includes 500K invocations/month

## 🐛 Troubleshooting

### Function not found (404)
- Check the function name matches: `supabase functions deploy chat`
- Verify the URL in `config.js` is correct


### CORS errors
- Edge Function already includes CORS headers
- Check browser console for specific error

### Function timeout
- Default timeout is 60 seconds

## 📚 Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Edge Functions Examples](https://github.com/supabase/supabase/tree/master/examples/edge-functions)
- [Deno Runtime](https://deno.land/manual)

---

**Need Help?** Check Supabase Dashboard → Edge Functions → Logs for detailed error messages.

