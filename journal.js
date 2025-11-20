// Journal functions with folder support

let currentJournalId = null;
let currentFolder = 'all';

async function saveJournal() {
  if (!supabase) {
    alert('Supabase not initialized. Please refresh the page.');
    return;
  }

  const title = document.getElementById('journalTitle')?.value.trim();
  const content = document.getElementById('journalContent')?.value.trim();
  const folder = document.getElementById('journalFolder')?.value || 'general';

  if (!title || !content) {
    alert('Please enter both title and content.');
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
      alert('Please sign in to save journals.');
      const authModal = document.getElementById('authModal');
      if (authModal) authModal.style.display = 'flex';
      return;
    }

    const userId = session.user.id;
    console.log('Saving journal entry for user:', userId);

    // Normalize folder name
    const normalizedFolder = folder.toLowerCase().trim().replace(/\s+/g, '-') || 'general';

    const journalData = {
      user_id: userId,
      title: title,
      content: content,
      folder: normalizedFolder
    };

    let error;
    let savedData;
    if (currentJournalId) {
      // Update existing journal
      console.log('Updating journal:', currentJournalId);
      const { data, error: updateError } = await supabase
        .from('journals')
        .update(journalData)
        .eq('id', currentJournalId)
        .eq('user_id', userId)
        .select();
      error = updateError;
      savedData = data;
    } else {
      // Create new journal
      console.log('Creating new journal entry');
      const { data, error: insertError } = await supabase
        .from('journals')
        .insert([journalData])
        .select();
      error = insertError;
      savedData = data;
    }

    if (error) {
      console.error('Supabase insert/update error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Provide more helpful error messages
      let errorMsg = 'Failed to save journal. ';
      if (error.code === 'PGRST116' || error.message?.includes('table') || error.message?.includes('not found') || error.message?.includes('schema cache')) {
        errorMsg += 'The journals table does not exist in your Supabase database.\n\n';
        errorMsg += 'SOLUTION: Run the SQL from JOURNAL_DATABASE_SETUP.md in your Supabase SQL Editor to create the table.';
      } else if (error.code === '42501') {
        errorMsg += 'Permission denied. Please check Row Level Security policies in Supabase.';
      } else if (error.message) {
        errorMsg += error.message;
      } else {
        errorMsg += 'Please try again or check the browser console for details.';
      }
      
      alert(errorMsg);
      return;
    }

    if (!savedData || (Array.isArray(savedData) && savedData.length === 0)) {
      console.warn('Save succeeded but no data returned');
      // Continue anyway as the save might have worked
    } else {
      console.log('Journal saved successfully:', Array.isArray(savedData) ? savedData[0] : savedData);
    }
  } catch (error) {
    console.error('Error saving journal:', error);
    console.error('Error stack:', error.stack);
    alert(`An unexpected error occurred: ${error.message || 'Unknown error'}. Please check the console for details.`);
    return;
  }

  // Clear form
  if (document.getElementById('journalTitle')) {
    document.getElementById('journalTitle').value = '';
  }
  if (document.getElementById('journalContent')) {
    document.getElementById('journalContent').value = '';
  }
  if (document.getElementById('journalFolder')) {
    document.getElementById('journalFolder').value = 'general';
  }
  
  currentJournalId = null;
  updateSaveButton();

  alert('Journal saved successfully!');
  loadJournals();
  loadFolders();
}

