// ========== CONFIG: Load from .env file ===========
// Environment variables are loaded from config.env.js (generated from .env file)
// Run: node load-env.js to generate config.env.js from .env
// If config.env.js doesn't exist, fallback to these default values

// Try to load from config.env.js first (generated from .env file)
let envConfig = {};

if (typeof window !== 'undefined' && window.ENV_CONFIG) {
  // Load from generated config.env.js
  envConfig = window.ENV_CONFIG;
}

// ========== CONFIG: Supabase credentials ==========
const SUPABASE_URL = envConfig.SUPABASE_URL || 'https://rgdvmeljlxedhxnkmmgh.supabase.co';
const SUPABASE_ANON_KEY = envConfig.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZHZtZWxqbHhlZGh4bmttbWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzc0NzUsImV4cCI6MjA3Njk1MzQ3NX0.jUuZSVTXa9NeNAjVvI27SEx_D790I3NLiz1C5AC02mQ';

// ========== AI/CHAT API Configuration ==========
// OpenRouter API key for chat functionality
// Get your API key from: https://openrouter.ai/keys
// IMPORTANT: Store your API key in .env file (OPENROUTER_API_KEY)
// NOTE: OpenRouter API keys typically start with "sk-or-"
const OPENROUTER_API_KEY = envConfig.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = envConfig.OPENROUTER_MODEL || 'tngtech/deepseek-r1t2-chimera:free';
const SITE_URL = envConfig.SITE_URL || 'https://tranquilmind.app';

// Debug: Log API key status (first few chars only for security)
if (typeof window !== 'undefined') {
  console.log('🔑 API Configuration loaded:', {
    hasApiKey: !!OPENROUTER_API_KEY,
    apiKeyPrefix: OPENROUTER_API_KEY ? OPENROUTER_API_KEY.substring(0, 10) + '...' : 'NOT SET',
    apiKeyLength: OPENROUTER_API_KEY ? OPENROUTER_API_KEY.length : 0,
    model: OPENROUTER_MODEL,
    loadedFromEnv: !!envConfig.OPENROUTER_API_KEY,
    envConfigExists: !!window.ENV_CONFIG,
    envConfigKey: window.ENV_CONFIG ? (window.ENV_CONFIG.OPENROUTER_API_KEY ? 'EXISTS' : 'MISSING') : 'NO ENV_CONFIG'
  });
  
  // Force check - make sure the key is actually set
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === '') {
    console.error('❌❌❌ CRITICAL: OPENROUTER_API_KEY is empty or not set!');
    console.error('This will cause fallback responses to be used.');
    console.error('Check: .env file has OPENROUTER_API_KEY set');
    console.error('Check: Run "npm run load-env" to regenerate config.env.js');
    console.error('Check: config.env.js is loaded before config.js in HTML');
  } else {
    console.log('✅ OPENROUTER_API_KEY is set and ready to use');
  }
}

const CHAT_SYSTEM_PROMPT = `You are a compassionate and empathetic mental health support assistant. Your role is to:
- Listen actively and validate the user's feelings
- Provide supportive guidance and coping strategies
- Encourage professional help when needed
- Never attempt to provide medical diagnosis or replace professional therapy
- Maintain a warm, non-judgmental tone
- Keep responses concise (2-3 sentences max for chat)
- Focus on immediate support and wellness techniques`;


// Initialize Supabase client
// The UMD build from CDN exposes the library - wait for it to load
let supabase;
let initAttempts = 0;
const MAX_ATTEMPTS = 50; // Maximum retry attempts (5 seconds total)

// Wait for DOM and Supabase library to be ready
function initSupabaseClient() {
  initAttempts++;
  
  // The Supabase UMD build exposes it as window.supabase with createClient method
  // Check if the library is loaded
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ Supabase initialized successfully');
      console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
      return;
    } catch (error) {
      console.error('❌ Error creating Supabase client:', error);
      return;
    }
  }
  
  // Library not loaded yet, retry after a short delay
  if (initAttempts < MAX_ATTEMPTS) {
    // Wait for DOM to be ready first
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSupabaseClient);
      } else {
        // DOM is ready, but Supabase might still be loading
        setTimeout(initSupabaseClient, 100);
      }
    } else {
      setTimeout(initSupabaseClient, 100);
    }
  } else {
    console.error('❌ Failed to initialize Supabase after', MAX_ATTEMPTS, 'attempts');
    console.error('Expected window.supabase.createClient to be available');
    console.error('Current window.supabase:', typeof window !== 'undefined' ? window.supabase : 'window not available');
    console.error('Make sure the Supabase CDN script loads before config.js');
  }
}

// Start initialization when script loads
if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupabaseClient);
} else {
  // DOM already ready or in Node environment, start immediately
  initSupabaseClient();
}

