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
  // Debug: Check if API key is available
  const hasApiKey = typeof OPENROUTER_API_KEY !== 'undefined' && OPENROUTER_API_KEY && OPENROUTER_API_KEY !== '';
  
  console.log('🔍 Checking API key...', {
    keyDefined: typeof OPENROUTER_API_KEY !== 'undefined',
    keyValue: OPENROUTER_API_KEY ? OPENROUTER_API_KEY.substring(0, 15) + '...' : 'empty',
    keyLength: OPENROUTER_API_KEY ? OPENROUTER_API_KEY.length : 0,
    hasApiKey: hasApiKey,
    model: OPENROUTER_MODEL
  });
  
  // Try to use OpenRouter API if key is configured
  if (hasApiKey) {
    try {
      console.log('🤖 Calling OpenRouter API...');
      console.log('🔑 API Key (first 10 chars):', OPENROUTER_API_KEY.substring(0, 10) + '...');
      
      console.log('📡 Making fetch request to OpenRouter...');
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'X-Title': 'TranquilMind Chat Assistant',
          'HTTP-Referer': SITE_URL || window.location.origin || 'https://tranquilmind.app'
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL || 'tngtech/deepseek-r1t2-chimera:free',
          messages: [
            {
              role: 'system',
              content: CHAT_SYSTEM_PROMPT || 'You are a compassionate mental health support assistant. You are talking to a client who is feeling sad and lonely. You are trying to help them feel better and find a way to cope with their feelings.speak in a friendly and supportive tone, almost like your a friend.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 200,
          temperature: 0.7,
          stream: false
        })
      });

      console.log('📥 Response received, status:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorData = {};
        let errorText = '';
        try {
          errorText = await response.clone().text();
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { error: errorText, raw: errorText };
          }
        } catch (e) {
          errorData = { error: 'Could not read error response' };
        }
        
        console.error('❌❌❌ OpenRouter API ERROR:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('Error response:', JSON.stringify(errorData, null, 2));
        console.error('This will cause fallback to be used!');
        
        if (response.status === 401) {
          console.error('🔑 Authentication failed. Possible reasons:');
          console.error('   1. API key is invalid or expired');
          console.error('   2. API key has been revoked');
          console.error('   3. API key format is incorrect');
          console.error('   4. API key has no credits/balance');
          console.error('💡 Get a new API key from: https://openrouter.ai/keys');
          console.error('💡 OpenRouter API keys typically start with "sk-or-"');
          console.error('💡 Current key (first 15 chars):', OPENROUTER_API_KEY ? `"${OPENROUTER_API_KEY.substring(0, 15)}..."` : 'key is empty');
          console.error('💡 Current key length:', OPENROUTER_API_KEY ? OPENROUTER_API_KEY.length : 0);
          if (errorData.error) {
            console.error('💡 API Error Message:', typeof errorData.error === 'object' ? JSON.stringify(errorData.error, null, 2) : errorData.error);
          }
        }
        
        return null;
      }

      const data = await response.json();
      console.log('✅ OpenRouter API response received:', data);
      
      if (data.choices && data.choices[0]) {
        const choice = data.choices[0];
        const finishReason = choice.finish_reason;
        console.log('📊 Finish reason:', finishReason);
        
        if (choice.message && choice.message.content) {
          const reply = choice.message.content;
          console.log('💬 AI Reply (raw):', JSON.stringify(reply));
          console.log('💬 AI Reply (type):', typeof reply);
          console.log('💬 AI Reply (length):', reply ? reply.length : 'null/undefined');
          
          // Check if reply is valid and non-empty
          if (reply && typeof reply === 'string' && reply.trim().length > 0) {
            const trimmedReply = reply.trim();
            console.log('✅ Successfully got AI reply from OpenRouter');
            console.log('✅ Reply length:', trimmedReply.length, 'characters');
            return trimmedReply;
          } else {
            console.warn('⚠️ AI Reply is empty or invalid');
            console.warn('⚠️ Reply value:', reply);
            console.warn('⚠️ Finish reason:', finishReason);
            if (finishReason === 'length') {
              console.warn('⚠️ Response was cut off due to max_tokens limit');
            }
            console.warn('⚠️ Full choice object:', JSON.stringify(choice, null, 2));
            return null;
          }
        } else {
          console.warn('⚠️ No message content in response');
          console.warn('⚠️ Choice object:', JSON.stringify(choice, null, 2));
          console.warn('⚠️ Finish reason:', finishReason);
          return null;
        }
      } else {
        console.warn('⚠️ Unexpected response format:', data);
        console.warn('Response structure:', JSON.stringify(data, null, 2));
        return null;
      }
    } catch (error) {
      console.error('❌ Error calling OpenRouter API:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      console.error('This error will cause fallback to be used');
      return null;
    }
  } else {
    console.error('❌ OpenRouter API key not configured!');
    console.error('Key status:', {
      undefined: typeof OPENROUTER_API_KEY === 'undefined',
      empty: OPENROUTER_API_KEY === '',
      falsy: !OPENROUTER_API_KEY,
      value: OPENROUTER_API_KEY ? 'has value' : 'no value'
    });
    console.error('💡 Make sure OPENROUTER_API_KEY is set in .env file and run: npm run load-env');
    console.error('💡 Current OPENROUTER_API_KEY:', OPENROUTER_API_KEY);
  }
  
  return null;
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
    console.log('🚀 Attempting to get AI reply from OpenRouter...');
    let reply = await generateAIReply(text);
    if (!reply || reply.trim() === '') {
      console.warn('⚠️ AI API failed or returned no reply, using fallback response');
      console.warn('⚠️ This means OpenRouter is NOT being used');
      reply = generateSupportiveReply(text);
    } else {
      console.log('✅✅✅ SUCCESS: Using AI-generated reply from OpenRouter');
      console.log('✅ Reply length:', reply.length, 'characters');
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
    // Still show the message even if save fails
    console.log('🚀 Attempting to get AI reply from OpenRouter (error recovery)...');
    let reply = await generateAIReply(text);
    if (!reply || reply.trim() === '') {
      console.warn('⚠️ AI API failed, using fallback response');
      reply = generateSupportiveReply(text);
    } else {
      console.log('✅ Using AI-generated reply from OpenRouter (error recovery)');
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

