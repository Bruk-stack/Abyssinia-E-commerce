"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Sparkles, Search } from "lucide-react";

interface Product {
  _id: string;
  type: string;
  color: string;
  src: string;
  price: number;
  category: string;
  searchTerm: string[];
}

const SearchHistory = {
  add: (term: string) => {
    if (typeof window === "undefined" || !term?.trim()) return;

    try {
      const raw = localStorage.getItem("key-words");
      let history: string[] = raw ? JSON.parse(raw) : [];

      history = [
        term.trim(),
        ...history.filter((t: string) => t !== term.trim()),
      ].slice(0, 20);
      localStorage.setItem("key-words", JSON.stringify(history));
    } catch {
      localStorage.setItem("key-words", JSON.stringify([term.trim()]));
    }
  },
  get: (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("key-words");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
};

export function SearchResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchResults = useCallback(async (term: string) => {
    if (!term?.trim()) {
      setError("Please enter a search term");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      SearchHistory.add(term);

      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: term.trim() }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const data = await res.json();
      console.log(data);
      if (!data.success) throw new Error(data.error || "Search failed");

      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message || "Failed to load results");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const term = searchParams.get("q");

    if (!term) {
      setError("No search term provided");
      setLoading(false);
      return;
    }

    setSearchTerm(term);

    const runFetch = async () => {
      try {
        await fetchResults(term);
      } finally {
        if (!isMounted) return;
      }
    };

    runFetch();
    return () => {
      isMounted = false;
    };
  }, [searchParams, fetchResults]);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-6">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Searching for "{searchTerm}"...</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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
            Search Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => fetchResults(searchTerm)}
              className="px-5 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition active:scale-95"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/products")}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Browse All
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <Search className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Results Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't find anything matching "
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {searchTerm}
            </span>
            ". Try different keywords or browse our collections.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="px-5 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition active:scale-95"
          >
            View All Products
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Results for "{searchTerm}"
          </h2>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {products.length} {products.length === 1 ? "item" : "items"} found
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card
            key={product._id}
            className="group cursor-pointer overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-xl hover:border-orange-500/50 transition-all duration-300"
            onClick={() => router.push(`/product?id=${product._id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(`/product?id=${product._id}`);
              }
            }}
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
                  className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm flex-shrink-0"
                  style={{
                    backgroundColor: product.color?.toLowerCase() || "#ccc",
                  }}
                  aria-label={`Color: ${product.color}`}
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
