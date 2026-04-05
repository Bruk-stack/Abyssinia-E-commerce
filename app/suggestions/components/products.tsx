"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";

interface Product {
  _id: string;
  type: string;
  color: string;
  src: string;
  price: number;
  category: string;
  searchTerm: string[];
}

export function SuggestedProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const rawKeywords = localStorage.getItem("key-words");
      let keywords: string[] = [];

      if (rawKeywords) {
        try {
          const parsed = JSON.parse(rawKeywords);
          keywords = Array.isArray(parsed) ? parsed : [String(parsed)];
        } catch {
          keywords = rawKeywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean);
        }
      }

      const res = await fetch("/api/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyWords: keywords }), // Send empty array if none
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const data = await res.json();
      if (!data.success)
        throw new Error(data.error || "Failed to load suggestions");

      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchSuggestions();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-6">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Curating AI suggestions...</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-800 rounded-xl h-72 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Unable to Load Suggestions
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchSuggestions}
            className="px-5 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition active:scale-95"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <Sparkles className="h-12 w-12 text-orange-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Suggestions Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try browsing more products or check back later for new
            recommendations.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-orange-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          AI Suggestions
        </h2>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4 mb-6">
        Suggestions get more personalized as you browse more products ✨
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card
            key={product._id}
            className="group cursor-pointer overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-xl hover:border-orange-500/50 transition-all duration-300"
            onClick={() => router.push(`/product?id=${product._id}`)}
          >
            <div className="relative overflow-hidden">
              <img
                src={product.src}
                alt={product.type}
                loading="lazy"
                className="h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                ${product.price.toFixed(2)}
              </div>
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold truncate text-gray-900 dark:text-gray-100">
                {product.type}
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-0 flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span
                  className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm"
                  style={{
                    backgroundColor: product.color?.toLowerCase() || "#ccc",
                  }}
                />
                {product.color}
              </span>
              <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500">
                {product.category}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
