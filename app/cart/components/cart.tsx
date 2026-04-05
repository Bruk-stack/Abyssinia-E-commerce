"use client";

import { useState, useEffect } from "react";
import { PaymentOverlay } from "@/app/stripe/paymentOverlay";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  type: string;
  color: string;
  src: string;
  price: number;
  category: string;
  searchTerm: string[];
}

export function Cart() {
  const router = useRouter();
  const [paidItemCount, setPaidItemCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadCart = async () => {
      try {
        const stored = localStorage.getItem("cart_items");
        if (!stored) {
          setLoading(false);
          return;
        }

        const ids: string[] = JSON.parse(stored);
        if (ids.length === 0) {
          setLoading(false);
          return;
        }

        const res = await fetch("/api/fetchProducts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        const data = await res.json();
        if (!data.success)
          throw new Error(data.error || "Failed to fetch products");

        if (!isMounted) return;

        setProducts(data.products);

        const initialQuantities: Record<string, number> = {};
        data.products.forEach((p: Product) => {
          initialQuantities[p._id] = 1;
        });
        setQuantities(initialQuantities);
      } catch (err) {
        console.error("❌ Failed to load cart:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCart();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart_items" && isMounted) {
        loadCart();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const getPaymentProducts = () => {
    return products.map((p) => ({
      id: p._id,
      quantity: getQuantity(p._id),
    }));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  useEffect(() => {
    console.log(quantities);
  }, [quantities]);

  const removeItem = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p._id !== productId));
    setQuantities((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const getQuantity = (productId: string) => quantities[productId] || 1;

  const getSubtotal = () => {
    return products.reduce((sum, product) => {
      return sum + product.price * getQuantity(product._id);
    }, 0);
  };

  const handleCheckout = () => {
    if (products.length === 0) {
      setPaymentError("Your cart is empty");
      return;
    }

    setShowPayment(true);
    setPaymentError(null);
  };

  const continueShopping = () => {
    setCheckoutSuccess(false);
    setIsCheckingOut(false);
    router.push("/products");
  };

  if (checkoutSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-bl-full opacity-50" />

          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Thank you for your purchase. Your order has been received and will
              be processed shortly.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Order Total</span>
                <span className="font-semibold text-gray-900">
                  ${paidAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Items</span>
                <span className="font-semibold text-gray-900">
                  {products.length || paidItemCount}
                </span>
              </div>
            </div>

            <button
              onClick={continueShopping}
              className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-teal-500/30 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-xs text-gray-400 mt-4">
              A confirmation email will be sent shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0 && !loading && !isCheckingOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-indigo-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-block p-6 bg-white rounded-3xl shadow-lg mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-bl-full opacity-50" />
            <ShoppingBag className="w-16 h-16 text-teal-600 relative" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Discover amazing products and add them to your cart to get started.
          </p>

          <button
            onClick={() => router.push("/products")}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-teal-500/30 transition-all duration-200"
          >
            Explore Products
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-indigo-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <PaymentOverlay
        isOpen={showPayment}
        onClose={() => {
          setShowPayment(false);
          setIsCheckingOut(false);
        }}
        products={getPaymentProducts()}
        amount={getSubtotal()}
        currency="usd"
        onSuccess={() => {
          const finalTotal = getSubtotal();
          setPaidAmount(finalTotal);
          setPaidItemCount(products.length);

          localStorage.removeItem("cart_items");
          setProducts([]);
          setQuantities({});

          setCheckoutSuccess(true);
          setShowPayment(false);

          setTimeout(() => router.push("/products"), 3000);
        }}
        onError={(error) => {
          setPaymentError(error);
          console.error("Payment error:", error);
        }}
      />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
              Cart
            </span>
          </h1>
          <p className="text-gray-600 text-lg">
            {products.length} item{products.length !== 1 ? "s" : ""} ready for
            checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {products.map((product) => {
              const qty = getQuantity(product._id);

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="sm:w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={product.src}
                        alt={product.type}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate mb-1">
                            {product.type}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {product.category} • {product.color}
                          </p>
                          <p className="text-xl font-bold text-teal-600">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(product._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <span className="text-sm text-gray-600 font-medium">
                          Qty:
                        </span>
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                          <button
                            title="update-quantity"
                            onClick={() => updateQuantity(product._id, -1)}
                            disabled={qty <= 1}
                            className="p-1.5 text-gray-600 hover:text-teal-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-900">
                            {qty}
                          </span>
                          <button
                            title="update-quantity"
                            onClick={() => updateQuantity(product._id, 1)}
                            className="p-1.5 text-gray-600 hover:text-teal-600 rounded-md transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="ml-auto text-sm text-gray-500">
                          Subtotal:{" "}
                          <span className="font-semibold text-gray-900">
                            ${(product.price * qty).toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ${getSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-gray-900">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-semibold text-gray-900">Included</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-teal-600">
                    ${getSubtotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-teal-500/30 disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                or{" "}
                <button
                  onClick={() => router.push("/products")}
                  className="text-teal-600 hover:text-teal-700 font-medium underline underline-offset-2"
                >
                  continue shopping
                </button>
              </p>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Secure
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Free Returns
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    24/7 Support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
