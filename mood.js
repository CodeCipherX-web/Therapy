// Mood tracking functions

async function saveMood() {
  if (!supabase) {
    alert('Supabase not initialized. Please refresh the page.');
    return;
  }

  const mood = parseInt(document.getElementById('moodRange')?.value, 10);
  const note = document.getElementById('moodNote')?.value || null;

  if (isNaN(mood) || mood < 1 || mood > 10) {
    alert('Please select a valid mood value.');
    return;
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      alert('Error checking authentication. Please try again.');
      return;
    }
    
    if (!session) {
      alert('Please sign in to save entries.');
      const authModal = document.getElementById('authModal');
      if (authModal) authModal.style.display = 'flex';
      return;
    }

    const userId = session.user.id;

    const { data, error } = await supabase.from('mood_entries').insert([{
      user_id: userId,
      mood_value: mood,
      note: note
    }]);

    if (error) {
      console.error(error);
      alert('Failed to save');
      return;
    }
  } catch (error) {
    console.error('Error saving mood:', error);
    alert('An unexpected error occurred. Please try again.');
    return;
  }

  if (document.getElementById('moodNote')) {
    document.getElementById('moodNote').value = '';
  }
  if (document.getElementById('moodRange')) {
    document.getElementById('moodRange').value = '5';
  }

  alert('Saved');
  loadRecentEntries();
}

async function loadRecentEntries() {
  const entriesList = document.getElementById('entriesList');
  if (!entriesList) return;

  if (!supabase) {
    entriesList.textContent = 'Supabase not initialized. Please refresh the page.';
    return;
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      entriesList.textContent = 'Error loading entries.';
      return;
    }
    
    if (!session) {
      entriesList.textContent = 'Sign in to see your entries.';
      return;
    }

    const userId = session.user.id;
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error(error);
      entriesList.textContent = 'Failed to load entries.';
      return;
    }

    if (!data || data.length === 0) {
      entriesList.textContent = 'No entries yet.';
      return;
    }

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    entriesList.innerHTML = data.map(e => `
      <div style="padding:8px;border-bottom:1px solid rgba(15,23,42,0.03)">
        <strong>Mood: ${e.mood_value}/10</strong>
        <div class="small">${new Date(e.created_at).toLocaleString()}</div>
        ${e.note ? `<div class="small" style="margin-top:4px">${escapeHtml(e.note)}</div>` : ''}
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading entries:', error);
    entriesList.textContent = 'An unexpected error occurred.';
  }
}

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
        entriesList.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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

