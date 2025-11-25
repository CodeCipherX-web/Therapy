// ========== UTILS.JS - Merged Utility Functions ==========
// Combines: config.js, dark-mode.js, and consent-modal.js

// ==========================================
// SECTION 1: CONFIGURATION
// ==========================================

// Environment variables are loaded from config.env.js (generated from .env file)
// Run: node load-env.js to generate config.env.js from .env
// If config.env.js doesn't exist, fallback to these default values

let envConfig = {};

if (typeof window !== 'undefined' && window.ENV_CONFIG) {
  // Load from generated config.env.js
  envConfig = window.ENV_CONFIG;
}

// ========== CONFIG: Supabase credentials ==========
const SUPABASE_URL = envConfig.SUPABASE_URL || 'https://rgdvmeljlxedhxnkmmgh.supabase.co';
const SUPABASE_ANON_KEY = envConfig.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZHZtZWxqbHhlZGh4bmttbWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzc0NzUsImV4cCI6MjA3Njk1MzQ3NX0.jUuZSVTXa9NeNAjVvI27SEx_D790I3NLiz1C5AC02mQ';

// ========== CHAT Configuration ==========
const SITE_URL = envConfig.SITE_URL || 'https://tranquilmind.app';

// ==========================================
// SECTION 2: SUPABASE CLIENT INITIALIZATION
// ==========================================

let supabase;
let initAttempts = 0;
const MAX_ATTEMPTS = 50; // Maximum retry attempts (5 seconds total)

function initSupabaseClient() {
  initAttempts++;
  
  // The Supabase UMD build exposes it as window.supabase with createClient method
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
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSupabaseClient);
      } else {
        setTimeout(initSupabaseClient, 100);
      }
    } else {
      setTimeout(initSupabaseClient, 100);
    }
  } else {
    console.error('❌ Failed to initialize Supabase after', MAX_ATTEMPTS, 'attempts');
    console.error('Make sure the Supabase CDN script loads before utils.js');
  }
}

// Start Supabase initialization
if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupabaseClient);
} else {
  initSupabaseClient();
}

// ==========================================
// SECTION 3: DARK MODE FUNCTIONALITY
// ==========================================

(function() {
  'use strict';
  
  function initDarkMode() {
    const html = document.documentElement;
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = document.getElementById('darkModeIcon');
    
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      html.setAttribute('data-theme', 'dark');
      if (darkModeIcon) {
        darkModeIcon.className = 'fas fa-sun';
      }
    }
    
    // Set up toggle button
    if (darkModeToggle && darkModeIcon) {
      darkModeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        if (currentTheme === 'dark') {
          html.setAttribute('data-theme', 'light');
          darkModeIcon.className = 'fas fa-moon';
          localStorage.setItem('theme', 'light');
        } else {
          html.setAttribute('data-theme', 'dark');
          darkModeIcon.className = 'fas fa-sun';
          localStorage.setItem('theme', 'dark');
        }
      });
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
  } else {
    initDarkMode();
  }
})();

// ==========================================
// SECTION 4: CONSENT MODAL FUNCTIONALITY
// ==========================================

function showConsentModal() {
  // Check if user has already consented
  const hasConsented = localStorage.getItem('tranquilmind_consent');
  
  if (hasConsented === 'true') {
    return; // User has already consented, don't show modal
  }

  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'consentModal';
  overlay.className = 'consent-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
    animation: fadeIn 0.3s ease;
  `;

  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'consent-modal';
  modal.style.cssText = `
    background: var(--card);
    border-radius: var(--radius);
    padding: clamp(24px, 5vw, 40px);
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-xl);
    animation: slideUp 0.3s ease;
    border: 2px solid var(--border);
  `;

  modal.innerHTML = `
    <div style="text-align: center; margin-bottom: 24px">
      <div style="font-size: 48px; margin-bottom: 16px">
        <i class="fas fa-shield-alt" style="background: var(--accent-1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"></i>
      </div>
      <h2 style="margin: 0 0 8px 0; font-size: clamp(24px, 4vw, 28px); color: var(--text)">
        Privacy & Consent Notice
      </h2>
      <p class="small" style="color: var(--muted); margin: 0">
        Your privacy matters to us
      </p>
    </div>

    <div style="margin-bottom: 24px; line-height: 1.8; color: var(--text)">
      <p style="margin: 0 0 16px 0">
        Welcome to <strong>TranquilMind</strong>! Before you continue, please review our privacy practices and terms of service.
      </p>
      
      <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 8px">
        <p style="margin: 0; line-height: 1.8">
          <strong>🔒 What we collect:</strong> We collect your email for account creation, mood entries, journal entries, and chat messages to provide personalized support.
        </p>
      </div>

      <div style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 16px; margin: 16px 0; border-radius: 8px">
        <p style="margin: 0; line-height: 1.8">
          <strong>✅ How we protect it:</strong> All data is encrypted and stored securely using Supabase. We use Row Level Security (RLS) so only you can access your data.
        </p>
      </div>

      <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 16px; margin: 16px 0; border-radius: 8px">
        <p style="margin: 0; line-height: 1.8">
          <strong>⚠️ Important:</strong> TranquilMind is not a substitute for professional medical advice. In emergencies, call 911 or 988.
        </p>
      </div>

      <p style="margin: 16px 0 0 0">
        By clicking "I Accept", you agree to our:
      </p>
      <ul style="margin: 8px 0 0 0; padding-left: 24px; line-height: 1.8">
        <li><a href="legal.html" target="_blank" style="color: var(--accent); text-decoration: none; font-weight: 500">Privacy Policy</a> — How we handle your data</li>
        <li><a href="legal.html" target="_blank" style="color: var(--accent); text-decoration: none; font-weight: 500">Terms of Service</a> — Usage terms and disclaimers</li>
      </ul>
    </div>

    <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 32px">
      <button id="consentAccept" class="btn primary" style="flex: 1; min-width: 140px; display: flex; align-items: center; justify-content: center; gap: 8px">
        <i class="fas fa-check"></i> I Accept
      </button>
      <button id="consentDecline" class="btn ghost" style="flex: 1; min-width: 140px; display: flex; align-items: center; justify-content: center; gap: 8px">
        <i class="fas fa-times"></i> Decline
      </button>
    </div>

    <p class="small" style="text-align: center; margin-top: 24px; color: var(--muted)">
      You can review these policies anytime from the footer links
    </p>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // Add animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // Handle accept button
  const acceptBtn = document.getElementById('consentAccept');
  acceptBtn.addEventListener('click', () => {
    localStorage.setItem('tranquilmind_consent', 'true');
    localStorage.setItem('tranquilmind_consent_date', new Date().toISOString());
    closeConsentModal();
  });

  // Handle decline button
  const declineBtn = document.getElementById('consentDecline');
  declineBtn.addEventListener('click', () => {
    alert('To use TranquilMind, you must accept our Privacy Policy and Terms of Service. Please refresh the page to review them again.');
  });

  // Close on overlay click (but not on modal click)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      // Don't allow closing by clicking outside - user must make a choice
    }
  });
}

function closeConsentModal() {
  const modal = document.getElementById('consentModal');
  if (modal) {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  }
}

// Initialize consent modal when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(showConsentModal, 500); // Small delay for better UX
  });
} else {
  setTimeout(showConsentModal, 500);
}


