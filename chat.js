// Chat functions

function appendMessage(who, text) {
  const messages = document.getElementById('messages');
  if (!messages) return;

  const msg = document.createElement('div');
  msg.className = 'msg ' + (who === 'user' ? 'user' : 'bot');
  msg.textContent = text;
  messages.appendChild(msg);
  msg.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function generateSupportiveReply(text) {
  // Very basic canned replies — in future call an Edge Function that uses an AI safely.
  const lower = text.toLowerCase();
  
  if (lower.includes('help') || lower.includes('suicide') || lower.includes('die')) {
    return "I'm really sorry you feel this way. If you are in danger, please contact local emergency services or a crisis line.";
  }
  
  if (lower.includes('anxiety') || lower.includes('anxious')) {
    return 'Anxiety can be really challenging. Have you tried deep breathing exercises or grounding techniques?';
  }
  
  if (lower.includes('sad') || lower.includes('depressed') || lower.includes('down')) {
    return 'I hear you. It\'s okay to feel this way. Remember that feelings are temporary. Is there someone you can talk to?';
  }
  
  if (lower.includes('stress') || lower.includes('stressed')) {
    return 'Stress can be overwhelming. Try breaking things down into smaller steps. What\'s one small thing you can do right now?';
  }
  
  return 'Thanks for sharing — that sounds important. Take a deep breath. What helped you in the past when you felt similar?';
}

async function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  if (!chatInput) return;

  const text = chatInput.value.trim();
  if (!text) return;

  if (!supabase) {
    alert('Supabase not initialized. Please refresh the page.');
    return;
  }

  appendMessage('user', text);
  chatInput.value = '';

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
    }
    
    const userId = session ? session.user.id : null;

    // Store user message
    if (userId) {
      const { error: insertError } = await supabase.from('chat_messages').insert([{ 
        user_id: userId, 
        message: text 
      }]);
      if (insertError) {
        console.error('Error saving user message:', insertError);
      }
    }

    // Generate and show bot reply
    const reply = generateSupportiveReply(text);
    appendMessage('bot', reply);

    // Store bot message
    if (userId) {
      const { error: botInsertError } = await supabase.from('chat_messages').insert([{ 
        user_id: userId, 
        message: reply, 
        is_bot: true 
      }]);
      if (botInsertError) {
        console.error('Error saving bot message:', botInsertError);
      }
    }
  } catch (error) {
    console.error('Error sending chat message:', error);
    // Still show the message even if save fails
    const reply = generateSupportiveReply(text);
    appendMessage('bot', reply);
  }
}

function initChat() {
  const sendChatBtn = document.getElementById('sendChat');
  const chatInput = document.getElementById('chatInput');

  if (sendChatBtn) {
    sendChatBtn.addEventListener('click', sendChatMessage);
  }

  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }

  // Load previous messages if user is signed in
  loadChatHistory();
}

async function loadChatHistory() {
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
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error loading chat history:', error);
      return;
    }

    if (!data) return;

    const messages = document.getElementById('messages');
    if (!messages) return;

    data.forEach(msg => {
      appendMessage(msg.is_bot ? 'bot' : 'user', msg.message);
    });
  } catch (error) {
    console.error('Error loading chat history:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChat);
} else {
  initChat();
}

