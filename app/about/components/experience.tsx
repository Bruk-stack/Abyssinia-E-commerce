"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function Experience() {
  const router = useRouter();

  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          Find Your Signature Look
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
          Browse handpicked styles, enjoy fast delivery, and shop with
          confidence. Your next favorite piece is just a click away.
        </p>

        <button
          onClick={() => router.push("/products")}
          className="group inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-full shadow-md hover:shadow-orange-500/30 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-orange-500/30"
        >
          Explore Collection
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </section>
  );
}
