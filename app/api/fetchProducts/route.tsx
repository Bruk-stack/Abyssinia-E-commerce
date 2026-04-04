import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/product";

export async function POST(req: Request) {
  const { ids } = await req.json();
  if (ids.length === 0) {
    return NextResponse.json({ error: "No ids provided", success: false });
  }
  try {
    await connectDB();
    const products = await Product.find({
      _id: { $in: ids },
    })
      .select("_id type price src")
      .lean();

    if (products.length === 0) {
      return NextResponse.json({
        error: "No products available",
        success: false,
      });
    }
    return NextResponse.json({ products: products, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, success: false });
  }
}
