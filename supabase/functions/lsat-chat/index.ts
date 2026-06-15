import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

const SYSTEM_PROMPT = `You are Bri, an expert LSAT study coach inside Briefly Brilliant — \
an LSAT prep platform for self-studiers. You help users with:

- LSAT concepts: Logical Reasoning (strengthen/weaken/flaw/inference/assumption), \
  Analytical Reasoning (logic games), Reading Comprehension
- Study strategies and schedules
- Practice test analysis and score improvement
- Understanding why answers are right or wrong
- Recommending study approaches based on their score range and timeline

You are warm, encouraging, and direct. You use clear explanations with examples.
When you explain a concept, walk through it step by step.

IMPORTANT RULES:
- Only answer LSAT-related questions and general test prep questions
- If asked about non-LSAT topics, politely redirect: "I'm Bri, your LSAT coach — \
  I'm best at helping with LSAT prep! What are you working on?"
- Never give legal advice or answer questions about law school applications in depth
- Keep responses focused and under 400 words unless the user asks for a detailed explanation
- Use plain language, not overly academic tone`

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { messages } = await req.json()

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages,
      stream: false,
    })

    return new Response(
      JSON.stringify({ content: response.content[0].text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
