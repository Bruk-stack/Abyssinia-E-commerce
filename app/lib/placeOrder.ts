// app/lib/placeOrder.ts
import Product from "../models/product";
import { Order } from "../models/order";
import { connectDB } from "./db";
import { verifyPaymentIntent } from "../stripe/stripeServices";

// ✅ Type definitions
interface ProductInput {
  id?: string;
  productId?: string;
  _id?: string;
  quantity: number;
}

interface NormalizedProduct {
  id: string;
  quantity: number;
}

interface OrderResult {
  success: boolean;
  message?: string;
  orderId?: string;
  orderNumber?: string;
  total?: number;
  error?: string;
}

// ✅ Robust normalization: handles single object, array, or stringified JSON
function normalizeProducts(input: any): NormalizedProduct[] {
  // Handle stringified JSON (edge case: double-stringify)
  if (typeof input === "string") {
    try {
      input = JSON.parse(input);
    } catch {
      throw new Error("Invalid JSON format in products");
    }
  }

  // Handle null/undefined
  if (!input) {
    throw new Error("Products cannot be empty");
  }

  // Handle single product object → wrap in array
  if (typeof input === "object" && !Array.isArray(input)) {
    const id = input.id || input.productId || input._id;
    if (!id || typeof id !== "string") {
      throw new Error("Product must have a valid id, productId, or _id");
    }
    if (typeof input.quantity !== "number" || input.quantity <= 0) {
      throw new Error("Product quantity must be a positive number");
    }
    return [{ id, quantity: input.quantity }];
  }

  // Handle array of products
  if (Array.isArray(input)) {
    return input.map((item, index) => {
      const id = item.id || item.productId || item._id;
      if (!id || typeof id !== "string") {
        throw new Error(`Product at index ${index} missing valid id`);
      }
      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        throw new Error(`Product at index ${index} has invalid quantity`);
      }
      return { id, quantity: item.quantity };
    });
  }

  throw new Error("Products must be an object or array of objects");
}

// ✅ Calculate order totals and validate products exist in DB
async function calculateOrderDetails(products: NormalizedProduct[]) {
  await connectDB();

  const productIds = products.map((p) => p.id);
  const productsInfo = await Product.find({
    _id: { $in: productIds },
  })
    .select("_id type price src category color")
    .lean();

  const productsMap = new Map(
    productsInfo.map((p: any) => [p._id.toString(), p]),
  );

  let total = 0;
  const orderItems: any[] = [];

  for (const item of products) {
    const product = productsMap.get(item.id);

    if (!product) {
      throw new Error(`Product "${item.id}" not found in database`);
    }

    const subTotal = product.price * item.quantity;
    total += subTotal;

    orderItems.push({
      productId: product._id,
      type: product.type,
      price: product.price,
      quantity: item.quantity,
      subTotal,
      image: product.src,
      category: product.category,
      color: product.color,
    });
    console.log(orderItems);
  }

  return {
    total: Math.round(total * 100) / 100, // Round to 2 decimals
    orderItems,
  };
}

// ✅ Main function: placeOrder (NO AUTH LOGIC, userId passed through unchanged)
export async function placeOrder(
  products: any,
  userId: string, // ✅ Kept as-is: route.ts passes this from localStorage
  paymentIntentId: string,
): Promise<OrderResult> {
  try {
    // 1. Normalize input (single or array)
    const normalizedProducts = normalizeProducts(products);

    if (normalizedProducts.length === 0) {
      return { success: false, error: "No products provided" };
    }

    // 2. Calculate order details & validate products
    const { total: expectedTotal, orderItems } =
      await calculateOrderDetails(normalizedProducts);

    // 3. Verify payment with Stripe
    const paymentVerification = await verifyPaymentIntent(paymentIntentId);

    if (!paymentVerification.success) {
      return {
        success: false,
        error: paymentVerification.error || "Payment verification failed",
      };
    }

    // 4. Security check: ensure paid amount matches order total
    if (Math.abs(paymentVerification.amount - expectedTotal) > 0.01) {
      console.error("⚠️ PAYMENT AMOUNT MISMATCH", {
        expected: expectedTotal,
        paid: paymentVerification.amount,
      });
      return {
        success: false,
        error: "Payment amount mismatch. Order cancelled for security.",
      };
    }

    // 5. Create order in database
    const order = await Order.create({
      userId, // ✅ Passed through unchanged from route.ts
      items: orderItems,
      total: expectedTotal,
      currency: paymentVerification.currency || "usd",
      paymentStatus: "paid",
      paymentId: paymentVerification.paymentId,
      transactionId: paymentVerification.transactionId,
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: "Order placed successfully!",
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      total: expectedTotal,
    };
  } catch (err: any) {
    console.error("❌ placeOrder error:", err);
    return {
      success: false,
      error: err.message || "Failed to place order",
    };
  }
}
