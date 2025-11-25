# GitHub Pages Deployment Setup

This guide explains how to deploy TranquilMind to GitHub Pages with environment variables.

## Prerequisites

- A GitHub repository
- GitHub Pages enabled

## Step 1: Configure GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

### Optional Secrets (with defaults)

- **`SUPABASE_URL`**: Your Supabase project URL
  - Default: `https://rgdvmeljlxedhxnkmmgh.supabase.co`
  - Only set if using a different Supabase project

- **`SUPABASE_ANON_KEY`**: Your Supabase anonymous key
  - Default: (already set in workflow)
  - Only set if using a different Supabase project

- **`SITE_URL`**: Your site URL
  - Default: `https://tranquilmind.app`
  - Set to your actual GitHub Pages URL

## Step 2: Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
3. Save the settings

## Step 3: Deploy

1. Push your code to the `main` branch
2. The GitHub Actions workflow will automatically:
   - Generate `config.env.js` from your secrets
   - Deploy to GitHub Pages
3. Check the **Actions** tab to see the deployment status

## How It Works

- The `.github/workflows/deploy-pages.yml` workflow runs on every push to `main`
- It generates `config.env.js` from your GitHub Secrets
- The file is included in the deployment but **never committed** to the repository
- Your secrets remain secure and are only used during the build process

## Troubleshooting

### "config.env.js not found" error

- Make sure GitHub Actions workflow ran successfully
- Check the **Actions** tab for any errors

### Deployment not working

- Make sure Pages source is set to **GitHub Actions**
- Check that the workflow file is in `.github/workflows/deploy-pages.yml`
- Verify you have push access to the repository

## Security Notes

- ✅ Secrets are encrypted and only accessible during workflow runs
- ✅ `config.env.js` is generated during deployment, not stored in the repo
- ✅ The file is in `.gitignore` to prevent accidental commits

## Local Development

For local development, use the `.env` file:

1. Create a `.env` file in the project root
2. Add your variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SITE_URL=https://tranquilmind.app
   ```
3. Run `npm run load-env` to generate `config.env.js`
4. Start the server with `npm start`

The `.env` file is ignored by git, so your local secrets stay private.

