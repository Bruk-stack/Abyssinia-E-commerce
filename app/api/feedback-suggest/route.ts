import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API,
});

interface VocabularyRequest {
  text?: string;
}

export async function POST(req: Request) {
  let body: VocabularyRequest | null = null;

  try {
    body = (await req.json()) as VocabularyRequest;
    const { text } = body;

    if (!text || typeof text !== "string" || text.length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: "Message must be at least 20 characters for suggestions",
          suggestion: "",
        },
        { status: 400 },
      );
    }

    const prompt = `You are a professional writing assistant. Improve the vocabulary and phrasing of the following message while keeping the original meaning and tone.

ORIGINAL MESSAGE:
"${text}"

YOUR TASK:
- Suggest ONE improved version with better vocabulary, clearer phrasing, or more professional tone
- Keep it natural and conversational — don't make it sound robotic
- Preserve the user's intent and emotion
- Keep similar length (within ±20%)
- Return ONLY the improved text, no explanations, no quotes, no markdown

EXAMPLE:
Input: "hi i wanna know when my order gonna come its been 2 weeks"
Output: "Hello, I wanted to check on the status of my order. It has been two weeks since I placed it, and I'm wondering when I can expect delivery."`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            "You are a precise writing assistant. Return ONLY the improved message text — no explanations, no formatting, no extra commentary.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 250,
      top_p: 1,
      stream: false,
    });

    let suggestion = completion.choices[0]?.message?.content?.trim() || "";

    suggestion = suggestion
      .replace(/^["']|["']$/g, "")
      .replace(/^```|```$/g, "")
      .trim();

    if (!suggestion || suggestion === text) {
      suggestion = text
        .replace(/\s+/g, " ")
        .replace(/\s*[.,!?]+\s*$/g, "")
        .trim();

      if (suggestion) {
        suggestion = suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
      }
    }

    return NextResponse.json({
      success: true,
      suggestion,
      meta: {
        model: "openai/gpt-oss-120b",
        originalLength: text.length,
        suggestionLength: suggestion.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    console.error("❌ Vocabulary suggestion error:", err);

    const groqError = err as { status?: number; message?: string };

    if (groqError?.status === 401) {
      return NextResponse.json(
        { success: false, error: "Invalid API key", suggestion: "" },
        { status: 401 },
      );
    }

    if (groqError?.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again in a moment.",
          suggestion: "",
        },
        { status: 429 },
      );
    }

    const rawText = body?.text?.toString() || "";
    const fallback = rawText
      .replace(/\s+/g, " ")
      .replace(/\s*[.,!?]+\s*$/g, "")
      .trim();

    return NextResponse.json(
      {
        success: true,
        suggestion: fallback
          ? fallback.charAt(0).toUpperCase() + fallback.slice(1)
          : "",
        warning: "Used basic formatting (AI service unavailable)",
      },
      { status: 200 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
