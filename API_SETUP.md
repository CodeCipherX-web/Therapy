# OpenRouter API Setup Guide

## Getting Your OpenRouter API Key

1. **Visit OpenRouter**: Go to https://openrouter.ai/keys
2. **Sign up or Log in**: Create an account or sign in
3. **Create API Key**: Click "Create Key" to generate a new API key
4. **Copy the Key**: Your key will start with `sk-or-` (this is the correct format)

## Adding the API Key

1. Open `config.js` in your project
2. Find the line: `const OPENROUTER_API_KEY = '';`
3. Replace the empty string with your API key:
   ```javascript
   const OPENROUTER_API_KEY = 'sk-or-v1-your-actual-key-here';
   ```

## Important Notes

- **API Key Format**: OpenRouter keys start with `sk-or-`
- **Google API Keys**: Keys starting with `AIza...` are Google API keys, not OpenRouter keys
- **Security**: Never commit your API key to public repositories
- **Free Tier**: OpenRouter offers free credits to get started

## Testing the API

1. Open your browser console (F12)
2. Send a message in the chat
3. Look for:
   - ✅ "OpenRouter API response received" = Success!
   - ❌ "401 Authentication failed" = Invalid API key
   - ❌ Other errors = Check the error message

## Alternative: Using Fallback Responses

If you don't want to use OpenRouter, the chatbot will automatically use enhanced pattern-matching responses. These work without any API key but are less sophisticated than AI responses.

## Troubleshooting

### 401 Unauthorized Error
- **Cause**: Invalid or missing API key
- **Solution**: Get a valid OpenRouter API key from https://openrouter.ai/keys

### CORS Errors
- **Cause**: Browser blocking the request
- **Solution**: OpenRouter supports CORS, but make sure you're accessing from a valid domain

### Rate Limit Errors
- **Cause**: Too many requests
- **Solution**: Check your OpenRouter account limits or upgrade your plan

