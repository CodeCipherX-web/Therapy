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
// NOTE: OpenRouter API key is handled by Node.js backend (backend-chat.js)
// The API key is NOT exposed to the frontend for security
// Backend URL - Use Node.js backend server (default: localhost:3001)
// Make sure to run: npm run backend (or: node backend-chat.js)
const BACKEND_CHAT_URL = envConfig.BACKEND_CHAT_URL || 'http://localhost:3001';
const OPENROUTER_MODEL = envConfig.OPENROUTER_MODEL || 'tngtech/deepseek-r1t2-chimera:free';
const SITE_URL = envConfig.SITE_URL || 'https://tranquilmind.app';

// Debug: Log configuration status
if (typeof window !== 'undefined') {
  console.log('🔑 API Configuration loaded:', {
    backendUrl: BACKEND_CHAT_URL,
    model: OPENROUTER_MODEL,
    siteUrl: SITE_URL,
    envConfigExists: !!window.ENV_CONFIG
  });
  
  console.log('ℹ️ OpenRouter API key is handled by Node.js backend (backend-chat.js)');
  console.log('ℹ️ Backend URL:', BACKEND_CHAT_URL);
  console.log('💡 Make sure backend server is running: npm run backend');
  console.log('💡 Or: node backend-chat.js');
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

