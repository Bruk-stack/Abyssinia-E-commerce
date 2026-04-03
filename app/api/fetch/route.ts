import { connectDB } from "@/app/lib/db";
import { NextResponse } from "next/server";
import Product from "@/app/models/product";

export async function GET(req: Request) {
  try {
    await connectDB();
    const result = Product.insertMany([
      // --- Image 0 Items ---
      {
        type: "Soft Fabric Casual Dress",
        color: "Biege",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775117023/p6_oxagbc.png",
        price: 92.0,
        category: "Dress",
        searchTerm: ["red", "dress", "ruffle", "layered", "party", "elegant"],
      },
      {
        type: "Deep Purple Evening Dress",
        color: "Purple",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775117001/p3_ujh9nz.png",
        price: 130.0,
        category: "Dress",
        searchTerm: ["purple", "dress", "evening", "formal", "elegant"],
      },
      {
        type: "Black Minimal Shirt",
        color: "Black",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775116994/p2_lmak2i.png",
        price: 44.0,
        category: "Shirt",
        searchTerm: ["black", "shirt", "minimal", "formal", "classic"],
      },
      {
        type: "White Classic Button Shirt",
        color: "White",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775116985/p1_vkurog.png",
        price: 40.0,
        category: "Shirt",
        searchTerm: ["white", "shirt", "formal", "office", "clean"],
      },

      // --- Image 1 Items ---
      {
        type: "Textured Beige Knit Top",
        color: "Beige",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775117034/p11_wtzxtx.png",
        price: 55.0,
        category: "Top",
        searchTerm: ["beige", "knit", "textured", "casual", "warm"],
      },

      // --- Image 2 Items ---
      {
        type: "Royal Blue Formal Shirt",
        color: "Blue",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775212583/p8_t9fw6x.png",
        price: 52.0,
        category: "Shirt",
        searchTerm: ["blue", "shirt", "formal", "office", "clean fit"],
      },
      {
        type: "Teal Green Button Shirt",
        color: "Green",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775212601/p10_loklyn.png",
        price: 50.0,
        category: "Shirt",
        searchTerm: ["green", "shirt", "teal", "modern", "smart casual"],
      },
      {
        type: "Light Blue Slim Fit Shirt",
        color: "Light Blue",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775212665/p9_yzjltz.png",
        price: 46.0,
        category: "Shirt",
        searchTerm: ["light blue", "shirt", "slim fit", "office", "casual"],
      },
      {
        type: "Dark Classic Dress",
        color: "Dark",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775117015/p5_qy0t2z.png",
        price: 49.0,
        category: "Shirt",
        searchTerm: ["dark blue", "shirt", "classic", "formal", "clean"],
      },
    ]);
    if (!result) {
      return NextResponse.json({
        error: "Error occured during fetch",
        success: false,
      });
    }
    return NextResponse.json({ message: "Success", success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, success: false });
  }
}
