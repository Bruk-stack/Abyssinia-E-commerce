import Product from "../models/product";
import { Order } from "../models/order";
import { connectDB } from "./db";
import { verifyPaymentIntent } from "../stripe/stripeServices";

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

function normalizeProducts(input: any): NormalizedProduct[] {
  if (typeof input === "string") {
    try {
      input = JSON.parse(input);
    } catch {
      throw new Error("Invalid JSON format in products");
    }
  }

  if (!input) {
    throw new Error("Products cannot be empty");
  }

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
    total: Math.round(total * 100) / 100,
    orderItems,
  };
}

export async function placeOrder(
  products: any,
  userId: string,
  paymentIntentId: string,
): Promise<OrderResult> {
  try {
    const normalizedProducts = normalizeProducts(products);

    if (normalizedProducts.length === 0) {
      return { success: false, error: "No products provided" };
    }

    const { total: expectedTotal, orderItems } =
      await calculateOrderDetails(normalizedProducts);

    const paymentVerification = await verifyPaymentIntent(paymentIntentId);

    if (!paymentVerification.success) {
      return {
        success: false,
        error: paymentVerification.error || "Payment verification failed",
      };
    }

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

    const order = await Order.create({
      userId,
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
