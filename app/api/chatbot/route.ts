import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 },
      );
    }

    const completion = groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful, friendly assistant in an e-commerce app. Keep responses concise and clear.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      stream: false,
    });

    const botReply =
      (await completion).choices[0].message?.content ||
      "Sorry, I couldn't generate a response.";

    return NextResponse.json({
      success: true,
      message: botReply.trim(),
    });
  } catch (err: any) {
    console.error("Groq API error:", err);

    // Handle specific Groq errors
    if (err?.status === 401) {
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 },
      );
    }
    if (err?.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to get response from AI" },
      { status: 500 },
    );
  }
}
