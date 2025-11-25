# TranquilMind — Mental Health Awareness & Support

A multi-page web application for mental health tracking, featuring mood logging, chat support, and resources.

## File Structure

```
newbee/
├── index.html          # Home/Landing page
├── mood.html           # Mood tracking page
├── chat.html           # Chat assistant page
├── resources.html      # Resources and FAQ page
├── styles.css          # Shared CSS styles
├── config.js           # Supabase configuration
├── auth.js             # Authentication functions
├── mood.js             # Mood tracking functions
└── chat.js             # Chat functionality
```

## Pages

### 1. **index.html** — Home Page

- Hero section with overview
- Feature cards (Self-assessments, Resources, Privacy-first)
- Quick tips sidebar
- Navigation to other pages

### 2. **mood.html** — Mood Tracker

- Mood logging form (0-10 scale)
- Optional notes
- Recent entries history
- Real-time mood value display

### 3. **chat.html** — Chat Assistant

- Interactive chat interface
- Supportive bot responses
- Message history (when signed in)
- Enter key support for sending messages

### 4. **resources.html** — Resources & FAQ

- Emergency contacts
- Self-care tips
- Professional help resources
- Expandable FAQ section

## Setup Instructions

1. **Configure Supabase:**

   - Open `config.js`
   - Replace `YOUR_SUPABASE_URL` with your Supabase project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your Supabase anon key

2. **Set up Database:**
   Run this SQL in your Supabase SQL editor:

   ```sql
   CREATE TABLE public.mood_entries (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references auth.users(id) on delete cascade,
     mood_value int not null,
     note text,
     created_at timestamptz default now()
   );

   CREATE TABLE public.chat_messages (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references auth.users(id),
     message text not null,
     is_bot boolean default false,
     created_at timestamptz default now()
   );

   -- Enable Row Level Security
   ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can manage their mood entries" ON public.mood_entries
     FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can manage their chat messages" ON public.chat_messages
     FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
   ```

3. **Open the Application:**

   **Important:** Use port 4000 to avoid conflicts with other applications.

   **Quick Start Options:**

   ```bash
   # Option 1: npm serve (Recommended)
   npm start

   # Option 2: live-server (auto-refresh)
   npm run dev
   ```

   Then open: **http://localhost:4000**

   **Windows Users:** Double-click `start-server.bat` for easy startup.

   See `SERVER_INSTRUCTIONS.md` for detailed instructions and troubleshooting.

## Features

- ✅ Multi-page navigation
- ✅ User authentication (sign in/sign up)
- ✅ Mood tracking with history
- ✅ Chat assistant
- ✅ Responsive design
- ✅ Privacy-first (RLS enabled)
- ✅ Shared components (header, footer, auth modal)

## Navigation

All pages include a consistent header with navigation links:

- **Home** → `index.html`
- **Mood Tracker** → `mood.html`
- **Chat** → `chat.html`
- **Resources** → `resources.html`

## GitHub Pages Deployment

To deploy to GitHub Pages with environment variables:

1. **Set up GitHub Secrets:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `SUPABASE_URL`: Your Supabase project URL (optional, has default)
     - `SUPABASE_ANON_KEY`: Your Supabase anonymous key (optional, has default)
     - `SITE_URL`: Your site URL (optional, defaults to `https://tranquilmind.app`)

2. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Set Source to "GitHub Actions" (not "Deploy from a branch")
   - The workflow will automatically deploy on push to `main`

3. **The workflow will:**
   - Generate `config.env.js` from your secrets during deployment
   - Deploy the site to GitHub Pages
   - The generated file is included in the deployment but never committed to the repo

**Note:** The `config.env.js` file is generated automatically during deployment and is not stored in the repository for security.

## Notes

- The chat assistant uses enhanced pattern matching to provide supportive responses.
- All user data is protected by Row Level Security (RLS) policies.
- The application works offline for viewing, but requires internet connection for Supabase functionality.
- Environment variables are loaded from `config.env.js` (generated from `.env` locally or from GitHub Secrets in production).
