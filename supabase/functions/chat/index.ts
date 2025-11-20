// Supabase Edge Function for Chat API
// Replaces backend-chat.js Node.js server
// Deploy with: supabase functions deploy chat

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables from Supabase secrets
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
    const OPENROUTER_MODEL = Deno.env.get('OPENROUTER_MODEL') || 'tngtech/deepseek-r1t2-chimera:free'
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://tranquilmind.app'

    if (!OPENROUTER_API_KEY) {
      console.error('❌ OPENROUTER_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { message } = await req.json()

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid "message" field' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`📨 Received message: ${message.substring(0, 50)}...`)

    // Forward to OpenRouter API
    const startTime = Date.now()

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'X-Title': 'TranquilMind Chat Assistant',
        'HTTP-Referer': SITE_URL
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a compassionate and empathetic mental health support assistant. Your role is to listen actively, validate feelings, provide supportive guidance, and encourage professional help when needed. Keep responses concise (2-3 sentences max).'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    })

    const responseTime = Date.now() - startTime
    console.log(`⏱️  OpenRouter response time: ${responseTime}ms`)

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text()
      console.error(`❌ OpenRouter API error: ${openRouterResponse.status}`)
      console.error(`Response: ${errorText}`)
      
      return new Response(
        JSON.stringify({ 
          error: 'OpenRouter API error',
          status: openRouterResponse.status,
          details: errorText
        }),
        { 
          status: openRouterResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await openRouterResponse.json()

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const reply = data.choices[0].message.content
      console.log(`✅ Successfully got AI reply (${reply.length} chars)`)
      
      return new Response(
        JSON.stringify({ reply: reply.trim() }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      console.error('❌ Unexpected OpenRouter response format:', data)
      return new Response(
        JSON.stringify({ error: 'Unexpected response format from OpenRouter' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('❌ Error processing request:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

