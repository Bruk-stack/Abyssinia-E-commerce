// app/models/order.ts
import mongoose, { models, model, Schema } from "mongoose";

const orderSchema = new Schema(
  {
    // ✅ Changed: userId is now a flexible string (no User ref required)
    userId: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
      index: true, // Still index for fast lookups by userId
    },

    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product", // ✅ Keep Product ref (you still have products in DB)
          required: true,
          index: true,
        },
        type: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        subTotal: { type: Number, required: true, min: 0 },
        image: { type: String },
        // Optional: store snapshot of product details at time of order
        name: { type: String }, // product.type snapshot
        color: { type: String },
        category: { type: String },
      },
    ],

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "usd",
      uppercase: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    paymentId: {
      type: String, // Stripe PaymentIntent ID
      unique: true,
      sparse: true, // Allow null for unpaid orders
    },

    transactionId: {
      type: String, // Stripe charge ID or other gateway reference
    },

    orderNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },

    shippingAddress: {
      // Optional: collect at checkout if needed
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    customerEmail: {
      // Optional: for order confirmations (no auth required)
      type: String,
      lowercase: true,
      trim: true,
    },

    notes: {
      // Optional: customer notes or admin internal notes
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    // ✅ Add compound index for common queries
    indexes: [
      { fields: { userId: 1, createdAt: -1 } }, // User's order history
      { fields: { orderNumber: 1 } }, // Fast lookup by order number
      { fields: { paymentId: 1 } }, // Verify payment linkage
    ],
  },
);

// ✅ Prevent "OverwriteModelError" in dev with hot reload
export const Order = models.Order || model("Order", orderSchema);
