import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/product";

const groq = new Groq({
  apiKey: process.env.GROQ_API,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, price, type, color } = body;

    if (!category || !price || !type || !color) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: category, price, type, color",
          recommendation: "",
          averagePrice: null,
          suggestedPrice: null,
        },
        { status: 400 },
      );
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Price must be a valid positive number",
          recommendation: "",
          averagePrice: null,
          suggestedPrice: null,
        },
        { status: 400 },
      );
    }

    await connectDB();

    const similarProducts = await Product.find({
      category,
      type: { $ne: type },
    })
      .select("price type")
      .limit(20)
      .lean();

    const prices = similarProducts
      .map((p: any) => p.price)
      .filter((p: number) => typeof p === "number" && p > 0);
    const averagePrice =
      prices.length > 0
        ? Math.round(
            (prices.reduce((a: number, b: number) => a + b, 0) /
              prices.length) *
              100,
          ) / 100
        : numericPrice;

    const prompt = `You are an AI ecommerce pricing expert.

PRODUCT INFO:
• Name: ${type}
• Color: ${color}
• Category: ${category}
• User's Proposed Price: $${numericPrice}
• Market Average Price (from similar products): $${averagePrice}

YOUR TASK:
1. Compare the user's price ($${numericPrice}) to the market average ($${averagePrice})
2. Calculate the exact percentage difference
3. Recommend an OPTIMAL price point (a specific number, e.g., 89.99)
4. Give a 1-sentence reason

STRICT OUTPUT RULES:
- Return ONLY a JSON object with these exact keys:
  {
    "suggestedPrice": <number>,
    "assessment": "<Great Deal / Fair / Overpriced>",
    "reason": "<one short sentence>"
  }
- suggestedPrice MUST be a number (no "$", no text)
- Keep reason under 15 words
- NO extra text, NO markdown, NO explanations outside the JSON

Example valid output:
{"suggestedPrice":89.99,"assessment":"Fair","reason":"Aligns with market average for this category."}`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            "You are a precise pricing analyst. Output ONLY valid JSON with exact numeric values. No extra text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
      top_p: 1,
      stream: false,
    });

    let aiResponse = completion.choices[0]?.message?.content?.trim() || "";

    aiResponse = aiResponse.replace(/```json\s*|\s*```/g, "").trim();

    let parsed: {
      suggestedPrice: number;
      assessment: string;
      reason: string;
    } | null = null;
    try {
      parsed = JSON.parse(aiResponse);
    } catch {
      const priceMatch = aiResponse.match(/"suggestedPrice"\s*:\s*(\d+\.?\d*)/);
      const assessmentMatch = aiResponse.match(/"assessment"\s*:\s*"([^"]+)"/);
      const reasonMatch = aiResponse.match(/"reason"\s*:\s*"([^"]+)"/);

      if (priceMatch) {
        parsed = {
          suggestedPrice: parseFloat(priceMatch[1]),
          assessment: assessmentMatch?.[1] || "Fair",
          reason: reasonMatch?.[1] || "Based on market analysis",
        };
      }
    }

    const suggestedPrice =
      parsed?.suggestedPrice ?? Math.round(averagePrice * 100) / 100;
    const assessment =
      parsed?.assessment ??
      (numericPrice < averagePrice * 0.9
        ? "Great Deal"
        : numericPrice > averagePrice * 1.1
          ? "Overpriced"
          : "Fair");
    const reason =
      parsed?.reason ??
      `Market average is $${averagePrice} for similar ${category.toLowerCase()} items.`;

    const recommendation = `$${suggestedPrice} • ${assessment}: ${reason}`;

    return NextResponse.json({
      success: true,
      recommendation,
      averagePrice,
      suggestedPrice,
      meta: {
        model: "openai/gpt-oss-120b",
        similarProductsCount: prices.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("❌ Groq pricing recommendation error:", err);

    if (err?.status === 401) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid API key",
          recommendation: "",
          averagePrice: null,
          suggestedPrice: null,
        },
        { status: 401 },
      );
    }

    if (err?.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          recommendation: "",
          averagePrice: null,
          suggestedPrice: null,
        },
        { status: 429 },
      );
    }

    if (err?.status === 400) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          recommendation: "",
          averagePrice: null,
          suggestedPrice: null,
        },
        { status: 400 },
      );
    }

    const fallbackAvg = 75;
    const fallbackSuggested = Math.round(fallbackAvg * 100) / 100;

    return NextResponse.json(
      {
        success: true,
        recommendation: `$${fallbackSuggested} • Fair: Using default market data.`,
        averagePrice: fallbackAvg,
        suggestedPrice: fallbackSuggested,
        warning: "Used fallback pricing (AI service unavailable)",
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