async function loadJournals(folderFilter = 'all') {
  const journalsList = document.getElementById('journalsList');
  if (!journalsList) return;

  if (!supabase) {
    journalsList.innerHTML = '<p class="small" style="color:var(--muted)">Supabase not initialized. Please refresh the page.</p>';
    return;
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      journalsList.innerHTML = '<p class="small" style="color:var(--muted)">Error loading journals.</p>';
      return;
    }
    
    if (!session) {
      journalsList.innerHTML = '<p class="small">Sign in to see your journals.</p>';
      return;
    }

    const userId = session.user.id;
    let query = supabase
      .from('journals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (folderFilter !== 'all') {
      query = query.eq('folder', folderFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      journalsList.innerHTML = '<p class="small" style="color:var(--muted)">Failed to load journals.</p>';
      return;
    }

    if (!data || data.length === 0) {
      journalsList.innerHTML = '<p class="small" style="color:var(--muted)">No journals yet. Start writing!</p>';
      return;
    }

    journalsList.innerHTML = data.map(journal => {
      const date = new Date(journal.created_at);
      const updatedDate = journal.updated_at ? new Date(journal.updated_at) : null;
      const journalId = escapeHtml(journal.id);
      const journalTitle = escapeHtml(journal.title);
      const journalFolder = escapeHtml(journal.folder);
      const journalContent = escapeHtml(journal.content);
      
      return `
        <div class="journal-item" data-id="${journalId}">
          <div class="journal-item-header">
            <div>
              <h4 style="margin:0 0 4px 0;font-size:clamp(16px,3vw,18px);color:var(--text)">
                ${journalTitle}
              </h4>
              <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                <span class="small" style="display:flex;align-items:center;gap:4px">
                  <i class="fas fa-folder" style="color:rgba(139,92,246,0.7);font-size:12px"></i>
                  ${journalFolder}
                </span>
                <span class="small" style="color:var(--muted)">
                  ${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                ${updatedDate && updatedDate.getTime() !== date.getTime() ? 
                  `<span class="small" style="color:var(--muted)">(Updated: ${updatedDate.toLocaleDateString()})</span>` : ''}
              </div>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn-icon" data-action="edit" data-id="${journalId}" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon" data-action="delete" data-id="${journalId}" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="journal-item-content">
            <p style="margin:0;color:var(--muted);line-height:1.6">
              ${journalContent.substring(0, 150)}${journal.content.length > 150 ? '...' : ''}
            </p>
          </div>
        </div>
      `;
    }).join('');

    // Add event listeners for edit/delete buttons (prevents XSS from onclick)
    journalsList.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => {
        editJournal(btn.getAttribute('data-id'));
      });
    });

    journalsList.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => {
        deleteJournal(btn.getAttribute('data-id'));
      });
    });
  } catch (error) {
    console.error('Error loading journals:', error);
    journalsList.innerHTML = '<p class="small" style="color:var(--muted)">An unexpected error occurred.</p>';
  }
}

async function loadFolders() {
  if (!supabase) {
    console.error('Supabase not initialized');
    return;
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return;
    }
    
    if (!session) return;

    const userId = session.user.id;
    const { data, error } = await supabase
      .from('journals')
      .select('folder')
      .eq('user_id', userId);

    if (error) {
      console.error(error);
      return;
    }

    // Get unique folders
    const folders = [...new Set(data.map(j => j.folder))].sort();
    
    // Update folder filter buttons
    const foldersContainer = document.getElementById('foldersList');
    if (foldersContainer) {
      foldersContainer.innerHTML = `
        <button class="folder-btn ${currentFolder === 'all' ? 'active' : ''}" data-folder="all">
          <i class="fas fa-list"></i> All Journals
        </button>
        ${folders.map(folder => `
          <button class="folder-btn ${currentFolder === folder ? 'active' : ''}" data-folder="${escapeHtml(folder)}">
            <i class="fas fa-folder"></i> ${escapeHtml(folder)}
          </button>
        `).join('')}
      `;

      // Add event listeners (prevents XSS from onclick)
      foldersContainer.querySelectorAll('.folder-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          filterByFolder(btn.getAttribute('data-folder'));
        });
      });
    }

    // Update folder select dropdown
    const folderSelect = document.getElementById('journalFolder');
    if (folderSelect) {
      const currentValue = folderSelect.value;
      folderSelect.innerHTML = `
        <option value="general">General</option>
        <option value="thoughts">Thoughts</option>
        <option value="gratitude">Gratitude</option>
        <option value="dreams">Dreams</option>
        <option value="goals">Goals</option>
        <option value="reflections">Reflections</option>
        <option value="custom">Custom...</option>
      `;
      
      // Add existing folders
      folders.forEach(folder => {
        if (!['general', 'thoughts', 'gratitude', 'dreams', 'goals', 'reflections'].includes(folder)) {
          const option = document.createElement('option');
          option.value = folder;
          option.textContent = folder;
          folderSelect.appendChild(option);
        }
      });
      
      if (currentValue) {
        folderSelect.value = currentValue;
      }
    }
  } catch (error) {
    console.error('Error loading folders:', error);
  }
}

