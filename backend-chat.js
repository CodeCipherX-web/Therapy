// Backend proxy server for OpenRouter API
// This protects the API key by handling requests server-side
// Run with: node backend-chat.js
// Or use: npm run backend

const http = require('http');
const https = require('https');
require('dotenv').config();

const PORT = process.env.BACKEND_PORT || 3001;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'tngtech/deepseek-r1t2-chimera:free';
const SITE_URL = process.env.SITE_URL || 'https://tranquilmind.app';

if (!OPENROUTER_API_KEY) {
  console.error('❌ ERROR: OPENROUTER_API_KEY not found in environment variables!');
  console.error('💡 Make sure your .env file contains: OPENROUTER_API_KEY="your-key-here"');
  console.error('💡 Get your API key from: https://openrouter.ai/keys');
  process.exit(1);
}

console.log('✅ Backend chat server starting...');
console.log(`📍 Port: ${PORT}`);
console.log(`🔑 API Key: ${OPENROUTER_API_KEY.substring(0, 10)}...`);
console.log(`🤖 Model: ${OPENROUTER_MODEL}`);

const server = http.createServer((req, res) => {
  // CORS headers
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
    return;
  }

  // Only handle /backend-chat endpoint
  if (req.url !== '/backend-chat' && req.url !== '/backend-chat/') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found. Use /backend-chat endpoint.' }));
    return;
  }

  // Read request body
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const requestData = JSON.parse(body);
      const userMessage = requestData.message;

      if (!userMessage || typeof userMessage !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing or invalid "message" field' }));
        return;
      }

      console.log(`📨 Received message: ${userMessage.substring(0, 50)}...`);

      // Forward to OpenRouter API
      const startTime = Date.now();
      
      const openRouterRequest = {
        hostname: 'openrouter.ai',
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'X-Title': 'TranquilMind Chat Assistant',
          'HTTP-Referer': SITE_URL
        }
      };

      const openRouterBody = JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a compassionate and empathetic mental health support assistant. Your role is to listen actively, validate feelings, provide supportive guidance, and encourage professional help when needed. Keep responses concise (2-3 sentences max).'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      });

      const openRouterReq = https.request(openRouterRequest, (openRouterRes) => {
        let responseBody = '';

        openRouterRes.on('data', chunk => {
          responseBody += chunk.toString();
        });

        openRouterRes.on('end', () => {
          const responseTime = Date.now() - startTime;
          console.log(`⏱️  OpenRouter response time: ${responseTime}ms`);

          if (openRouterRes.statusCode !== 200) {
            console.error(`❌ OpenRouter API error: ${openRouterRes.statusCode}`);
            console.error(`Response: ${responseBody.substring(0, 500)}`);
            
            // Provide helpful error messages
            if (openRouterRes.statusCode === 401) {
              console.error('💡 401 Unauthorized - Check your OPENROUTER_API_KEY in .env file');
              console.error('💡 Get a new API key from: https://openrouter.ai/keys');
            } else if (openRouterRes.statusCode === 429) {
              console.error('💡 429 Rate limit exceeded - You may have hit API rate limits');
            } else if (openRouterRes.statusCode === 402) {
              console.error('💡 402 Payment required - Check your OpenRouter account credits');
            }
            
            res.writeHead(openRouterRes.statusCode, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: 'OpenRouter API error',
              status: openRouterRes.statusCode,
              details: responseBody.substring(0, 500)
            }));
            return;
          }

          try {
            const data = JSON.parse(responseBody);
            if (data.choices && data.choices[0] && data.choices[0].message) {
              const reply = data.choices[0].message.content;
              console.log(`✅ Successfully got AI reply (${reply.length} chars)`);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ reply: reply.trim() }));
            } else {
              console.error('❌ Unexpected OpenRouter response format:', data);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Unexpected response format from OpenRouter' }));
            }
          } catch (parseError) {
            console.error('❌ Error parsing OpenRouter response:', parseError);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error parsing OpenRouter response' }));
          }
        });
      });

      openRouterReq.on('error', (error) => {
        console.error('❌ Error calling OpenRouter API:', error);
        console.error('💡 Check your internet connection and OpenRouter API status');
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error calling OpenRouter API', details: error.message }));
      });

      // Set timeout for OpenRouter request
      openRouterReq.setTimeout(25000, () => {
        console.error('❌ OpenRouter API request timeout');
        openRouterReq.destroy();
        res.writeHead(504, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'OpenRouter API request timeout' }));
      });

      openRouterReq.write(openRouterBody);
      openRouterReq.end();

    } catch (error) {
      console.error('❌ Error processing request:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Backend chat server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoint: POST http://localhost:${PORT}/backend-chat`);
  console.log(`\n⚠️  Make sure your frontend is configured to call this endpoint!`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`💡 Try using a different port: BACKEND_PORT=3002 node backend-chat.js`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});
