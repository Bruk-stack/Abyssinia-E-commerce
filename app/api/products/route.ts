import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/product";

export async function GET(req: Request) {
  try {
    await connectDB();
    const products = await Product.find();
    if (products.length === 0) {
      return NextResponse.json({ success: false, error: "No products" });
    }
    return NextResponse.json({ products: products, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, success: false });
  }
}
