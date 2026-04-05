import mongoose, { models, model, Schema } from "mongoose";

const orderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
      index: true,
    },

    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
          index: true,
        },
        type: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        subTotal: { type: Number, required: true, min: 0 },
        image: { type: String },
        name: { type: String },
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
      type: String,
      unique: true,
      sparse: true,
    },

    transactionId: {
      type: String,
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
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    customerEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },

    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: { userId: 1, createdAt: -1 } },
      { fields: { orderNumber: 1 } },
      { fields: { paymentId: 1 } },
    ],
  },
);

export const Order = models.Order || model("Order", orderSchema);
