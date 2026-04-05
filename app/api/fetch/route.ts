import { connectDB } from "@/app/lib/db";
import { NextResponse } from "next/server";
import Product from "@/app/models/product";

const FIXED_USER_ID = "64f2a9c1e3b8a7d9f4c2b1e8";
const FIXED_IN_STOCK = 50;

export async function GET(req: Request) {
  try {
    await connectDB();

    const insertedDocs = await Product.insertMany([
      {
        type: "Soft Fabric Casual Dress",
        color: "Biege",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775117023/p6_oxagbc.png",
        price: 92.0,
        category: "Dress",
        searchTerm: ["red", "dress", "ruffle", "layered", "party", "elegant"],
        userId: FIXED_USER_ID,
        inStock: FIXED_IN_STOCK,
        description:
          "Embrace effortless elegance with this soft fabric casual dress in a warm beige tone. Featuring delicate ruffle details and a flattering layered silhouette, it's perfect for brunch dates, garden parties, or any occasion where you want to look polished yet comfortable. The breathable fabric ensures all-day wearability while the timeless design transitions seamlessly from day to evening.",
      },
      {
        type: "Deep Purple Evening Dress",
        color: "Purple",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775117001/p3_ujh9nz.png",
        price: 130.0,
        category: "Dress",
        searchTerm: ["purple", "dress", "evening", "formal", "elegant"],
        userId: FIXED_USER_ID,
        inStock: FIXED_IN_STOCK,
        description:
          "Make a statement at your next formal event with this stunning deep purple evening dress. Crafted from luxurious fabric with a sophisticated cut, this dress drapes beautifully and accentuates your silhouette. The rich purple hue adds a touch of royal elegance, making it ideal for galas, weddings, or upscale dinners. Pair with metallic heels and minimal jewelry for a look that commands attention.",
      },
      {
        type: "Black Minimal Shirt",
        color: "Black",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775116994/p2_lmak2i.png",
        price: 44.0,
        category: "Shirt",
        searchTerm: ["black", "shirt", "minimal", "formal", "classic"],
        userId: FIXED_USER_ID,
        inStock: FIXED_IN_STOCK,
        description:
          "The ultimate wardrobe essential: a black minimal shirt that does it all. Clean lines, premium fabric, and a versatile cut make this piece perfect for the office, casual Fridays, or evening outings. The classic design never goes out of style, while the quality construction ensures it remains a favorite for years. Dress it up with tailored trousers or down with your favorite jeans.",
      },
      {
        type: "White Classic Button Shirt",
        color: "White",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775116985/p1_vkurog.png",
        price: 40.0,
        category: "Shirt",
        searchTerm: ["white", "shirt", "formal", "office", "clean"],
        userId: FIXED_USER_ID,
        inStock: FIXED_IN_STOCK,
        description:
          "Crisp, clean, and endlessly versatile—this white classic button shirt is a must-have for any professional wardrobe. Made from breathable, wrinkle-resistant fabric, it keeps you looking sharp from morning meetings to after-work drinks. The tailored fit flatters all body types, while the timeless design pairs effortlessly with suits, skirts, or denim. A true investment piece that delivers year after year.",
      },

      // --- Image 1 Items ---
      {
        type: "Textured Beige Knit Top",
        color: "Beige",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775117034/p11_wtzxtx.png",
        price: 55.0,
        category: "Top",
        searchTerm: ["beige", "knit", "textured", "casual", "warm"],
        userId: FIXED_USER_ID,
        inStock: FIXED_IN_STOCK,
        description:
          "Cozy meets chic in this textured beige knit top. The intricate knit pattern adds visual interest while the soft, warm fabric makes it perfect for cooler days. Layer it over a camisole for work, or pair with high-waisted jeans for weekend errands. The neutral beige tone complements any color palette, making it an easy addition to your everyday rotation.",
      },

      {
        type: "Royal Blue Formal Shirt",
        color: "Blue",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775212583/p8_t9fw6x.png",
        price: 52.0,
        category: "Shirt",
        searchTerm: ["blue", "shirt", "formal", "office", "clean fit"],
        userId: FIXED_USER_ID,
        inStock: FIXED_IN_STOCK,
        description:
          "Elevate your professional look with this royal blue formal shirt. The vibrant yet sophisticated hue adds a pop of color to your workwear while maintaining a polished appearance. Crafted with a clean, modern fit and premium fabric that resists wrinkles, this shirt keeps you confident and comfortable through long days. Perfect for presentations, client meetings, or any occasion where first impressions matter.",
      },
      {
        type: "Teal Green Button Shirt",
        color: "Green",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775212601/p10_loklyn.png",
        price: 50.0,
        category: "Shirt",
        searchTerm: ["green", "shirt", "teal", "modern", "smart casual"],
        userId: FIXED_USER_ID,
        inStock: FIXED_IN_STOCK,
        description:
          "Stand out from the crowd with this modern teal green button shirt. The unique teal hue offers a fresh alternative to traditional blues and whites, while the smart casual design works for both office and weekend wear. Made from soft, breathable fabric with a contemporary fit, this shirt combines style and comfort effortlessly. Pair with chinos for a polished look or denim for relaxed vibes.",
      },
      {
        type: "Light Blue Slim Fit Shirt",
        color: "Light Blue",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775212665/p9_yzjltz.png",
        price: 46.0,
        category: "Shirt",
        searchTerm: ["light blue", "shirt", "slim fit", "office", "casual"],
        userId: FIXED_USER_ID,
        inStock: FIXED_IN_STOCK,
        description:
          "Refresh your wardrobe with this light blue slim fit shirt. The soft, airy hue is perfect for spring and summer, while the tailored slim cut creates a sharp, modern silhouette. Versatile enough for the office or weekend outings, this shirt pairs beautifully with navy trousers, grey slacks, or your favorite jeans. The quality fabric ensures comfort and durability for everyday wear.",
      },
      {
        type: "Dark Classic Dress",
        color: "Dark",
        src: "https://res.cloudinary.com/dtebv8bes/image/upload/v1775117015/p5_qy0t2z.png",
        price: 49.0,
        category: "Shirt",
        searchTerm: ["dark blue", "shirt", "classic", "formal", "clean"],
        userId: FIXED_USER_ID,
        inStock: FIXED_IN_STOCK,
        description:
          "Timeless sophistication meets modern comfort in this dark classic dress shirt. The deep, rich tone exudes professionalism while the clean design ensures versatility across any dress code. Crafted from premium fabric with attention to detail—from reinforced buttons to precise stitching—this shirt is built to last. An essential piece for the discerning professional who values quality and style.",
      },
    ]);

    if (!insertedDocs || insertedDocs.length === 0) {
      return NextResponse.json({
        error: "No products were inserted",
        success: false,
      });
    }

    return NextResponse.json({
      message: `✅ Successfully inserted ${insertedDocs.length} products`,
      success: true,
      count: insertedDocs.length,
    });
  } catch (err: any) {
    console.error("❌ Insert error:", err);
    return NextResponse.json({
      error: err.message || "Unknown error during insertion",
      success: false,
    });
  }
}
