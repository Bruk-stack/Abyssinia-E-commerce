// app/api/order/route.ts
import { placeOrder } from "@/app/lib/placeOrder";
import { NextResponse } from "next/server";

// ✅ Helper: Validate userId format
function isValidUserId(id: any): id is string {
  return typeof id === "string" && id.length > 0 && id.length <= 100;
}

export async function POST(req: Request) {
  try {
    const { products, paymentIntentId, userId } = await req.json();
    console.log(products, paymentIntentId, userId);

    // ✅ Validate required fields
    if (!products || !paymentIntentId || !userId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: products, paymentIntentId, and userId",
          success: false,
        },
        { status: 400 },
      );
    }

    // ✅ Validate userId format (basic sanity check)
    if (!isValidUserId(userId)) {
      return NextResponse.json(
        { error: "Invalid userId format", success: false },
        { status: 400 },
      );
    }

    // ✅ Validate products array
    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Products must be a non-empty array", success: false },
        { status: 400 },
      );
    }

    // ✅ Validate each product has id and quantity
    const validProducts = products.every(
      (p: any) =>
        p &&
        typeof p.id === "string" &&
        typeof p.quantity === "number" &&
        p.quantity > 0,
    );

    if (!validProducts) {
      return NextResponse.json(
        {
          error: "Each product must have { id: string, quantity: number }",
          success: false,
        },
        { status: 400 },
      );
    }

    // ✅ Place order (userId comes from frontend localStorage)
    const result = await placeOrder(products, userId, paymentIntentId);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("❌ Place order error:", err);
    return NextResponse.json(
      { error: err.message || "Server error", success: false },
      { status: 500 },
    );
  }
}
