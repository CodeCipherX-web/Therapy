# Supabase Edge Function Setup Guide

This guide will help you migrate from the Node.js backend (`backend-chat.js`) to a Supabase Edge Function.

## 📋 Prerequisites

1. Supabase account and project
2. Supabase CLI installed
3. OpenRouter API key

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

Store your OpenRouter API key and other secrets:

```bash
supabase secrets set OPENROUTER_API_KEY=your-key-here
supabase secrets set OPENROUTER_MODEL=tngtech/deepseek-r1t2-chimera:free
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

Update `config.js`:

```javascript
// OLD (Node.js backend):
const BACKEND_CHAT_URL = 'http://localhost:3001';

// NEW (Supabase Edge Function):
const BACKEND_CHAT_URL = 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/chat';
```

Replace `YOUR_PROJECT_REF` with your actual Supabase project reference ID.

### Step 8: Update Frontend Code

Update `chat.js` to use the new endpoint:

```javascript
// The function is already set up to use BACKEND_CHAT_URL from config.js
// Just make sure config.js has the correct Supabase URL
```

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

Update `config.js` for local testing:
```javascript
const BACKEND_CHAT_URL = 'http://localhost:54321/functions/v1/chat';
```

## 📊 Monitoring

View function logs and metrics in Supabase Dashboard:
- **Edge Functions** → **chat** → **Logs**
- **Edge Functions** → **chat** → **Metrics**

## 🗑️ Cleanup (After Migration)

Once the Edge Function is working, you can remove:

1. **`backend-chat.js`** - No longer needed
2. **`dotenv` dependency** from `package.json`:
   ```json
   {
     "dependencies": {
       // Remove: "dotenv": "^16.0.0"
     }
   }
   ```
3. **`backend` script** from `package.json`:
   ```json
   {
     "scripts": {
       // Remove: "backend": "node backend-chat.js"
     }
   }
   ```
4. **`.env` file** (or remove `OPENROUTER_API_KEY` from it)

## ⚠️ Important Notes

1. **Authentication:** Edge Functions can verify Supabase auth tokens automatically
2. **CORS:** Already handled in the Edge Function code
3. **Rate Limiting:** Supabase has built-in rate limiting
4. **Cost:** Free tier includes 500K invocations/month

## 🐛 Troubleshooting

### Function not found (404)
- Check the function name matches: `supabase functions deploy chat`
- Verify the URL in `config.js` is correct

### API key not found (500)
- Make sure secrets are set: `supabase secrets list`
- Redeploy after setting secrets: `supabase functions deploy chat`

### CORS errors
- Edge Function already includes CORS headers
- Check browser console for specific error

### Function timeout
- Default timeout is 60 seconds
- OpenRouter API should respond much faster

## 📚 Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Edge Functions Examples](https://github.com/supabase/supabase/tree/master/examples/edge-functions)
- [Deno Runtime](https://deno.land/manual)

---

**Need Help?** Check Supabase Dashboard → Edge Functions → Logs for detailed error messages.

