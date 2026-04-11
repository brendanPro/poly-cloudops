import { NextResponse } from 'next/server';

type Body = {
  city?: string;
};

export async function POST(request: Request) {
  try {
    const { city = '' }: Body = await request.json();

    if (!city.trim()) {
      return NextResponse.json(
        { error: 'City name is required' },
        { status: 400 }
      );
    }

    const n8nUrl = process.env.N8N_WEATHER_WEBHOOK_URL;
    if (!n8nUrl) {
      console.error('[api/weather] Missing N8N_WEATHER_WEBHOOK_URL');
      return NextResponse.json(
        { error: 'Webhook URL not configured' },
        { status: 500 }
      );
    }

    const payload = { city: city.trim() };

    const resp = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const bodyText = await resp.text();
    if (!resp.ok) {
      console.error('[api/weather] Webhook error', bodyText);
      return NextResponse.json(
        { error: 'Weather workflow failed' },
        { status: 502 }
      );
    }

    let json: any;
    try {
      json = JSON.parse(bodyText);
    } catch (parseErr) {
      console.error('[api/weather] Invalid JSON', parseErr, bodyText);
      return NextResponse.json(
        { error: 'Invalid response from workflow' },
        { status: 502 }
      );
    }

    if (!json.success) {
      return NextResponse.json(
        { error: json.error || 'City not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      city: json.city,
      country: json.country,
      temperature: json.temperature,
      humidity: json.humidity,
      windSpeed: json.windSpeed,
      description: json.description,
      weatherCode: json.weatherCode,
      unit: json.unit,
      timezone: json.timezone,
    });
  } catch (err: any) {
    console.error('[api/weather] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
