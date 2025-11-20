// Chat functions

function appendMessage(who, text, isTyping = false) {
  const messages = document.getElementById('messages');
  if (!messages) return;

  const msg = document.createElement('div');
  msg.className = 'msg ' + (who === 'user' ? 'user' : 'bot');
  
  // Handle multi-line text (preserve line breaks)
  if (text.includes('\n')) {
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      if (line.trim()) {
        const p = document.createElement('p');
        p.textContent = line;
        p.style.margin = index === 0 ? '0 0 8px 0' : '8px 0';
        msg.appendChild(p);
      }
    });
  } else {
    msg.textContent = text;
  }
  
  if (isTyping) {
    msg.classList.add('typing');
  }
  
  messages.appendChild(msg);
  msg.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function showTypingIndicator() {
  const messages = document.getElementById('messages');
  if (!messages) return;
  
  const typing = document.createElement('div');
  typing.className = 'msg bot typing';
  typing.id = 'typingIndicator';
  typing.innerHTML = '<span></span><span></span><span></span>';
  messages.appendChild(typing);
  typing.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function removeTypingIndicator() {
  const typing = document.getElementById('typingIndicator');
  if (typing) {
    typing.remove();
  }
}

async function generateAIReply(text) {
  // Backend proxy URL - get from config.js
  // BACKEND_CHAT_URL is defined in config.js
  // - Local: http://localhost:3001 (Node.js backend)
  // - Production: Supabase Edge Function URL
  const BACKEND_URL = (typeof BACKEND_CHAT_URL !== 'undefined' && BACKEND_CHAT_URL) 
    ? BACKEND_CHAT_URL 
    : (typeof window !== 'undefined' && 
       (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:3001'
    : 'https://rgdvmeljlxedhxnkmmgh.supabase.co/functions/v1/chat';
  
  try {
    console.log('🤖 Calling backend chat API at:', BACKEND_URL);
    console.log('📤 Sending message:', text.substring(0, 50) + '...');
    const startTime = Date.now();
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${BACKEND_URL}/backend-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: text
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    console.log(`📥 Response received in ${responseTime}ms, status:`, response.status);
    
    if (!response.ok) {
      let errorText = '';
      let errorData = null;
      try {
        errorText = await response.clone().text();
        errorData = JSON.parse(errorText);
        console.error('❌ Backend API error:', response.status, errorData);
        
        // Provide specific guidance based on error
        if (response.status === 404) {
          console.error('💡 Backend endpoint not found. Check if backend server is running.');
        } else if (response.status === 500) {
          console.error('💡 Backend server error. Check backend console for details.');
          console.error('💡 Make sure OPENROUTER_API_KEY is set in .env file');
        } else if (response.status === 401) {
          console.error('💡 Authentication error. Check OPENROUTER_API_KEY in .env file');
        }
      } catch (e) {
        console.error('❌ Backend API error:', response.status, errorText);
      }
      throw new Error(`Backend API error: ${response.status} - ${errorData?.error || errorText}`);
    }

    const data = await response.json();
    
    if (data.reply && data.reply.trim()) {
      console.log('✅✅✅ SUCCESS: Got AI reply from OpenRouter via backend!');
      console.log('✅ Reply length:', data.reply.length, 'characters');
      console.log('✅ Reply preview:', data.reply.substring(0, 100) + '...');
      return data.reply.trim();
    } else if (data.error) {
      console.error('❌ Backend returned error:', data.error);
      throw new Error(data.error);
    } else {
      console.warn('⚠️ Unexpected response format:', data);
      throw new Error('No reply in response');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Request timeout - backend took too long to respond');
      console.error('💡 Check if backend server is running and responsive');
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.error('❌ Network error - cannot reach backend server');
      console.error('💡 Make sure the backend server is running: npm run backend');
      console.error('💡 Or: node backend-chat.js');
      console.error('💡 Backend should be running on:', BACKEND_URL);
    } else {
      console.error('❌ Error calling backend API:', error.message);
    }
    console.error('💡 Backend URL being used:', BACKEND_URL);
    throw error; // Re-throw to be caught by caller
  }
}

function generateSupportiveReply(text) {
  // Enhanced pattern matching for better responses
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  
  // Emergency/crisis situations
  if (lower.includes('suicide') || lower.includes('kill myself') || lower.includes('end my life') || 
      lower.includes('want to die') || lower.includes('hurt myself')) {
    return "I'm really concerned about what you're saying. Your life matters. Please reach out immediately:\n\n• Emergency Services: 911 (or your local emergency number)\n• Crisis Text Line: Text HOME to 741741\n• National Suicide Prevention Lifeline: 988\n\nYou don't have to go through this alone. There are people who want to help.";
  }
  
  // Help requests
  if (lower.includes('help') && (lower.includes('need') || lower.includes('please') || lower.includes('can you'))) {
    return "I'm here to help. What specific support are you looking for? I can help with:\n\n• Coping strategies for difficult emotions\n• Information about mental health resources\n• Techniques for managing stress and anxiety\n• Guidance on finding professional help\n\nWhat would be most helpful for you right now?";
  }
  
  // Anxiety-related
  if (lower.includes('anxiety') || lower.includes('anxious') || lower.includes('worried') || 
      lower.includes('panic') || lower.includes('nervous')) {
    return "Anxiety can feel overwhelming. Here are some techniques that might help:\n\n• **4-7-8 Breathing**: Inhale for 4 counts, hold for 7, exhale for 8. Repeat 4 times.\n• **Grounding (5-4-3-2-1)**: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.\n• **Progressive Muscle Relaxation**: Tense and release each muscle group.\n\nWould you like me to guide you through one of these exercises?";
  }
  
  // Depression/sadness
  if (lower.includes('sad') || lower.includes('depressed') || lower.includes('down') || 
      lower.includes('hopeless') || lower.includes('empty') || lower.includes('worthless')) {
    return "I hear you, and your feelings are valid. Depression can make everything feel heavy. Remember:\n\n• Feelings are temporary, even when they don't feel that way\n• You're not alone in this experience\n• Small steps forward still count\n• Professional help can make a real difference\n\nHave you considered talking to a therapist or counselor? I can help you find resources if you'd like.";
  }
  
  // Stress
  if (lower.includes('stress') || lower.includes('stressed') || lower.includes('overwhelmed') || 
      lower.includes('pressure') || lower.includes('too much')) {
    return "Stress can feel like too much to handle. Let's break it down:\n\n• **Prioritize**: What absolutely must be done today vs. what can wait?\n• **One thing at a time**: Focus on just the next small step\n• **Take breaks**: Even 5 minutes can help reset your mind\n• **Self-care**: Make sure you're eating, sleeping, and moving your body\n\nWhat's one small thing you can do right now to feel a bit better?";
  }
  
  // Sleep issues
  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('tired') || 
      lower.includes('exhausted') || lower.includes('can\'t sleep')) {
    return "Sleep problems can really impact your wellbeing. Here are some tips:\n\n• **Sleep hygiene**: Keep a consistent sleep schedule, even on weekends\n• **Bedroom environment**: Cool, dark, and quiet\n• **Wind down routine**: Avoid screens 1 hour before bed, try reading or gentle stretching\n• **Limit caffeine**: Especially after 2 PM\n• **If you can't sleep**: Get up after 20 minutes, do something calming, then try again\n\nAre you having trouble falling asleep, staying asleep, or both?";
  }
  
  // Questions about resources
  if (lower.includes('resource') || lower.includes('therapy') || lower.includes('therapist') || 
      lower.includes('counselor') || lower.includes('professional help') || lower.includes('where to find')) {
    return "Great question! Here are some ways to find help:\n\n• **Check the Resources page** on this site for articles and links\n• **Helpline page** has crisis numbers and support lines\n• **Your primary care doctor** can provide referrals\n• **Psychology Today** has a therapist finder (psychologytoday.com)\n• **Local mental health centers** often offer sliding scale fees\n• **Online therapy platforms** like BetterHelp or Talkspace\n\nWould you like me to help you find resources in your area?";
  }
  
  // Greetings
  if (lower.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return "Hello! I'm here to listen and support you. How are you feeling today? What's on your mind?";
  }
  
  // Questions (what, how, why, when, where)
  if (lower.match(/^(what|how|why|when|where|can you|tell me|explain)/)) {
    if (lower.includes('cope') || lower.includes('deal with') || lower.includes('handle')) {
      return "Coping strategies depend on what you're dealing with, but here are some universal techniques:\n\n• **Deep breathing** - Slows your nervous system\n• **Mindfulness** - Staying present in the moment\n• **Physical activity** - Even a short walk helps\n• **Talking to someone** - You don't have to handle everything alone\n• **Journaling** - Writing can help process emotions\n\nWhat specific situation are you trying to cope with?";
    }
    return "That's a good question. I'm here to help you find answers. Could you tell me a bit more about what you're looking for? Are you asking about:\n\n• Coping strategies\n• Mental health resources\n• Understanding your feelings\n• Finding professional help\n\nLet me know and I can provide more specific guidance.";
  }
  
  // Thank you responses
  if (lower.includes('thank') || lower.includes('thanks')) {
    return "You're very welcome. I'm glad I could help. Remember, I'm here whenever you need to talk. Is there anything else on your mind?";
  }
  
  // Feeling better/improvement
  if (lower.includes('better') || lower.includes('improve') || lower.includes('feel good') || 
      lower.includes('happy') || lower.includes('good')) {
    return "That's wonderful to hear! It's great that you're feeling better. Remember:\n\n• Progress isn't always linear - ups and downs are normal\n• Celebrate the small wins\n• Keep practicing the strategies that work for you\n• Don't hesitate to reach out if you need support again\n\nWhat helped you feel better? It might be useful to remember for future tough moments.";
  }
  
  // Loneliness/isolation
  if (lower.includes('lonely') || lower.includes('alone') || lower.includes('isolated') || 
      lower.includes('no one') || lower.includes('nobody')) {
    return "Feeling lonely can be really painful. You're reaching out, which is a brave step. Consider:\n\n• **Connecting with others**: Even small interactions can help\n• **Support groups**: Many are available online or in person\n• **Volunteering**: Can help you meet people while doing something meaningful\n• **Professional support**: A therapist can help you work through feelings of isolation\n\nWould you like help finding ways to connect with others?";
  }
  
  // Anger/frustration
  if (lower.includes('angry') || lower.includes('mad') || lower.includes('frustrated') || 
      lower.includes('irritated') || lower.includes('rage')) {
    return "Anger is a valid emotion, and it's okay to feel it. Here are some healthy ways to manage it:\n\n• **Take a break**: Step away from the situation if possible\n• **Physical release**: Exercise, punching a pillow, or going for a run\n• **Express it safely**: Write it down, talk to someone, or use art\n• **Deep breathing**: Helps calm your body's stress response\n• **Identify the trigger**: Understanding what caused it can help you address it\n\nWhat's making you feel this way?";
  }
  
  // General supportive response
  return "Thank you for sharing that with me. I can hear that this is important to you. Let me think about how I can best support you:\n\n• Would it help to talk more about what you're experiencing?\n• Are you looking for specific coping strategies?\n• Do you need help finding resources or professional support?\n• Is there something particular you're struggling with right now?\n\nI'm here to listen. What would be most helpful?";
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

    // Show typing indicator
    showTypingIndicator();
    
    // Simulate thinking time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate bot reply - try AI API first, fall back to enhanced responses
    console.log('🚀 Attempting to get AI reply from OpenRouter via backend...');
    let reply = null;
    try {
      reply = await generateAIReply(text);
      if (reply && reply.trim()) {
        console.log('✅✅✅ SUCCESS: Using AI-generated reply from OpenRouter!');
        console.log('✅ Reply length:', reply.length, 'characters');
      } else {
        throw new Error('Empty reply from API');
      }
    } catch (error) {
      console.warn('⚠️ AI API failed, using fallback response');
      console.warn('⚠️ Error:', error.message);
      console.warn('💡 To use OpenRouter:');
      console.warn('   1. Make sure backend server is running: npm run backend');
      console.warn('   2. Check that OPENROUTER_API_KEY is set in .env file');
      console.warn('   3. Verify backend is accessible at:', typeof BACKEND_CHAT_URL !== 'undefined' ? BACKEND_CHAT_URL : 'http://localhost:3001');
      reply = generateSupportiveReply(text);
    }
    
    removeTypingIndicator();
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
    removeTypingIndicator();
    // Try to get AI reply even if save fails
    console.log('🚀 Attempting to get AI reply from OpenRouter (error recovery)...');
    let reply = null;
    try {
      reply = await generateAIReply(text);
      if (reply && reply.trim()) {
        console.log('✅ Using AI-generated reply from OpenRouter (error recovery)');
      } else {
        throw new Error('Empty reply');
      }
    } catch (apiError) {
      console.warn('⚠️ AI API failed in error recovery, using fallback response');
      reply = generateSupportiveReply(text);
    }
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

