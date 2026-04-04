import mongoose, { model, models, mongo, Schema } from "mongoose";
import { describe } from "node:test";

const productSchema = new Schema({
  type: { type: String, required: true },
  color: {
    type: String,
  },
  src: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  searchTerm: [{ type: String, lowercase: true }],
  inStock: {
    type: Number,
    reuired: true,
  },
  userId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