async function editJournal(journalId) {
  if (!supabase) {
    alert('Supabase not initialized. Please refresh the page.');
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
      alert('Please sign in to edit journals.');
      return;
    }

    const userId = session.user.id;
    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .eq('id', journalId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      alert('Failed to load journal.');
      return;
    }

    currentJournalId = journalId;
    
    if (document.getElementById('journalTitle')) {
      document.getElementById('journalTitle').value = data.title;
    }
    if (document.getElementById('journalContent')) {
      document.getElementById('journalContent').value = data.content;
    }
    if (document.getElementById('journalFolder')) {
      document.getElementById('journalFolder').value = data.folder;
    }

    updateSaveButton();
    
    // Scroll to editor
    const editor = document.querySelector('.journal-editor');
    if (editor) {
      editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (error) {
    console.error('Error editing journal:', error);
    alert('An unexpected error occurred. Please try again.');
  }
}

async function deleteJournal(journalId) {
  if (!confirm('Are you sure you want to delete this journal?')) {
    return;
  }

  if (!supabase) {
    alert('Supabase not initialized. Please refresh the page.');
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
      alert('Please sign in to delete journals.');
      return;
    }

    const userId = session.user.id;
    const { error } = await supabase
      .from('journals')
      .delete()
      .eq('id', journalId)
      .eq('user_id', userId);

    if (error) {
      console.error(error);
      alert('Failed to delete journal.');
      return;
    }
  } catch (error) {
    console.error('Error deleting journal:', error);
    alert('An unexpected error occurred. Please try again.');
    return;
  }

  alert('Journal deleted successfully.');
  loadJournals(currentFolder);
  loadFolders();
  
  // Clear form if editing deleted journal
  if (currentJournalId === journalId) {
    currentJournalId = null;
    if (document.getElementById('journalTitle')) {
      document.getElementById('journalTitle').value = '';
    }
    if (document.getElementById('journalContent')) {
      document.getElementById('journalContent').value = '';
    }
    updateSaveButton();
  }
}

function filterByFolder(folder) {
  currentFolder = folder;
  loadJournals(folder);
  loadFolders();
}

function updateSaveButton() {
  const saveBtn = document.getElementById('saveJournal');
  if (saveBtn) {
    saveBtn.innerHTML = currentJournalId 
      ? '<i class="fas fa-save"></i> Update Journal'
      : '<i class="fas fa-save"></i> Save Journal';
  }
}

function getFolderIcon(folder) {
  const icons = {
    'general': 'fa-folder',
    'thoughts': 'fa-brain',
    'gratitude': 'fa-heart',
    'dreams': 'fa-moon',
    'goals': 'fa-bullseye',
    'reflections': 'fa-mirror'
  };
  return icons[folder] || 'fa-folder';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Handle custom folder input
function handleFolderSelect() {
  const folderSelect = document.getElementById('journalFolder');
  if (!folderSelect) return;
  
  folderSelect.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
      const folderName = prompt('Enter folder name:');
      if (folderName && folderName.trim()) {
        const customFolder = folderName.trim().toLowerCase().replace(/\s+/g, '-');
        // Add custom option
        const option = document.createElement('option');
        option.value = customFolder;
        option.textContent = folderName.trim();
        option.selected = true;
        folderSelect.insertBefore(option, folderSelect.lastElementChild);
        folderSelect.value = customFolder;
      } else {
        folderSelect.value = 'general';
      }
    }
  });
}

function initJournal() {
  const saveBtn = document.getElementById('saveJournal');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveJournal);
  }

  handleFolderSelect();
  
  // Load journals and folders on page load
  loadJournals();
  loadFolders();
  
  // Check for auth state changes (only if supabase is initialized)
  if (supabase) {
    supabase.auth.onAuthStateChange(() => {
      loadJournals(currentFolder);
      loadFolders();
    });
  } else {
    console.warn('⚠️ Supabase not initialized. Auth state changes will not be tracked.');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initJournal);
} else {
  initJournal();
}

