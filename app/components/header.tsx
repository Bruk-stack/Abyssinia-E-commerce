"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, ShoppingCart, Menu, MessageSquare } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { MobileNav } from "./mobileNav";

export function Navigation() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") setSearchOpen(false);
      if (e.key === "Enter" && searchOpen) handleSearch();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, term]);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Suggestions", path: "/suggestions" }, // ✅ New Nav Item
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => pathname === path;

  const handleSearch = () => {
    if (term.trim()) {
      router.push(`/search?q=${encodeURIComponent(term.trim())}`);
      setSearchOpen(false);
      setTerm("");
    }
  };

  return (
    <nav className="w-full flex justify-between items-center bg-white dark:bg-black text-gray-900 dark:text-gray-100 shadow-lg sticky top-0 z-50 px-4 md:px-8 py-3 transition-colors duration-200">
      {/* Logo */}
      <Link href="/" className="flex-shrink-0">
        <img
          src="/Gemini_Generated_Image_if68znif68znif68.png"
          alt="Brand Logo"
          className="h-16 w-auto object-contain"
        />
      </Link>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop Navigation */}
      <ul className="hidden md:flex items-center gap-1 lg:gap-2">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                  : "text-gray-700 hover:text-orange-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-orange-400"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setSearchOpen((prev) => !prev)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Toggle search"
        >
          <Search className="h-5 w-5" />
        </button>

        <Link
          href="/cart"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Cart"
        >
          <ShoppingCart className="h-5 w-5" />
        </Link>

        <Link
          href="/chatbot"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Chat support"
        >
          <MessageSquare className="h-5 w-5" />
        </Link>

        <Link
          href="/profile"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="User profile"
        >
          <User className="h-5 w-5" />
        </Link>
      </div>

      {/* Search Dropdown */}
      {searchOpen && (
        <div
          ref={searchRef}
          className="absolute top-full right-4 mt-2 z-50 w-80"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            <div className="flex gap-3 mt-3">
              <button
                onClick={handleSearch}
                className="flex-1 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-md active:scale-[0.98]"
              >
                Search
              </button>
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setTerm("");
                }}
                className="flex-1 py-2 rounded-full font-semibold text-orange-600 border border-orange-500 bg-transparent hover:bg-orange-50 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded font-mono text-[10px]">
                Enter
              </kbd>{" "}
              or{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded font-mono text-[10px]">
                Ctrl + K
              </kbd>
            </p>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {mobileNavOpen && (
        <MobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />
      )}
    </nav>
  );
}
