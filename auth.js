// Auth modal handling
let signingUp = false;

function showError(message) {
  const errorDiv = document.getElementById('authError');
  const successDiv = document.getElementById('authSuccess');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
  if (successDiv) successDiv.style.display = 'none';
}

function showSuccess(message) {
  const errorDiv = document.getElementById('authError');
  const successDiv = document.getElementById('authSuccess');
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
  }
  if (errorDiv) errorDiv.style.display = 'none';
}

function hideMessages() {
  const errorDiv = document.getElementById('authError');
  const successDiv = document.getElementById('authSuccess');
  if (errorDiv) errorDiv.style.display = 'none';
  if (successDiv) successDiv.style.display = 'none';
}

function updateAuthUI() {
  const authTitle = document.getElementById('authTitle');
  const authAction = document.getElementById('authAction');
  const authSwitch = document.getElementById('authSwitch');
  const sidebarTitle = document.getElementById('sidebarTitle');
  const sidebarText = document.getElementById('sidebarText');
  
  if (signingUp) {
    if (authTitle) authTitle.textContent = 'Create Account';
    if (authAction) {
      authAction.innerHTML = '<i class="fas fa-user-plus"></i> Create account';
    }
    if (authSwitch) authSwitch.innerHTML = 'Already have an account? <strong>Sign in</strong>';
    if (sidebarTitle) sidebarTitle.textContent = 'Join TranquilMind';
    if (sidebarText) sidebarText.textContent = 'Start your wellness journey today';
  } else {
    if (authTitle) authTitle.textContent = 'Sign in';
    if (authAction) {
      authAction.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign in';
    }
    if (authSwitch) authSwitch.innerHTML = 'Don\'t have an account? <strong>Sign up</strong>';
    if (sidebarTitle) sidebarTitle.textContent = 'Welcome Back';
    if (sidebarText) sidebarText.textContent = 'Sign in to continue your wellness journey';
  }
}

function initAuth() {
  const authModal = document.getElementById('authModal');
  const btnAuth = document.getElementById('btnAuth');
  const authForm = document.getElementById('authForm');
  const authTitle = document.getElementById('authTitle');
  const authAction = document.getElementById('authAction');
  const authSwitch = document.getElementById('authSwitch');
  const closeAuth = document.getElementById('closeAuth');

  if (!authModal || !btnAuth) return;

  btnAuth.addEventListener('click', () => {
    hideMessages();
    authModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });

  if (closeAuth) {
    closeAuth.addEventListener('click', () => {
      authModal.style.display = 'none';
      document.body.style.overflow = '';
      hideMessages();
    });
  }

  // Close modal when clicking outside
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      authModal.style.display = 'none';
      document.body.style.overflow = '';
      hideMessages();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal.style.display === 'flex') {
      authModal.style.display = 'none';
      document.body.style.overflow = '';
      hideMessages();
    }
  });

  if (authSwitch) {
    authSwitch.addEventListener('click', () => {
      signingUp = !signingUp;
      hideMessages();
      updateAuthUI();
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideMessages();
      
      const email = document.getElementById('email')?.value;
      const password = document.getElementById('password')?.value;
      
      if (!email || !password) {
        showError('Please enter both email and password');
        return;
      }

      if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
      }

      // Show loading state
      if (authAction) {
        const originalText = authAction.innerHTML;
        authAction.disabled = true;
        authAction.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        if (!supabase) {
          showError('Supabase not initialized. Please refresh the page.');
          authAction.disabled = false;
          authAction.innerHTML = originalText;
          return;
        }

        try {
          if (signingUp) {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) {
              showError(error.message);
              authAction.disabled = false;
              authAction.innerHTML = originalText;
              return;
            }
            showSuccess('Account created! Please check your email to confirm (if enabled).');
            setTimeout(() => {
              authModal.style.display = 'none';
              document.body.style.overflow = '';
            }, 2000);
          } else {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
              showError(error.message);
              authAction.disabled = false;
              authAction.innerHTML = originalText;
              return;
            }
            showSuccess('Signed in successfully!');
            setTimeout(() => {
              authModal.style.display = 'none';
              document.body.style.overflow = '';
              updateAuthButton();
              window.location.reload();
            }, 1000);
          }
        } catch (err) {
          console.error('Auth error:', err);
          showError('An unexpected error occurred. Please try again.');
          authAction.disabled = false;
          authAction.innerHTML = originalText;
        }
      }
    });
  }

  // Check auth status on load
  checkAuthStatus();
}

async function checkAuthStatus() {
  if (!supabase) {
    console.error('Supabase not initialized');
    return;
  }
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return;
    }
    updateAuthButton(session);
  } catch (error) {
    console.error('Error checking auth status:', error);
  }
}

function updateAuthButton(session) {
  const btnAuth = document.getElementById('btnAuth');
  if (!btnAuth) return;
  
  if (session) {
    btnAuth.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>Sign out</span>';
    btnAuth.onclick = async () => {
      if (!supabase) {
        console.error('Supabase not initialized');
        return;
      }
      try {
        await supabase.auth.signOut();
        window.location.reload();
      } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
      }
    };
  } else {
    btnAuth.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Sign in</span>';
    btnAuth.onclick = () => {
      const authModal = document.getElementById('authModal');
      if (authModal) authModal.style.display = 'flex';
    };
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}

