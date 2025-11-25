// Auth modal handling
let signingUp = false;

function showError(message) {
  const errorDiv = document.getElementById('authError');
  const successDiv = document.getElementById('authSuccess');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.className = 'auth-message auth-error';
  }
  if (successDiv) successDiv.style.display = 'none';
}

function showSuccess(message) {
  const errorDiv = document.getElementById('authError');
  const successDiv = document.getElementById('authSuccess');
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    successDiv.className = 'auth-message auth-success';
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
  const authSubtitle = document.getElementById('authSubtitle');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');
  const authSwitchText = document.getElementById('authSwitchText');
  const authSwitchAction = document.getElementById('authSwitchAction');
  
  if (signingUp) {
    if (authTitle) authTitle.textContent = 'Create Account';
    if (authSubtitle) authSubtitle.textContent = 'Start your wellness journey today';
    if (btnText) btnText.textContent = 'Create Account';
    if (btnIcon) btnIcon.className = 'fas fa-user-plus';
    if (authSwitchText) authSwitchText.textContent = 'Already have an account?';
    if (authSwitchAction) authSwitchAction.textContent = 'Sign In';
  } else {
    if (authTitle) authTitle.textContent = 'Welcome Back';
    if (authSubtitle) authSubtitle.textContent = 'Sign in to access your account';
    if (btnText) btnText.textContent = 'Sign In';
    if (btnIcon) btnIcon.className = 'fas fa-arrow-right';
    if (authSwitchText) authSwitchText.textContent = 'Don\'t have an account?';
    if (authSwitchAction) authSwitchAction.textContent = 'Sign Up';
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

  // Close modal when clicking backdrop
  const authBackdrop = document.getElementById('authBackdrop');
  if (authBackdrop) {
    authBackdrop.addEventListener('click', () => {
      authModal.style.display = 'none';
      document.body.style.overflow = '';
      hideMessages();
    });
  }

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
      const btnText = document.getElementById('btnText');
      const btnIcon = document.getElementById('btnIcon');
      if (!authAction || !btnText || !btnIcon) return;
      
      const originalText = btnText.textContent;
      const originalIcon = btnIcon.className;
      authAction.disabled = true;
      btnText.textContent = 'Processing...';
      btnIcon.className = 'fas fa-spinner fa-spin';
      
      if (!supabase) {
        showError('Supabase not initialized. Please refresh the page.');
        authAction.disabled = false;
        btnText.textContent = originalText;
        btnIcon.className = originalIcon;
        return;
      }

      try {
        if (signingUp) {
          // Sign up - email confirmation disabled, so user is logged in immediately
          const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                email_verified: true
              }
            }
          });
          
        if (error) {
          showError(error.message);
          authAction.disabled = false;
          btnText.textContent = originalText;
          btnIcon.className = originalIcon;
          return;
        }

            // Check if user was automatically logged in (no email confirmation required)
            if (data.session) {
              showSuccess('Account created! You are now signed in.');
              setTimeout(() => {
                authModal.style.display = 'none';
                document.body.style.overflow = '';
                updateAuthButton(data.session);
                // Reload to refresh the page with logged-in state
                window.location.reload();
              }, 1000);
            } else {
              // This should not happen if email confirmation is disabled
              // But handle it just in case
              showSuccess('Account created! Please check your email to confirm your account.');
              setTimeout(() => {
                authModal.style.display = 'none';
                document.body.style.overflow = '';
              }, 2000);
            }
          } else {
          // Sign in - should work immediately
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            showError(error.message);
            authAction.disabled = false;
            btnText.textContent = originalText;
            btnIcon.className = originalIcon;
            return;
          }
          
          // User is now logged in
          showSuccess('Signed in successfully!');
          setTimeout(() => {
            authModal.style.display = 'none';
            document.body.style.overflow = '';
            updateAuthButton(data.session);
            window.location.reload();
          }, 1000);
        }
      } catch (err) {
        console.error('Auth error:', err);
        showError('An unexpected error occurred. Please try again.');
        authAction.disabled = false;
        btnText.textContent = originalText;
        btnIcon.className = originalIcon;
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

async function updateAuthButton(session = null) {
  const btnAuth = document.getElementById('btnAuth');
  if (!btnAuth) return;
  
  // If session not provided, check current session
  if (!session && supabase) {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      session = currentSession;
    } catch (error) {
      console.error('Error getting session:', error);
    }
  }
  
  if (session) {
    btnAuth.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>Sign out</span>';
    btnAuth.onclick = async () => {
      if (!supabase) {
        console.error('Supabase not initialized');
        return;
      }
      try {
        await supabase.auth.signOut();
        updateUserInfo(null);
        window.location.reload();
      } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
      }
    };
    // Update user info
    updateUserInfo(session);
  } else {
    btnAuth.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Sign in</span>';
    btnAuth.onclick = () => {
      const authModal = document.getElementById('authModal');
      if (authModal) {
        hideMessages();
        authModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    };
    // Hide user info
    updateUserInfo(null);
  }
}

function updateUserInfo(session) {
  const userInfo = document.getElementById('userInfo');
  const userUsername = document.getElementById('userUsername');
  const userEmail = document.getElementById('userEmail');
  const userId = document.getElementById('userId');
  
  if (!userInfo || !userEmail || !userId) return;
  
  if (session && session.user) {
    userInfo.style.display = 'block';
    const email = session.user.email || 'No email';
    const emailParts = email.split('@');
    const username = emailParts[0] || 'user';
    const domain = emailParts[1] || '';
    
    if (userUsername) {
      userUsername.textContent = username;
    }
    userEmail.textContent = domain ? `@${domain}` : email;
    userId.textContent = `ID: ${session.user.id.substring(0, 7)}`;
  } else {
    userInfo.style.display = 'none';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}

