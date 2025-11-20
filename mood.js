// Mood tracking functions

async function saveMood() {
  if (!supabase) {
    alert('Supabase not initialized. Please refresh the page.');
    console.error('Supabase client not available');
    return;
  }

  const mood = parseInt(document.getElementById('moodRange')?.value, 10);
  const note = document.getElementById('moodNote')?.value?.trim() || null;

  // Fix validation: allow 0-10 (the range allows 0, but validation was only allowing 1-10)
  if (isNaN(mood) || mood < 0 || mood > 10) {
    alert('Please select a valid mood value between 0 and 10.');
    return;
  }

  try {
    // Check for active session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      alert(`Error checking authentication: ${sessionError.message}. Please try again.`);
      return;
    }
    
    if (!session || !session.user) {
      alert('Please sign in to save entries.');
      const authModal = document.getElementById('authModal');
      if (authModal) {
        authModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
      return;
    }

    const userId = session.user.id;
    console.log('Saving mood entry for user:', userId);

    // Insert mood entry
    const { data, error } = await supabase
      .from('mood_entries')
      .insert([{
        user_id: userId,
        mood_value: mood,
        note: note || null
      }])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Provide more helpful error messages
      let errorMsg = 'Failed to save mood entry. ';
      if (error.code === 'PGRST116') {
        errorMsg += 'The mood_entries table may not exist. Please check your Supabase setup.';
      } else if (error.code === '42501') {
        errorMsg += 'Permission denied. Please check Row Level Security policies.';
      } else if (error.message) {
        errorMsg += error.message;
      } else {
        errorMsg += 'Please try again or check the browser console for details.';
      }
      
      alert(errorMsg);
      return;
    }

    if (!data || data.length === 0) {
      console.warn('Insert succeeded but no data returned');
      // Continue anyway as the insert might have worked
    } else {
      console.log('Mood entry saved successfully:', data[0]);
    }

    // Clear form
    if (document.getElementById('moodNote')) {
      document.getElementById('moodNote').value = '';
    }
    if (document.getElementById('moodRange')) {
      document.getElementById('moodRange').value = '5';
    }
    if (document.getElementById('moodValue')) {
      document.getElementById('moodValue').textContent = '5';
    }

    // Show success message
    alert('Mood entry saved successfully!');
    
    // Reload entries
    loadRecentEntries();
  } catch (error) {
    console.error('Error saving mood:', error);
    console.error('Error stack:', error.stack);
    alert(`An unexpected error occurred: ${error.message || 'Unknown error'}. Please check the console for details.`);
  }
}

