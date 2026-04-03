import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/product";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API! });

export async function POST(req: Request) {
  try {
    await connectDB();
    const { keyWords } = await req.json();
    console.log(keyWords);

    // 1. Fetch a subset of products (adjust limit based on your DB size)
    const products = await Product.find().limit(60).lean();

    if (products.length === 0) {
      return NextResponse.json({ success: false, products: [] });
    }

    // 2. Format for AI (include all fields needed in output)
    const productsContext = products.map((p: any) => ({
      _id: p._id.toString(),
      type: p.type,
      src: p.src,
      price: p.price,
      category: p.category,
      color: p.color,
      searchTerm: p.searchTerm,
    }));

    // ✅ 3. Dynamic prompt based on history presence
    const hasHistory =
      keyWords && Array.isArray(keyWords) && keyWords.length > 0;
    const contextPrompt = hasHistory
      ? `User's recent search history: ${JSON.stringify(keyWords)}. Recommend products that closely match these specific interests.`
      : `No search history provided. Recommend a diverse, high-quality selection of trending or popular products from the database.`;

    console.log("history=", hasHistory);
    const systemPrompt = `
      You are an expert e-commerce product recommendation engine.
      Task: Select the top 6-8 MOST relevant products from the provided database based on the context.

      Strict Rules:
      1. Return ONLY a valid JSON array of objects. No markdown, no explanations.
      2. Each object must contain EXACTLY: _id (string), type, src, price, category, color.
      3. Only use products from the provided list. Do not invent new ones.
      4. If no good matches exist, return an empty array [].
      5. don't always return the products in the same order.
    `;

    const userPrompt = `
      ${contextPrompt}

      Available Products Database:
      ${JSON.stringify(productsContext)}

      Output the JSON array now:
    `;

    // 4. Call Groq
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2, // Slightly higher for variety when no history exists
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No content from AI");

    // 5. Clean & Parse (removes potential markdown wrappers)
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json"))
      cleanContent = cleanContent.slice(7);
    if (cleanContent.startsWith("```")) cleanContent = cleanContent.slice(3);
    if (cleanContent.endsWith("```")) cleanContent = cleanContent.slice(0, -3);

    const suggestions = JSON.parse(cleanContent.trim());

    return NextResponse.json({ success: true, products: suggestions });
  } catch (err: any) {
    console.error("❌ Suggestion API Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "AI suggestion failed" },
      { status: 500 },
    );
  }
}
