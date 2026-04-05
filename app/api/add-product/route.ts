import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/product";

interface ProductInput {
  type: string;
  color: string;
  src: string;
  price: number;
  category: string;
  searchTerm: string[];
  inStock: number;
  description: string;
  userId: string;
}

function validateProductInput(data: Partial<ProductInput>): string | null {
  if (!data.type?.trim()) return "Product name is required";
  if (!data.color?.trim()) return "Color is required";
  if (!data.src?.trim()) return "Image URL is required";
  if (typeof data.price !== "number" || data.price <= 0)
    return "Valid price is required";
  if (!data.category?.trim()) return "Category is required";
  if (typeof data.inStock !== "number" || data.inStock < 0)
    return "Valid stock quantity is required";
  if (!data.userId) return "User authentication required";
  if (!Array.isArray(data.searchTerm)) return "Search terms must be an array";
  return null;
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body: ProductInput = await req.json();

    const error = validateProductInput(body);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    const newProduct = await Product.create({
      ...body,
      searchTerm: body.searchTerm.map((t) => t.toLowerCase().trim()),
      description: body.description?.trim() || "",
    });

    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("❌ Create product error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create product" },
      { status: 500 },
    );
  }
}
