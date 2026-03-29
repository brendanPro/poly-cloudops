import { NextResponse } from 'next/server';

type Body = {
  data?: string;
};

export async function POST(request: Request) {
  try {
    const { data = '' }: Body = await request.json();

    if (!data.trim()) {
      return NextResponse.json({ error: 'Data is required' }, { status: 400 });
    }

    const webhookUrl = process.env.N8N_QR_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('[api/qr] Missing N8N_QR_WEBHOOK_URL');
      return NextResponse.json(
        { error: 'QR webhook not configured' },
        { status: 500 }
      );
    }

    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
      cache: 'no-store',
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('[api/qr] Webhook error', resp.status, errorText);
      return NextResponse.json({ error: 'QR workflow failed' }, { status: 502 });
    }

    const contentType = resp.headers.get('content-type') || '';

    if (contentType.startsWith('image/')) {
      const buffer = Buffer.from(await resp.arrayBuffer());
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${contentType};base64,${base64}`;
      return NextResponse.json({ image: dataUrl });
    }

    // Otherwise assume JSON/text response from QR service
    const text = await resp.text();
    try {
      const parsed = JSON.parse(text);
      return NextResponse.json({ image: parsed.image ?? parsed.url ?? '' });
    } catch {
      return NextResponse.json({ image: text });
    }
  } catch (err: any) {
    console.error('[api/qr] Error:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
