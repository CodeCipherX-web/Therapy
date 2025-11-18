# API Key Configuration Guide

## Overview

TranquilMind supports AI-powered chat responses using OpenAI's API. The chat will work with or without an API key configured:
- **With API Key**: Uses OpenAI for intelligent, personalized responses
- **Without API Key**: Falls back to supportive canned responses

## Setting Up OpenAI API

### Step 1: Get Your API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in to your account (or create one)
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (it will start with `sk-`)

### Step 2: Configure in TranquilMind

1. Open `config.js` in the project root
2. Find this line:
   ```javascript
   const OPENAI_API_KEY = 'sk-'; // Replace with your actual OpenAI API key
   ```
3. Replace `'sk-'` with your actual API key:
   ```javascript
   const OPENAI_API_KEY = 'sk-YOUR-ACTUAL-KEY-HERE';
   ```

### Step 3: Verify Configuration

1. Save the file
2. Refresh the TranquilMind application in your browser
3. Check the browser console (F12 → Console tab) for messages about API configuration
4. Send a test message in the chat
   - If API is working: You'll see AI-generated responses
   - If API is not working: You'll see the fallback supportive messages

## API Configuration Options

In `config.js`, you can also customize:

### Model Selection
```javascript
const OPENAI_MODEL = 'gpt-4o-mini'; // Options: 'gpt-4', 'gpt-3.5-turbo', 'gpt-4o-mini', etc.
```

### System Prompt (Personality)
```javascript
const CHAT_SYSTEM_PROMPT = `You are a compassionate and empathetic mental health support assistant...`;
```

Modify this to change how the AI behaves.

## Pricing Information

- **gpt-4o-mini**: Most affordable, good for chat (~$0.15 per 1M input tokens)
- **gpt-3.5-turbo**: Cheaper alternative (~$0.50 per 1M input tokens)
- **gpt-4**: Most capable but more expensive (~$5 per 1M input tokens)

Check [OpenAI Pricing](https://openai.com/api/pricing/) for current rates.

## Security Best Practices

⚠️ **IMPORTANT**: Never commit your API key to public repositories!

### To Protect Your Key:

1. **Use Environment Variables** (Recommended for production):
   - Never hardcode keys in JavaScript that will be public
   - Use backend server to call OpenAI API instead

2. **Set API Key Limits**:
   - In OpenAI Platform, set usage limits to prevent unexpected charges
   - Set rate limits per minute

3. **.gitignore Configuration**:
   Add to `.gitignore`:
   ```
   config.js
   .env
   .env.local
   ```

4. **Monitor Usage**:
   - Check your OpenAI account dashboard regularly
   - Set up billing alerts

## Fallback Behavior

If the API key is not configured or invalid, the chat will automatically use supportive, pre-written responses based on keywords:

- **"help", "suicide", "die"** → Crisis resources
- **"anxiety", "anxious"** → Coping techniques
- **"sad", "depressed", "down"** → Validation and support
- **"stress", "stressed"** → Breaking down problems
- **Default** → General supportive response

## Troubleshooting

### "401 Unauthorized" Error
- Check that your API key is correct and hasn't been revoked
- Ensure there are no extra spaces before/after the key

### API calls are slow
- This is normal for first-time requests (1-3 seconds)
- Make sure you have good internet connection

### Still getting canned responses
- Open browser console (F12 → Console)
- Check for error messages about the API
- Verify OPENAI_API_KEY is set correctly in config.js

### "Model not found" Error
- Check that the model name in `OPENAI_MODEL` is valid
- Valid options: `gpt-4`, `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo`

## Advanced: Using a Backend Server

For production applications, it's recommended to:

1. Create a backend service (Node.js, Python, etc.)
2. Store the API key securely on the backend
3. Have TranquilMind call your backend instead of OpenAI directly
4. Your backend then calls OpenAI API

This prevents exposing your API key to the browser.

Example architecture:
```
Browser → TranquilMind → Your Backend → OpenAI API
```

## Support

- OpenAI API Docs: https://platform.openai.com/docs
- OpenAI Issues: https://github.com/openai/openai-python/issues
- Community: https://community.openai.com/
