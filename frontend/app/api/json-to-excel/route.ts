import { NextResponse } from 'next/server';

type Body = {
  data?: any;
};

export async function POST(request: Request) {
  try {
    const { data }: Body = await request.json();

    // Validate that data exists
    if (!data) {
      return NextResponse.json({ error: 'JSON data is required' }, { status: 400 });
    }

    // Validate that data is an array
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'JSON data must be an array of objects' },
        { status: 400 }
      );
    }

    // Validate array is not empty
    if (data.length === 0) {
      return NextResponse.json(
        { error: 'JSON array cannot be empty' },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.N8N_JSON_EXCEL_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('[api/json-to-excel] Missing N8N_JSON_EXCEL_WEBHOOK_URL');
      return NextResponse.json(
        { error: 'JSON to Excel webhook not configured' },
        { status: 500 }
      );
    }

    // Generate timestamp-based filename
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19)
      .replace('T', '_');
    const filename = `data_${timestamp}`;

    // Call n8n webhook with filename query parameter
    const urlWithFilename = `${webhookUrl}?filename=${encodeURIComponent(filename)}`;

    const resp = await fetch(urlWithFilename, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('[api/json-to-excel] Webhook error', resp.status, errorText);
      return NextResponse.json(
        { error: 'Excel conversion workflow failed' },
        { status: 502 }
      );
    }

    // Get the binary Excel file from n8n
    const buffer = await resp.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    // Calculate file size
    const sizeInBytes = buffer.byteLength;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);

    // Return the Excel file as base64 with metadata
    return NextResponse.json({
      success: true,
      file: base64,
      filename: `${filename}.xlsx`,
      size: `${sizeInKB} KB`,
      sizeBytes: sizeInBytes,
      rowCount: data.length,
    });
  } catch (err: any) {
    console.error('[api/json-to-excel] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
