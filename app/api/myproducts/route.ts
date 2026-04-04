import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/product";

export async function POST(req: Request) {
  const { userId } = await req.json();

  try {
    await connectDB();

    // Or with sorting, projection, etc.
    const products = await Product.find({ userId })
      .sort({ createdAt: -1 }) // newest first
      .select("-searchTerm") // exclude large fields if needed
      .lean(); // return plain JS objects (faster, no Mongoose docs)

    return NextResponse.json({ products: products, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, success: false });
  }
}
