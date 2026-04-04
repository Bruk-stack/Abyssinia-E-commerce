import { NextResponse } from "next/server";
import { Fetchorders } from "@/app/lib/fetchOrders";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required", success: false },
        { status: 400 },
      );
    }

    const result = await Fetchorders(userId);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", success: false },
      { status: 500 },
    );
  }
}
