import { NextResponse } from 'next/server';

type Body = {
  text?: string;
  length?: 'short' | 'medium' | 'detailed';
};

export async function POST(request: Request) {
  try {
    const { text, length = 'medium' }: Body = await request.json();

    // Validate that text exists
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Validate minimum length (at least 50 words)
    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 50) {
      return NextResponse.json(
        { error: 'Text must be at least 50 words long' },
        { status: 400 }
      );
    }

    // Validate length parameter
    if (!['short', 'medium', 'detailed'].includes(length)) {
      return NextResponse.json(
        { error: 'Invalid summary length. Must be short, medium, or detailed' },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.N8N_SUMMARIZE_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('[api/summarize] Missing N8N_SUMMARIZE_WEBHOOK_URL');
      return NextResponse.json(
        { error: 'Summarizer webhook not configured' },
        { status: 500 }
      );
    }

    // Call n8n webhook
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim() }),
      cache: 'no-store',
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('[api/summarize] Webhook error', resp.status, errorText);
      return NextResponse.json(
        { error: 'Summarization workflow failed' },
        { status: 502 }
      );
    }

    // Get the JSON response from n8n
    // Response format: [{"output":{"text":"..."}}]
    const result = await resp.json();

    // Extract summary from the n8n LangChain response
    let summary = '';
    if (Array.isArray(result) && result.length > 0 && result[0].output?.text) {
      summary = result[0].output.text;
    } else {
      console.error('[api/summarize] Unexpected response format:', result);
      return NextResponse.json(
        { error: 'Unexpected response format from workflow' },
        { status: 500 }
      );
    }

    // Return the summary with metadata
    return NextResponse.json({
      success: true,
      summary: summary,
      model: 'openai/gpt-oss-20b:free',
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    });
  } catch (err: any) {
    console.error('[api/summarize] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
