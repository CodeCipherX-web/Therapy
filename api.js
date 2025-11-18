// OpenRouter API integration for mental health chat
// Get your API key from: https://openrouter.ai/keys

const OPENROUTER_API_KEY = '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'; // Replace with your OpenRouter API key
const OPENROUTER_MODEL = 'openai/gpt-4o-mini'; // Default model, can be changed to any OpenRouter model

const systemPrompt = `You are a compassionate and empathetic mental health support assistant. Your role is to:
- Listen actively and validate the user's feelings
- Provide supportive guidance and coping strategies
- Encourage professional help when needed
- Never attempt to provide medical diagnosis or replace professional therapy
- Maintain a warm, non-judgmental tone
- Keep responses concise and helpful
- Focus on immediate support and wellness techniques`;

async function generateResponse(message) {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === '') {
    console.error('OpenRouter API key not configured. Please add your API key to api.js');
    return null;
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'X-Title': 'TranquilMind Chat Assistant'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API error:', response.status, errorData);
      return null;
    }

    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    
    return null;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    return null;
  }
}

// Example usage
async function main() {
  const message = "I am feeling sad and lonely";
  const response = await generateResponse(message);
  
  if (response) {
    console.log('AI Response:', response);
  } else {
    console.log('Failed to get response from OpenRouter API');
  }
}

// Uncomment to test
// main();