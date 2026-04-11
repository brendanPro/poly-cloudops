import { NextResponse } from 'next/server';

type Body = {
  amount?: number;
  from?: string;
  to?: string;
};

export async function POST(request: Request) {
  try {
    const { amount = 1, from = 'USD', to = 'EUR' }: Body = await request.json();

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const n8nUrl = process.env.N8N_CURRENCY_WEBHOOK_URL;
    if (!n8nUrl) {
      console.error('[api/currency] Missing N8N_CURRENCY_WEBHOOK_URL');
      return NextResponse.json(
        { error: 'Webhook URL not configured' },
        { status: 500 }
      );
    }

    const payload = {
      amount,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
    };

    const resp = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const bodyText = await resp.text();
    if (!resp.ok) {
      console.error('[api/currency] Webhook error', bodyText);
      return NextResponse.json(
        { error: 'Currency conversion workflow failed' },
        { status: 502 }
      );
    }

    let json: any;
    try {
      json = JSON.parse(bodyText);
    } catch (parseErr) {
      console.error('[api/currency] Invalid JSON', parseErr, bodyText);
      return NextResponse.json(
        { error: 'Invalid response from workflow' },
        { status: 502 }
      );
    }

    if (!json.success) {
      return NextResponse.json(
        { error: json.error || 'Conversion failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      from: json.from,
      to: json.to,
      amount: json.amount,
      convertedAmount: json.convertedAmount,
      rate: json.rate,
      date: json.date,
      timestamp: json.timestamp,
    });
  } catch (err: any) {
    console.error('[api/currency] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