async function loadRecentEntries() {
  const entriesList = document.getElementById('entriesList');
  if (!entriesList) return;

  if (!supabase) {
    entriesList.innerHTML = '<div class="mood-entry-empty">Supabase not initialized. Please refresh the page.</div>';
    return;
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      entriesList.innerHTML = '<div class="mood-entry-empty">Error loading entries.</div>';
      return;
    }
    
    if (!session) {
      entriesList.innerHTML = '<div class="mood-entry-empty">Sign in to see your entries.</div>';
      return;
    }

    const userId = session.user.id;
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading entries:', error);
      entriesList.innerHTML = '<div class="mood-entry-empty">Failed to load entries. Please try again.</div>';
      return;
    }

    if (!data || data.length === 0) {
      entriesList.innerHTML = `
        <div class="mood-entry-empty">
          <i class="fas fa-inbox" style="font-size:48px;opacity:0.3;margin-bottom:12px"></i>
          <p>No entries yet.</p>
          <p class="small" style="margin-top:8px;opacity:0.7">Start tracking your mood to see your history here.</p>
        </div>
      `;
      return;
    }

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    // Format date nicely
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: 'numeric',
        minute: '2-digit'
      });
    };

    // Get mood emoji and color
    const getMoodDisplay = (value) => {
      if (value >= 8) return { emoji: '😊', color: '#10b981', label: 'Great' };
      if (value >= 6) return { emoji: '🙂', color: '#34d399', label: 'Good' };
      if (value >= 4) return { emoji: '😐', color: '#fbbf24', label: 'Okay' };
      if (value >= 2) return { emoji: '😔', color: '#f59e0b', label: 'Low' };
      return { emoji: '😢', color: '#ef4444', label: 'Very Low' };
    };

    entriesList.innerHTML = data.map(e => {
      const moodDisplay = getMoodDisplay(e.mood_value);
      return `
        <div class="mood-entry-card" data-entry-id="${e.id}">
          <div class="mood-entry-header">
            <div class="mood-entry-emoji" style="background: linear-gradient(135deg, ${moodDisplay.color}15, ${moodDisplay.color}25); border-color: ${moodDisplay.color}40;">
              <span style="font-size:32px">${moodDisplay.emoji}</span>
            </div>
            <div class="mood-entry-info">
              <div class="mood-entry-value">
                <span class="mood-number" style="color: ${moodDisplay.color}">${e.mood_value}</span>
                <span class="mood-separator">/</span>
                <span class="mood-max">10</span>
                <span class="mood-label">${moodDisplay.label}</span>
              </div>
              <div class="mood-entry-date">
                <i class="fas fa-clock"></i>
                ${formatDate(e.created_at)}
              </div>
            </div>
            <button class="mood-entry-delete" onclick="deleteMoodEntry('${e.id}')" aria-label="Delete entry">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          ${e.note ? `
            <div class="mood-entry-note">
              <i class="fas fa-sticky-note"></i>
              <span>${escapeHtml(e.note)}</span>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Add animation on load
    setTimeout(() => {
      const cards = entriesList.querySelectorAll('.mood-entry-card');
      cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        setTimeout(() => {
          card.style.transition = 'all 0.3s ease-out';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 50);
      });
    }, 10);

  } catch (error) {
    console.error('Error loading entries:', error);
    entriesList.innerHTML = '<div class="mood-entry-empty">An unexpected error occurred.</div>';
  }
}

async function deleteMoodEntry(entryId) {
  if (!supabase) {
    alert('Supabase not initialized. Please refresh the page.');
    return;
  }

  // Confirm deletion
  if (!confirm('Are you sure you want to delete this mood entry? This action cannot be undone.')) {
    return;
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      alert('Error: Please sign in to delete entries.');
      return;
    }

    const { error } = await supabase
      .from('mood_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', session.user.id); // Extra security check

    if (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
      return;
    }

    // Remove the card with animation
    const card = document.querySelector(`[data-entry-id="${entryId}"]`);
    if (card) {
      card.style.transition = 'all 0.3s ease-out';
      card.style.opacity = '0';
      card.style.transform = 'translateX(-20px)';
      setTimeout(() => {
        loadRecentEntries(); // Reload to refresh the list
      }, 300);
    } else {
      loadRecentEntries(); // Reload if card not found
    }

  } catch (error) {
    console.error('Error deleting mood entry:', error);
    alert('An unexpected error occurred. Please try again.');
  }
}

// Make deleteMoodEntry available globally
window.deleteMoodEntry = deleteMoodEntry;

function initMoodTracking() {
  const saveMoodBtn = document.getElementById('saveMood');
  if (saveMoodBtn) {
    saveMoodBtn.addEventListener('click', saveMood);
  }

  const viewHistoryBtn = document.getElementById('viewHistory');
  if (viewHistoryBtn) {
    viewHistoryBtn.addEventListener('click', () => {
      loadRecentEntries();
      const entriesList = document.getElementById('entriesList');
      if (entriesList) {
        // Scroll to entries section
        setTimeout(() => {
          entriesList.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  }

  const refreshHistoryBtn = document.getElementById('refreshHistory');
  if (refreshHistoryBtn) {
    refreshHistoryBtn.addEventListener('click', () => {
      refreshHistoryBtn.querySelector('i').classList.add('fa-spin');
      loadRecentEntries();
      setTimeout(() => {
        refreshHistoryBtn.querySelector('i').classList.remove('fa-spin');
      }, 500);
    });
  }

  // Load entries on page load
  loadRecentEntries();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMoodTracking);
} else {
  initMoodTracking();
}

