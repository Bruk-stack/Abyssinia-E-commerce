// app/account/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes } from "lucide-react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  CreditCard,
  Settings,
  LogOut,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ✅ Demo user helper (reusable across app)
const DemoUser = {
  KEY_ID: "userId",
  KEY_PROFILE: "user",

  setup: (profile?: any) => {
    if (typeof window === "undefined") return null;

    const defaultProfile = {
      userId: `guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      firstName: "Guest",
      lastName: "User",
      email: "guest@example.com",
      phone: "",
      streetAddress: "",
    };

    const userData = profile || defaultProfile;
    localStorage.setItem(DemoUser.KEY_ID, userData.userId);
    localStorage.setItem(DemoUser.KEY_PROFILE, JSON.stringify(userData));
    return userData;
  },

  get: () => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(DemoUser.KEY_PROFILE);
    return raw ? JSON.parse(raw) : null;
  },

  getUserId: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(DemoUser.KEY_ID);
  },

  clear: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(DemoUser.KEY_ID);
    localStorage.removeItem(DemoUser.KEY_PROFILE);
  },
};

// ✅ Interfaces
interface UserProfile {
  userId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  city?: string;
  country?: string;
}

interface OrderItem {
  productId: string;
  type: string;
  price: number;
  quantity: number;
  subTotal: number;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  currency?: string;
}

type Tab = "overview" | "profile" | "orders" | "payment";

export default function AccountDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [userId, setUserId] = useState<string>("");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ✅ Get userId and profile from localStorage (no auth)
  useEffect(() => {
    // Try to get existing demo user
    const existingUser = DemoUser.get();
    const existingId = DemoUser.getUserId();

    if (existingId && existingUser) {
      // ✅ User exists → use it
      setUserId(existingId);
      setUser(existingUser);
    } else {
      // ✅ No user → create guest demo user
      const guest = DemoUser.setup();
      if (guest) {
        setUserId(guest.userId);
        setUser(guest);
      }
    }
    setLoading(false);
  }, []);

  // ✅ Fetch orders from backend (userId is now guaranteed)
  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }), // ✅ Send userId from localStorage
        });
        const data = await res.json();
        console.log(data);

        // Inside your fetchOrders useEffect:
        if (res.ok && data.success) {
          const rawItems = data.result?.result || [];

          // ✅ Transform flat items → grouped orders (basic example)
          const transformedOrders: Order[] = rawItems.map(
            (item: any, index: number) => ({
              _id: item.productId || `temp_${index}`,
              orderNumber: `ORD-${Date.now().toString(36).slice(-6).toUpperCase()}`,
              items: [
                {
                  productId: item.productId,
                  type: item.type,
                  price: item.price,
                  quantity: item.items || 1, // ← "items" in response is actually quantity
                  subTotal: item.subTotal,
                  image: item.image,
                },
              ],
              total: item.subTotal || item.price * (item.items || 1),
              status: "delivered", // ← default since backend doesn't send it
              createdAt: new Date().toISOString(), // ← default since backend doesn't send it
            }),
          );

          setOrders(transformedOrders);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        // Don't set error here — orders can be empty legitimately
      }
    };

    fetchOrders();
  }, [userId]);

  // ✅ Simple logout (clear localStorage)
  const handleLogout = () => {
    if (window.confirm("Log out and clear your session?")) {
      DemoUser.clear();
      localStorage.removeItem("cart_items");
      router.push("/");
    }
  };

  // ✅ Update profile (demo only - no backend)
  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    // Demo: simulate API call + update localStorage
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Get form values (simplified for demo)
    const form = e.currentTarget;
    const updatedProfile = {
      ...user,
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement)
        .value,
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      streetAddress: (form.elements.namedItem("address") as HTMLTextAreaElement)
        .value,
    };

    // Save to localStorage for demo persistence
    localStorage.setItem(DemoUser.KEY_PROFILE, JSON.stringify(updatedProfile));
    // setUser(updatedProfile);

    setSaving(false);
    alert("✅ Profile updated! (Demo mode)");
  };

  // ✅ Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ✅ Status badge colors
  const getStatusStyles = (status: Order["status"]) => {
    const styles: Record<Order["status"], string> = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      processing:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      shipped:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      delivered:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return styles[status] || styles.pending;
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading your account...
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
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition"
          >
            Try Again
          </button>
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
                  My Account
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your profile and orders
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sticky top-24 shadow-sm border border-gray-200 dark:border-gray-800">
              {/* User Summary */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                  <User className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {user?.name || "Guest User"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || "No email"}
                  </p>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="space-y-1">
                {/* In-dashboard tabs */}
                {[
                  { id: "overview", label: "Overview", icon: User },
                  { id: "orders", label: "Order History", icon: Package },
                  { id: "payment", label: "Payment Methods", icon: CreditCard },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === tab.id
                        ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <tab.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                ))}

                {/* External link - separate from tabs */}
                <button
                  onClick={() => router.push("/my-products")} // ✅ Absolute path + hyphenated
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <Boxes className="w-5 h-5 flex-shrink-0" />
                  <span>My Products</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* ✅ Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Personal Info Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Personal Information
                    </h2>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
                    >
                      Edit →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        icon: User,
                        label: "Full Name",
                        value: `${user?.name || ""}`.trim() || "Not set",
                      },
                      {
                        icon: Mail,
                        label: "Email",
                        value: user?.email || "Not set",
                      },
                      {
                        icon: Phone,
                        label: "Phone",
                        value: user?.phone || "Not set",
                      },
                      {
                        icon: MapPin,
                        label: "Address",
                        value: user?.location || "Not set",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                      >
                        <item.icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.label}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Orders Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Recent Orders
                    </h2>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
                    >
                      View All →
                    </button>
                  </div>

                  {orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div
                          key={order._id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition cursor-pointer"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              #{order.orderNumber}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(order.createdAt)} •{" "}
                              {order.items.length} item
                              {order.items.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">
                              ${order?.total?.toFixed(2)}
                            </p>
                            <span
                              className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${getStatusStyles(order.status)}`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        No orders yet
                      </p>
                      <button
                        onClick={() => router.push("/products")}
                        className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition"
                      >
                        Start Shopping
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ✅ Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Order History
                  </h2>
                  <button
                    onClick={() => setActiveTab("overview")}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                </div>

                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-800"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              Order #{order.orderNumber}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusStyles(order.status)}`}
                            >
                              {order.status.toUpperCase()}
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {order.items.length} item
                            {order.items.length !== 1 ? "s" : ""}
                          </p>
                          <div className="space-y-2">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 text-sm"
                              >
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.type}
                                    className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 dark:text-white truncate">
                                    {item.type}
                                  </p>
                                  <p className="text-gray-500 dark:text-gray-400">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  ${item.subTotal.toFixed(2)}
                                </p>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                +{order.items.length - 2} more items
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center shadow-sm border border-gray-200 dark:border-gray-800">
                    <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No orders yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Start shopping to see your order history here.
                    </p>
                    <button
                      onClick={() => router.push("/products")}
                      className="px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition"
                    >
                      Browse Products
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ✅ Payment Tab (Placeholder for Demo) */}
            {activeTab === "payment" && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Payment Methods
                  </h2>
                  <button className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition">
                    Add Card
                  </button>
                </div>

                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No payment methods saved
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                    Add a card to make checkout faster. Your payment info is
                    securely handled by Stripe.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                      Visa
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                      Mastercard
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                      Amex
                    </span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
