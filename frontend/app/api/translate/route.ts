import { NextResponse } from "next/server";

type Body = {
  text?: string;
  target?: string;
  source?: string;
};

export async function POST(request: Request) {
  try {
    const { text = "", target, source }: Body = await request.json();

    if (!text) return NextResponse.json({ translatedText: "" });

    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nUrl) {
      console.error("[API] N8N_WEBHOOK_URL is not defined");
      return NextResponse.json(
        { error: "Webhook URL not configured" },
        { status: 500 }
      );
    }

    const payload: Record<string, any> = {
      text,
      target_lang: (target || "EN").toUpperCase(),
    };
    if (source) payload.source_lang = source.toUpperCase();

    const resp = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const bodyText = await resp.text();
    if (!resp.ok) {
      return NextResponse.json({ error: bodyText }, { status: 500 });
    }

    const json = JSON.parse(bodyText);
    return NextResponse.json({ translatedText: json.translated_text });
  } catch (err: any) {
    console.error("[API] Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}