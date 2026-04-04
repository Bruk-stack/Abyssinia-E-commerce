// app/api/recommend/route.ts
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/product";
import type { Document } from "mongoose";

// ✅ Type for request body
interface RecommendRequest {
  category?: string;
  type?: string;
  color?: string;
}

// ✅ Type for Groq response parsing
interface GroqSuggestion {
  suggestedDescription: string;
  suggestedTags: string[];
}

// ✅ Type for similar product (from .lean())
interface LeanProduct {
  description?: string;
  searchTerm?: string[];
}

// ✅ Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API,
});

export async function POST(req: Request) {
  // ✅ Declare body at function scope so it's accessible in catch
  let body: RecommendRequest | null = null;

  try {
    // ✅ Parse input
    body = (await req.json()) as RecommendRequest;
    const { category, type, color } = body;

    // ✅ Validate required fields
    if (!category || !type || !color) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: category, type, color",
          suggestedDescription: "",
          suggestedTags: [],
        },
        { status: 400 },
      );
    }

    // ✅ Connect to DB and fetch similar products
    await connectDB();
    const similarProducts: LeanProduct[] = await Product.find({
      category,
      type: { $ne: type },
    })
      .select("description searchTerm")
      .limit(10)
      .lean()
      .exec();

    // ✅ Build the prompt for Groq
    const prompt = `You are an expert e-commerce copywriter and SEO specialist.

PRODUCT INFO:
• Name: ${type}
• Color: ${color}
• Category: ${category}

YOUR TASK:
Generate TWO things:
1. A compelling product description (exactly 2 sentences, under 200 characters)
2. 5-7 SEO-friendly search tags (single words or short phrases, lowercase)

DESCRIPTION RULES:
- Highlight quality, style, versatility, or occasion
- Natural, engaging, professional tone
- NO emojis, NO markdown, NO bullet points
- Return ONLY the plain text description

TAGS RULES:
- Relevant to product type, color, category, use-case
- Lowercase, comma-separated in output
- Mix broad and specific terms (e.g., "dress", "evening wear", "elegant")
- NO duplicates, NO irrelevant terms

STRICT OUTPUT FORMAT (VALID JSON ONLY):
{
  "suggestedDescription": "<exactly 2 sentences, plain text>",
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

EXAMPLE VALID OUTPUT:
{
  "suggestedDescription": "Elevate your style with this beige casual dress. Perfect for everyday wear, crafted for comfort and timeless appeal.",
  "suggestedTags": ["dress", "casual", "beige", "comfortable", "versatile", "everyday", "fashion"]
}`;

    // ✅ Call Groq API
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            "You are a precise e-commerce assistant. Output ONLY valid JSON with the exact keys: suggestedDescription (string), suggestedTags (array of strings). No extra text, no price, no explanations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
      top_p: 1,
      stream: false,
    });

    // ✅ Parse AI response with safe access
    const aiContent = completion.choices?.[0]?.message?.content;
    let aiResponse = (aiContent ?? "").trim();
    aiResponse = aiResponse.replace(/```json\s*|\s*```/g, "").trim();

    let parsed: GroqSuggestion | null = null;

    try {
      const result = JSON.parse(aiResponse) as GroqSuggestion;
      if (
        typeof result.suggestedDescription === "string" &&
        Array.isArray(result.suggestedTags)
      ) {
        parsed = result;
      }
    } catch {
      // Fallback regex extraction with proper null checks
      const descMatch = aiResponse.match(
        /"suggestedDescription"\s*:\s*"([^"]+)"/,
      );
      const tagsMatch = aiResponse.match(/"suggestedTags"\s*:\s*\[([^\]]+)\]/);

      if (descMatch?.[1] || tagsMatch?.[1]) {
        const rawTags = tagsMatch?.[1]?.split(",") ?? [];
        parsed = {
          suggestedDescription: descMatch?.[1]?.replace(/\\"/g, '"') ?? "",
          suggestedTags: rawTags
            .map((t: string) => t.trim().replace(/^"|"$/g, "").toLowerCase())
            .filter((t: string) => t.length > 0),
        };
      }
    }

    // ✅ Build fallback values with safe string operations
    const safeCategory = String(category ?? "").toLowerCase();
    const safeColor = String(color ?? "").toLowerCase();
    const safeType = String(type ?? "").toLowerCase();
    const typeKeyword = safeType.split(" ")[0] ?? "item";

    const suggestedDescription =
      parsed?.suggestedDescription?.trim() ||
      `Elevate your style with this ${safeColor} ${safeType}. Perfect for ${safeCategory} occasions, crafted for quality and comfort.`;

    const suggestedTags =
      parsed?.suggestedTags && parsed.suggestedTags.length > 0
        ? parsed.suggestedTags
        : [safeCategory, safeColor, typeKeyword, "fashion", "trendy"].slice(
            0,
            6,
          );

    // ✅ Return success response
    return NextResponse.json({
      success: true,
      suggestedDescription,
      suggestedTags,
      meta: {
        model: "openai/gpt-oss-120b",
        similarProductsCount: similarProducts.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    console.error("❌ Groq recommendation error:", err);

    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";

    // ✅ Handle specific Groq/API errors with type guard
    const groqError = err as { status?: number };

    if (groqError?.status === 401) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid API key",
          suggestedDescription: "",
          suggestedTags: [],
        },
        { status: 401 },
      );
    }

    if (groqError?.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          suggestedDescription: "",
          suggestedTags: [],
        },
        { status: 429 },
      );
    }

    // ✅ Generic fallback — use body from outer scope with safe access
    const safeCat = body?.category?.toString().toLowerCase() ?? "fashion";
    const safeCol = body?.color?.toString().toLowerCase() ?? "neutral";
    const safeTyp = body?.type?.toString().toLowerCase() ?? "product";

    const fallbackDesc = `Discover our ${safeCol} ${safeTyp}. Designed for ${safeCat} lovers who value quality and style.`;

    const fallbackTags = [safeCat, safeCol, "quality", "style", "trendy"].slice(
      0,
      5,
    );

    return NextResponse.json(
      {
        success: true,
        suggestedDescription: fallbackDesc,
        suggestedTags: fallbackTags,
        warning: `Used fallback content: ${errorMessage}`,
      },
      { status: 200 },
    );
  }
}

// ✅ CORS preflight support
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
