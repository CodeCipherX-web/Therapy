# Deploy Supabase Edge Function - Quick Guide

## Option 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `rgdvmeljlxedhxnkmmgh`

2. **Navigate to Edge Functions:**
   - Click on "Edge Functions" in the left sidebar
   - Click "Create a new function"

3. **Create the function:**
   - Function name: `chat`
   - Copy the code from `supabase/functions/chat/index.ts`
   - Paste it into the editor
   - Click "Deploy"

4. **Set Secrets:**
   - Go to Project Settings → Edge Functions → Secrets
   - Add the following secrets:
     - `SITE_URL` = `https://tranquilmind.app`

5. **Test the function:**
   - The function URL will be: `https://rgdvmeljlxedhxnkmmgh.supabase.co/functions/v1/chat`
   - You can test it using the Supabase dashboard or your deployed site

## Option 2: Using Supabase CLI

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Login

```bash
supabase login
```

### Step 3: Link Project

```bash
supabase link --project-ref rgdvmeljlxedhxnkmmgh
```

### Step 4: Set Secrets

```bash
supabase secrets set SITE_URL=https://tranquilmind.app
```

### Step 5: Deploy

```bash
supabase functions deploy chat
```

## Verify Deployment

After deployment, test the function:

```bash
curl -X POST https://rgdvmeljlxedhxnkmmgh.supabase.co/functions/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{"message": "Hello"}'
```

## Troubleshooting

- **Function not found:** Make sure you deployed to the correct project
- **401 Unauthorized:** Check that your Supabase anon key is correct
- **500 Error:** Check the function logs in Supabase dashboard

