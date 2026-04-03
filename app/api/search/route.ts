import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/product";

// ✅ Safe Groq initialization
const groq = new Groq({ apiKey: process.env.GROQ_API! });

export async function POST(req: Request) {
  try {
    const { term } = await req.json();

    if (!term || typeof term !== "string" || !term.trim()) {
      return NextResponse.json(
        { error: "Missing or invalid search term", success: false },
        { status: 400 },
      );
    }

    if (!groq) {
      return NextResponse.json(
        { error: "AI service not configured", success: false },
        { status: 503 },
      );
    }

    await connectDB();

    // ⚠️ Limit to 100 to stay within token limits & reduce latency
    const products = await Product.find({}).limit(100).lean();

    if (products.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    // ✅ Lightweight context for AI (strip heavy fields)
    const productsContext = products.map((p: any) => ({
      _id: p._id.toString(),
      type: p.type,
      src: p.src,
      price: p.price,
      category: p.category,
      color: p.color,
      searchTerm: p.searchTerm, // Kept for AI matching context
    }));

    // 🧠 Precision Prompt for Search Matching
    const systemPrompt = `
      You are an intelligent e-commerce search engine.
      Task: Analyze the user's search query and return ONLY the products from the provided database that are relevant matches.

      Strict Rules:
      1. Return ONLY a valid JSON array of objects. No markdown, no explanations, no extra text.
      2. Each object must contain EXACTLY these fields: _id (string), type, src, price, category, color.
      3. Match based on product name, category, color, or search keywords.
      4. Rank the most relevant products first.
      5. If no products match, return an empty array [].
    `;

    const userPrompt = `
      Search Query: "${term.trim()}"

      Available Products Database:
      ${JSON.stringify(productsContext)}

      Return the matching products as a JSON array now:
    `;

    // 🤖 Call Groq
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b", // ✅ Matches your working chatbot
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1, // 🔽 Low for deterministic, accurate matching
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No content from AI");

    // 🧹 Clean & Parse (removes markdown wrappers if AI adds them)
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json"))
      cleanContent = cleanContent.slice(7);
    if (cleanContent.startsWith("```")) cleanContent = cleanContent.slice(3);
    if (cleanContent.endsWith("```")) cleanContent = cleanContent.slice(0, -3);

    const results = JSON.parse(cleanContent.trim());

    return NextResponse.json({ success: true, products: results });
  } catch (err: any) {
    console.error("❌ Search API Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Search failed" },
      { status: 500 },
    );
  }
}
