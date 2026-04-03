"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Loader2,
  AlertCircle,
  ShoppingCart,
  ArrowLeft,
  Heart,
} from "lucide-react";
import Link from "next/link";

// Handle MongoDB Extended JSON format for _id
interface MongoDBObjectId {
  $oid: string;
}

interface Product {
  _id: string | MongoDBObjectId;
  type: string;
  color: string;
  src: string;
  price: number;
  category: string;
  searchTerm: string[];
}

// Helper to normalize _id to string
const getProductId = (id: string | MongoDBObjectId): string => {
  return typeof id === "string" ? id : id.$oid;
};

export function ProductInfo() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const productId = searchParams.get("id");
    if (!productId) {
      setError("No product ID provided");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        const data = await res.json();
        console.log(data);
        if (!data.success)
          throw new Error(data.error || "Failed to load product");

        if (isMounted) {
          setProduct(data.product);
          setImageLoaded(false); // Reset image load state for new product
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "An unexpected error occurred");
          console.error("Product fetch error:", err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [searchParams]); // ✅ Fixed: added dependency

  const handleAddToCart = () => {
    if (!product) return;
    // TODO: Integrate with your cart state/context
    console.log("Added to cart:", getProductId(product._id));
    // Example: dispatch({ type: 'ADD_TO_CART', payload: product })
  };

  const handleBack = () => router.back();

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-3 text-gray-500 mb-8">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">Loading product details...</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Image Skeleton */}
          <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-96 animate-pulse" />
          {/* Content Skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 animate-pulse" />
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse" />
            <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-md mx-auto border-red-200 dark:border-red-900/50">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
              {error || "Product Not Found"}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {error ||
                "The product you're looking for doesn't exist or has been removed."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center gap-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
            <Link
              href="/products"
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition"
            >
              Browse Products
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const productId = getProductId(product._id);
  const colorValue = product.color.toLowerCase().trim();

  return (
    <section className="container mx-auto px-4 py-8 lg:py-12">
      {/* Breadcrumb / Back */}
      <button
        onClick={handleBack}
        className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 transition group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
        {/* Product Image */}
        <div className="relative group">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {/* Loading overlay */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            )}

            <img
              src={product.src}
              alt={product.type}
              className={` h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />

            {/* Category Badge */}
            <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-semibold text-white bg-black/60 backdrop-blur-sm rounded-full">
              {product.category}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <Card className="border-0 shadow-none lg:shadow-lg lg:border lg:border-gray-200 lg:dark:border-gray-800 lg:rounded-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {product.type}
                </CardTitle>
                <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                  Category: {product.category}
                </CardDescription>
              </div>
              <button
                aria-label="Add to wishlist"
                className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl lg:text-4xl font-extrabold text-orange-600">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ${(product.price * 1.3).toFixed(2)}
              </span>
              <span className="px-2 py-1 text-xs font-bold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                Save 30%
              </span>
            </div>

            {/* Color */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Color:
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                  style={{ backgroundColor: colorValue }}
                  aria-label={`Color: ${product.color}`}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.color}
                </span>
              </div>
            </div>

            {/* Description placeholder */}
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
              <p>
                Premium quality {product.type.toLowerCase()} crafted with
                attention to detail. Perfect for{" "}
                {product.searchTerm.slice(0, 3).join(", ")}. Comfortable fit
                with durable materials.
              </p>
            </div>

            {/* Search Tags (for SEO/internal use) */}
            <div className="flex flex-wrap gap-2">
              {product.searchTerm.slice(0, 5).map((tag: string) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-default"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all active:scale-[0.98]"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>
            <button className="flex-1 sm:flex-none px-6 py-3.5 text-base font-semibold text-orange-600 border-2 border-orange-500 bg-transparent hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition">
              Buy Now
            </button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
