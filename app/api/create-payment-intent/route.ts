import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent } from "@/app/stripe/stripeServices";

function isValidProduct(p: any): p is { id: string; quantity: number } {
  return (
    p &&
    typeof p.id === "string" &&
    typeof p.quantity === "number" &&
    p.quantity > 0
  );
}

export async function POST(req: NextRequest) {
  try {
    const { products, currency } = await req.json();

    let productArray: Array<{ id: string; quantity: number }> = [];

    if (Array.isArray(products)) {
      if (!products.every(isValidProduct)) {
        return NextResponse.json(
          {
            error: "Each product must have { id: string, quantity: number }",
            success: false,
          },
          { status: 400 },
        );
      }
      productArray = products;
    } else if (
      products &&
      typeof products === "object" &&
      !Array.isArray(products)
    ) {
      if (!isValidProduct(products)) {
        return NextResponse.json(
          {
            error: "Product must have { id: string, quantity: number }",
            success: false,
          },
          { status: 400 },
        );
      }
      productArray = [products];
    } else if (products && typeof products === "string") {
      try {
        const parsed = JSON.parse(products);
        if (Array.isArray(parsed)) {
          if (!parsed.every(isValidProduct))
            throw new Error("Invalid product shape");
          productArray = parsed;
        } else if (parsed && typeof parsed === "object") {
          if (!isValidProduct(parsed)) throw new Error("Invalid product shape");
          productArray = [parsed];
        } else {
          throw new Error("Parsed value is not object or array");
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON in products string", success: false },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json(
        {
          error:
            "Invalid products format. Expected {id, quantity} or array of same",
          success: false,
        },
        { status: 400 },
      );
    }

    if (productArray.length === 0) {
      return NextResponse.json(
        { error: "At least one product is required", success: false },
        { status: 400 },
      );
    }

    const result = await createPaymentIntent(productArray, currency || "usd");

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    console.error("❌ Create payment intent error:", error);
    return NextResponse.json(
      { error: error.message || "Server error", success: false },
      { status: 500 },
    );
  }
}
