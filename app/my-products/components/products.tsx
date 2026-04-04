// app/my-products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";

// ✅ Types (adjust to match your Product model)
interface Product {
  _id: string;
  type: string;
  color: string;
  src: string;
  price: number;
  category: string;
  searchTerm: string[];
  userId: string;
  createdAt?: string;
}

export default function MyProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setError("User not found. Please log in.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/myproducts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch products");
        }

        console.log(data);

        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (err: any) {
        console.error("❌ Fetch error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, []); // ✅ No deps needed - userId comes from localStorage inside effect

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading your products...
          </p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center shadow-sm border border-gray-200 dark:border-gray-800">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Oops!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/account")}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium rounded-lg transition"
            >
              Back to Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Products
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your listed items
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/account")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Account</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Empty State */}
        {products.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center shadow-sm border border-gray-200 dark:border-gray-800">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No products yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start adding your products to see them here.
            </p>
            <button
              onClick={() => router.push("/products/add")} // ← Update with your add route
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition"
            >
              <Plus className="w-4 h-4" />
              Add Your First Product
            </button>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {products.length}
                </span>{" "}
                product{products.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => router.push("/products/add")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800 transition"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <img
                      src={product.src}
                      alt={product.type}
                      className="h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Category Badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 rounded-full backdrop-blur-sm">
                      {product.category}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
                      {product.type}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {product.color}
                    </p>

                    {/* Price & Actions */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        ${product.price.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          title="Edit"
                          // onClick={() => router.push(`/products/edit/${product._id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          title="Delete"
                          // onClick={() => handleDelete(product._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
