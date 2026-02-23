import { NextResponse } from "next/server";

type Body = {
  text?: string;
  target?: string;
  source?: string;
};

export async function POST(request: Request) {
  try {
    const { text = "", target, source }: Body = await request.json();
    //console.log("[API] Received request:", { text, target, source });
    
    if (!text) return NextResponse.json({ translatedText: "" });

    const deepLKey = process.env.deepl;
    if (!deepLKey) {
      console.error("[API] Missing DeepL key");
      return NextResponse.json({ error: "Server configuration error: missing DeepL key" }, { status: 500 });
    }

    // Build payload for n8n webhook
    const payload: Record<string, any> = {
      text,
      target_lang: (target || "EN").toUpperCase(),
    };
    if (source) payload.source_lang = source.toUpperCase();

    //console.log("[API] Sending to n8n webhook:", payload);

    const resp = await fetch("http://localhost:5678/webhook-test/translate", { //A changer dans le futur pour un lien dans une variable d'environnement
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `DeepL-Auth-Key ${deepLKey}`,
      },
      body: JSON.stringify(payload),
    });

    //console.log("[API] n8n response status:", resp.status);
    const bodyText = await resp.text();
    //console.log("[API] n8n response body:", bodyText);

    if (!resp.ok) {
      return NextResponse.json({ error: bodyText }, { status: 500 });
    }

    const json = JSON.parse(bodyText);
    const translatedText = json.translated_text;
    //console.log("[API] Translated text:", translatedText);
    
    return NextResponse.json({ translatedText });
  } 
  catch (err: any) {
    console.error("[API] Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
