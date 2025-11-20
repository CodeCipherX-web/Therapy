# Backend Files Analysis & Supabase Migration Plan

## 📊 Current Backend Situation

### **Backend Files Identified:**

1. **`backend-chat.js`** ⚠️ **ONLY BACKEND FILE**
   - **Type:** Node.js HTTP server
   - **Purpose:** Proxy server for OpenRouter API calls
   - **Port:** 3001 (default)
   - **Functionality:**
     - Receives POST requests from frontend (`chat.js`)
     - Forwards requests to OpenRouter API
     - Protects API key from being exposed in frontend
     - Returns AI-generated responses
   - **Dependencies:** `dotenv`, `http`, `https` (Node.js built-ins)

### **Current Architecture:**

```
Frontend (chat.js)
    ↓
    fetch('http://localhost:3001/backend-chat')
    ↓
Node.js Server (backend-chat.js)
    ↓
    https.request('openrouter.ai/api/v1/chat/completions')
    ↓
OpenRouter API
    ↓
    AI Response
    ↓
Back to Frontend
```

### **Files That Reference Backend:**

1. **`chat.js`** (Line 63)
   - Calls: `fetch('${BACKEND_URL}/backend-chat')`
   - Uses: `BACKEND_CHAT_URL` from `config.js`

2. **`config.js`** (Line 22)
   - Defines: `BACKEND_CHAT_URL = 'http://localhost:3001'`

3. **`package.json`** (Line 10)
   - Script: `"backend": "node backend-chat.js"`

4. **`.env`** (if exists)
   - Contains: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `BACKEND_PORT`

---

## 🎯 Migration to Supabase Edge Functions

### **What is a Supabase Edge Function?**

- Serverless functions that run on Supabase's infrastructure
- Similar to AWS Lambda or Vercel Functions
- Written in TypeScript/Deno
- Automatically handles CORS, authentication, and deployment
- **No need to run a separate Node.js server!**

### **Benefits of Migration:**

✅ **No separate server to run** - Everything in Supabase  
✅ **Automatic scaling** - Handles traffic spikes  
✅ **Built-in security** - API keys stored as Supabase secrets  
✅ **Free tier available** - 500K invocations/month  
✅ **Simpler deployment** - One platform for everything  
✅ **Better integration** - Works seamlessly with Supabase auth  

### **New Architecture:**

```
Frontend (chat.js)
    ↓
    fetch('https://YOUR_PROJECT.supabase.co/functions/v1/chat')
    ↓
Supabase Edge Function (chat.ts)
    ↓
    fetch('openrouter.ai/api/v1/chat/completions')
    ↓
OpenRouter API
    ↓
    AI Response
    ↓
Back to Frontend
```

---

## 📝 Migration Steps

### **Step 1: Create Supabase Edge Function**

1. Install Supabase CLI (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase in your project:
   ```bash
   supabase init
   ```

3. Create the Edge Function:
   ```bash
   supabase functions new chat
   ```

4. Deploy the function:
   ```bash
   supabase functions deploy chat
   ```

### **Step 2: Set Environment Secrets**

Store your OpenRouter API key in Supabase:

```bash
supabase secrets set OPENROUTER_API_KEY=your-key-here
supabase secrets set OPENROUTER_MODEL=tngtech/deepseek-r1t2-chimera:free
supabase secrets set SITE_URL=https://tranquilmind.app
```

### **Step 3: Update Frontend**

Update `config.js` to use Supabase Edge Function URL instead of localhost.

### **Step 4: Remove Node.js Backend**

Once migration is complete, you can:
- Delete `backend-chat.js`
- Remove `dotenv` dependency from `package.json`
- Remove `backend` script from `package.json`
- Update documentation

---

## 🔄 What Happens to Existing Files?

### **Files to Keep:**
- ✅ All frontend files (HTML, JS, CSS)
- ✅ `config.js` (will be updated)
- ✅ `load-env.js` (still needed for other env vars)

### **Files to Remove:**
- ❌ `backend-chat.js` (replaced by Edge Function)
- ❌ `.env` (API key moved to Supabase secrets)

### **Files to Update:**
- 🔄 `config.js` (change `BACKEND_CHAT_URL`)
- 🔄 `chat.js` (update fetch URL)
- 🔄 `package.json` (remove backend script, dotenv dependency)
- 🔄 `README.md` (update instructions)

---

## ⚠️ Important Notes

1. **Supabase Edge Functions require:**
   - Supabase CLI installed
   - Supabase project created
   - Function deployed to Supabase

2. **Local Development:**
   - You can test Edge Functions locally with `supabase functions serve`
   - Or use Supabase's hosted functions directly

3. **Cost:**
   - Free tier: 500K invocations/month
   - Paid: $2 per 1M invocations after free tier

4. **Migration Timeline:**
   - Can be done gradually (test Edge Function while keeping Node.js server)
   - Once Edge Function is working, remove Node.js server

---

## 📚 Next Steps

1. ✅ Review this analysis
2. ✅ Create Supabase Edge Function (see `supabase/functions/chat/index.ts`)
3. ✅ Update frontend to use Edge Function
4. ✅ Test thoroughly
5. ✅ Remove Node.js backend files

---

**Questions?** Check Supabase Edge Functions docs: https://supabase.com/docs/guides/functions

