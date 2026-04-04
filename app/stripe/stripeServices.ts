// app/lib/payment/services/stripeServices.ts
// app/lib/payment/services/stripeServices.ts
import Stripe from "stripe";
import { connectDB } from "../lib/db"; // ✅ Import DB connection
import Product from "../models/product"; // ✅ Import Product model

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

interface ProductItem {
  id: string;
  quantity: number;
}

interface CreatePaymentIntentResult {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  amount?: number; // In dollars
  currency?: string;
  error?: string;
}

export async function createPaymentIntent(
  products: ProductItem[],
  currency: string = "usd",
): Promise<CreatePaymentIntentResult> {
  try {
    // ✅ Connect to DB first
    await connectDB();

    // ✅ Fetch real products to get actual prices
    const productIds = products.map((p) => p.id);
    const productsInfo = await Product.find({
      _id: { $in: productIds },
    })
      .select("_id price") // Only fetch what we need
      .lean();

    // ✅ Build price lookup map
    const priceMap = new Map(
      productsInfo.map((p: any) => [p._id.toString(), p.price]),
    );

    // ✅ Calculate total using REAL prices (convert to cents for Stripe)
    let totalCents = 0;
    for (const item of products) {
      const price = priceMap.get(item.id);

      if (price === undefined) {
        throw new Error(`Product "${item.id}" not found in database`);
      }

      if (typeof price !== "number" || price < 0) {
        throw new Error(`Invalid price for product "${item.id}"`);
      }

      // Convert dollars to cents: $92.00 → 9200 cents
      totalCents += Math.round(price * 100) * item.quantity;
    }

    if (totalCents <= 0) {
      return {
        success: false,
        error: "Total amount must be greater than 0",
      };
    }

    // ✅ Create PaymentIntent with Stripe (amount in cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        productIds: products.map((p) => p.id).join(","),
        totalItems: products.reduce((sum, p) => sum + p.quantity, 0).toString(),
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret || undefined,
      paymentIntentId: paymentIntent.id,
      amount: totalCents / 100, // ✅ Return in dollars for frontend/verification
      currency: currency,
    };
  } catch (error: any) {
    console.error("❌ Stripe PaymentIntent creation failed:", error);
    return {
      success: false,
      error: error.message || "Failed to create payment intent",
    };
  }
}

interface PaymentVerificationSuccess {
  success: true;
  paymentId: string;
  transactionId: string | null;
  amount: number;
  currency: string;
}

interface PaymentVerificationFailure {
  success: false;
  error: string;
}

type PaymentVerification =
  | PaymentVerificationSuccess
  | PaymentVerificationFailure;

export async function verifyPaymentIntent(
  paymentIntentId: string,
): Promise<PaymentVerification> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      let transactionId: string | null = null;

      if (typeof paymentIntent.latest_charge === "string") {
        transactionId = paymentIntent.latest_charge;
      } else if (paymentIntent.latest_charge) {
        transactionId = paymentIntent.latest_charge.id;
      }

      return {
        success: true,
        paymentId: paymentIntent.id,
        transactionId: transactionId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      };
    } else {
      return {
        success: false,
        error: `Payment status: ${paymentIntent.status}`,
      };
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
