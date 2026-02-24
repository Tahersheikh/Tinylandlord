import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { tenantName, context, messageType } = await req.json()

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
    }

    const systemPrompt = `You are a professional property manager writing communications to tenants. 
Write concise, professional, and friendly messages. Keep SMS under 160 characters. 
Do not use legal threats unless asked. Be firm but respectful.`

    const userPrompt = {
      late_rent: `Write a polite but firm message to ${tenantName} about rent being late. Context: ${context}`,
      rent_reminder: `Write a friendly rent reminder to ${tenantName}. Context: ${context}`,
      lease_renewal: `Write a lease renewal notice to ${tenantName}. Context: ${context}`,
      maintenance_update: `Write a maintenance update message to ${tenantName}. Context: ${context}`,
      custom: context,
    }[messageType] ?? context

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    const message = data.choices?.[0]?.message?.content?.trim()

    if (!message) return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })

    return NextResponse.json({ message })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
