import { NextResponse } from 'next/server';

type Body = {
  text?: string;
  target?: string;
  source?: string;
};

const normalizeLang = (value?: string, fallback = 'EN') =>
  (value || fallback).trim().toUpperCase();

export async function POST(request: Request) {
  try {
    const { text = '', target, source }: Body = await request.json();

    if (!text.trim()) return NextResponse.json({ translatedText: '' });

    const n8nUrl = process.env.N8N_TRANSLATE_WEBHOOK_URL;
    if (!n8nUrl) {
      console.error('[api/translate] Missing N8N_TRANSLATE_WEBHOOK_URL');
      return NextResponse.json(
        { error: 'Webhook URL not configured' },
        { status: 500 }
      );
    }

    const payload: Record<string, string> = {
      text,
      target_lang: normalizeLang(target, 'EN'),
    };
    if (source) payload.source_lang = normalizeLang(source);

    const resp = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // The webhook does not require cookies; avoid including them unnecessarily.
      cache: 'no-store',
    });

    const bodyText = await resp.text();
    if (!resp.ok) {
      console.error('[api/translate] Webhook error', bodyText);
      return NextResponse.json({ error: 'Translation workflow failed' }, { status: 502 });
    }

    let json: any;
    try {
      json = JSON.parse(bodyText);
    } catch (parseErr) {
      console.error('[api/translate] Invalid JSON', parseErr, bodyText);
      return NextResponse.json({ error: 'Invalid response from workflow' }, { status: 502 });
    }

    return NextResponse.json({ translatedText: json.translated_text ?? '' });
  } catch (err: any) {
    console.error('[api/translate] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
