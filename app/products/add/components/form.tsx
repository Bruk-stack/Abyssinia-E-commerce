// app/products/form/page.tsx (or use as component)
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Tag,
  X,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

// ✅ Types matching your Product schema
export interface ProductFormData {
  type: string;
  color: string;
  src: string;
  price: number | string;
  category: string;
  searchTerm: string[];
  inStock: number | string;
  description: string;
  userId?: string; // Auto-filled from localStorage
}

interface ProductFormProps {
  mode?: "create" | "edit";
  initialData?: ProductFormData & { _id?: string };
  onSuccess?: () => void;
}

export default function ProductForm({
  mode = "create",
  initialData,
  onSuccess,
}: ProductFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<ProductFormData>({
    type: "",
    color: "",
    src: "",
    price: "",
    category: "",
    searchTerm: [],
    inStock: 50,
    description: "",
  });
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const tagInputRef = useRef<HTMLInputElement>(null);
  // Add these to your existing state declarations
  const [recommendation, setRecommendation] = useState<string>("");
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  // ✅ Add this with your other state
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [recommendationError, setRecommendationError] = useState<string | null>(
    null,
  );

  // ✅ Add these with your other state declarations
  const [recommendationDes, setRecommendationDes] = useState<string>("");
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [recommendationDesLoading, setRecommendationDesLoading] =
    useState(false);
  const [recommendationDesError, setRecommendationDesError] = useState<
    string | null
  >(null);

  // ✅ Load initial data for edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        type: initialData.type || "",
        color: initialData.color || "",
        src: initialData.src || "",
        price: initialData.price || "",
        category: initialData.category || "",
        searchTerm: initialData.searchTerm || [],
        inStock: initialData.inStock || 50,
        description: initialData.description || "",
        userId: initialData.userId,
      });
      setImagePreview(initialData.src || "");
    }
  }, [mode, initialData]);

  // ✅ Auto-fill userId from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("userId");
      if (userId) {
        setForm((prev) => ({ ...prev, userId }));
      }
    }
  }, []);

  //for description

  // ✅ Debounced AI recommendation effect
  useEffect(() => {
    // Only trigger when all 3 required fields have values
    if (!form.category || !form.type || !form.color) {
      setRecommendation("");
      setSuggestedTags([]);
      return;
    }

    // ✅ Debounce: wait 800ms after user stops typing
    const timeoutId = setTimeout(async () => {
      const controller = new AbortController();
      setRecommendationDesLoading(true);
      setRecommendationDesError(null);

      try {
        const res = await fetch("/api/recommend-description", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: form.category,
            type: form.type,
            color: form.color,
          }),
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to get recommendations");
        }

        if (data.success) {
          setRecommendationDes(data.suggestedDescription || "");
          setSuggestedTags(data.suggestedTags || []);
        }
      } catch (err: any) {
        // Ignore abort errors (user typed again)
        if (err.name !== "AbortError") {
          console.error("❌ Recommendation error:", err);
          setRecommendationDesError(
            err.message || "Could not load suggestions",
          );
          setRecommendationDes("");
          setSuggestedTags([]);
        }
      } finally {
        setRecommendationDesLoading(false);
      }

      // Cleanup: abort if deps change
      return () => controller.abort();
    }, 800); // Adjust debounce delay as needed

    // Cleanup: clear timeout if user types again
    return () => clearTimeout(timeoutId);
  }, [form.category, form.type, form.color]);

  // ✅ Handle text/number inputs
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "inStock"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
    setError(null);
    setSuccess(null);
  };

  // ✅ Handle tag (searchTerm) input
  const handleAddTag = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e?.key === "Enter" || e === undefined) {
      e?.preventDefault();
      const tag = newTag.trim().toLowerCase();
      if (tag && !form.searchTerm.includes(tag)) {
        setForm((prev) => ({
          ...prev,
          searchTerm: [...prev.searchTerm, tag],
        }));
        setNewTag("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      searchTerm: prev.searchTerm.filter((tag) => tag !== tagToRemove),
    }));
  };

  // ✅ Handle image URL preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, src: value }));
    setImagePreview(value);
  };

  // ✅ Validate form
  const validate = (): string | null => {
    if (!form.type.trim()) return "Product name is required";
    if (!form.color.trim()) return "Color is required";
    if (!form.src.trim()) return "Image URL is required";
    if (!form.price || Number(form.price) <= 0)
      return "Valid price is required";
    if (!form.category.trim()) return "Category is required";
    if (!form.inStock || Number(form.inStock) < 0)
      return "Valid stock quantity is required";
    if (!form.userId) return "User not authenticated";
    return null;
  };

  useEffect(() => {
    if (!form.category || !form.price || !form.type || !form.color) {
      setRecommendation("");
      setSuggestedPrice(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const controller = new AbortController();
      setRecommendationLoading(true);
      setRecommendationError(null);

      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: form.category,
            price: Number(form.price),
            type: form.type,
            color: form.color,
          }),
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to get recommendations");
        }

        if (data.success) {
          setRecommendation(data.recommendation || "");
          setSuggestedPrice(data.suggestedPrice ?? null); // ✅ Capture the raw number
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("❌ Recommendation error:", err);
          setRecommendationError(err.message || "Could not load suggestions");
          setRecommendation("");
          setSuggestedPrice(null);
        }
      } finally {
        setRecommendationLoading(false);
      }

      return () => controller.abort();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [form.category, form.price, form.type, form.color]);

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      // ✅ Prepare payload (ensure numbers are numbers)
      const payload = {
        ...form,
        price: Number(form.price),
        inStock: Number(form.inStock),
        searchTerm: form.searchTerm.map((t) => t.toLowerCase().trim()),
      };

      const endpoint =
        mode === "edit" && initialData?._id
          ? `/api/products/${initialData._id}`
          : "/api/add-product";

      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${mode} product`);
      }

      setSuccess(
        `✅ Product ${mode === "edit" ? "updated" : "created"} successfully!`,
      );

      // ✅ Reset form for create mode
      if (mode === "create") {
        setForm({
          type: "",
          color: "",
          src: "",
          price: "",
          category: "",
          searchTerm: [],
          inStock: 50,
          description: "",
          userId: form.userId,
        });
        setImagePreview("");
      }

      // ✅ Callback + redirect
      onSuccess?.();
      if (mode === "create") {
        setTimeout(() => router.push("/my-products"), 1500);
      }
    } catch (err: any) {
      console.error("❌ Submit error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Categories for dropdown
  const categories = [
    "Dress",
    "Shirt",
    "Top",
    "Pants",
    "Shoes",
    "Accessories",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                {mode === "edit" ? "Edit Product" : "Add New Product"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {mode === "edit"
                  ? "Update your product details"
                  : "Fill in the details below"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 dark:text-green-300 text-sm">
              {success}
            </p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-6"
        >
          {/* Product Name & Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Name *
              </label>
              <input
                name="type"
                type="text"
                value={form.type}
                onChange={handleChange}
                placeholder="e.g., Soft Fabric Casual Dress"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900 dark:text-white placeholder-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                title="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900 dark:text-white"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color & Price Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color *
              </label>
              <input
                name="color"
                type="text"
                value={form.color}
                onChange={handleChange}
                placeholder="e.g., Beige, Black, Navy"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900 dark:text-white placeholder-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price ($) *
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900 dark:text-white placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* ✅ AI Pricing Recommendation Section */}
          {form.category && form.price && form.type && form.color && (
            <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">
                    💡 Pricing Suggestion
                  </p>

                  {recommendationLoading ? (
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing market prices...
                    </div>
                  ) : recommendationError ? (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {recommendationError}
                    </p>
                  ) : recommendation ? (
                    <>
                      {/* Display the text recommendation */}
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {recommendation}
                      </p>

                      {/* ✅ Show "Use suggested price" button ONLY if we have a numeric value */}
                      {suggestedPrice !== null && (
                        <button
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              price: suggestedPrice,
                            }));
                          }}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/60 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Use suggested price: ${suggestedPrice.toFixed(2)}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enter product details to get AI-powered pricing
                      suggestions...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              In Stock *
            </label>
            <input
              name="inStock"
              type="number"
              min="0"
              value={form.inStock}
              onChange={handleChange}
              placeholder="50"
              className="w-full max-w-xs px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900 dark:text-white placeholder-gray-400"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Number of items available for purchase
            </p>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image URL *
            </label>
            <div className="flex gap-3">
              <input
                name="src"
                type="url"
                value={form.src}
                onChange={handleImageChange}
                placeholder="https://..."
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900 dark:text-white placeholder-gray-400"
                required
              />
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("");
                    setForm((prev) => ({ ...prev, src: "" }));
                  }}
                  className="px-3 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
                  title="Clear image"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Preview:
                </p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 w-auto rounded-lg object-contain bg-white dark:bg-gray-900"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";
                  }}
                />
              </div>
            )}
          </div>

          {/* Search Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.searchTerm.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-sm rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    title="remove-tag"
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-orange-600 dark:hover:text-orange-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                ref={tagInputRef}
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type & press Enter to add tag"
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900 dark:text-white placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => handleAddTag()}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Add keywords to help customers find this product (e.g., "elegant",
              "party", "summer")
            </p>
          </div>

          {/* ✅ AI Recommendation Section */}
          {form.category && form.type && form.color && (
            <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">
                    💡 AI Suggestions
                  </p>

                  {recommendationLoading ? (
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating suggestions...
                    </div>
                  ) : recommendationError ? (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {recommendationDesError}
                    </p>
                  ) : recommendationDes ? (
                    <>
                      {/* Display the suggested description */}
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                        {recommendationDes}
                      </p>

                      {/* ✅ Button: Use this description (ONLY fills description field) */}
                      <button
                        type="button"
                        onClick={() => {
                          if (recommendationDes) {
                            setForm((prev) => ({
                              ...prev,
                              description: recommendationDes,
                            }));
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/60 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Use this description
                      </button>

                      {/* ✅ Optional: Show suggested tags as clickable chips */}
                      {suggestedTags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 mr-1">
                            Suggested tags:
                          </span>
                          {suggestedTags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                if (!form.searchTerm.includes(tag)) {
                                  setForm((prev) => ({
                                    ...prev,
                                    searchTerm: [...prev.searchTerm, tag],
                                  }));
                                }
                              }}
                              disabled={form.searchTerm.includes(tag)}
                              className={`px-2 py-0.5 text-[10px] rounded-full transition ${
                                form.searchTerm.includes(tag)
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 cursor-default"
                                  : "bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-orange-900/40"
                              }`}
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enter product details to get AI-powered suggestions...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* ✅ Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your product: materials, fit, styling tips, care instructions..."
              maxLength={1000}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900 dark:text-white placeholder-gray-400 resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Help customers understand what makes this product special
              </p>
              <span
                className={`text-xs ${form.description.length > 900 ? "text-orange-600" : "text-gray-400"}`}
              >
                {form.description.length}/1000
              </span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium rounded-xl transition disabled:opacity-50"
            >
              Cancel
            </button>
            {mode === "edit" && (
              <button
                type="button"
                onClick={async () => {
                  if (!initialData?._id) return;
                  if (!confirm("Delete this product? This cannot be undone."))
                    return;

                  setLoading(true);
                  try {
                    const res = await fetch(
                      `/api/products/${initialData._id}`,
                      { method: "DELETE" },
                    );
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    router.push("/my-products");
                  } catch (err: any) {
                    setError(err.message || "Failed to delete");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="px-6 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium rounded-xl transition flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium rounded-xl transition flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading
                ? "Saving..."
                : mode === "edit"
                  ? "Update Product"
                  : "Add Product"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
