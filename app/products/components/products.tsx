"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

interface Product {
  _id: string;
  type: string;
  color: string;
  src: string;
  price: number;
  category: string;
  searchTerm: string[];
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        console.log(data);
        console.log("Fetching products");
        if (!data.success)
          throw new Error(data.error || "Failed to load products");

        if (isMounted) setProducts(data.products || []);
      } catch (err: any) {
        if (isMounted) setError(err.message || "An unexpected error occurred");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    console.log("Started");
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Unable to Load Products
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition active:scale-95"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-6">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading products...</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-800 rounded-xl h-72 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No products available.
        </p>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-10">
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
                className=" h-48 object-cover group-hover:scale-105 transition-transform duration-500"
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
                  style={{ backgroundColor: product.color.toLowerCase() }}
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
