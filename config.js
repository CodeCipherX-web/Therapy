// ========== CONFIG: fill these from your Supabase project (do NOT commit keys publicly) ===========
// Supabase credentials
const SUPABASE_URL = 'https://rgdvmeljlxedhxnkmmgh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZHZtZWxqbHhlZGh4bmttbWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzc0NzUsImV4cCI6MjA3Njk1MzQ3NX0.jUuZSVTXa9NeNAjVvI27SEx_D790I3NLiz1C5AC02mQ';

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

