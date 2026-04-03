import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/product";

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Invalid product", success: false });
    }
    const product = await Product.findById(productId).lean();
    if (!product) {
      return NextResponse.json({
        error: "Couldn't find the product you are looking for",
        success: false,
      });
    }

    return NextResponse.json({ product: product, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, success: false });
  }
}
