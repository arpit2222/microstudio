import { NextResponse } from "next/server";

const BANNED_KEYWORDS = [
  "murder", "kill", "terrorist", "bomb", "hate", "racist", "assault"
];

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Basic Mock Content Moderation
    // In production, this would call Genblaze or OpenAI moderation APIs
    const lowerText = text.toLowerCase();
    for (const word of BANNED_KEYWORDS) {
      if (lowerText.includes(word)) {
        return NextResponse.json({ 
          safe: false, 
          reason: `Prompt contains prohibited content related to: ${word}` 
        });
      }
    }

    return NextResponse.json({ safe: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
