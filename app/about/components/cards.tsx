"use client";

import { Truck, Gift, Award } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Express Delivery",
    desc: "Lightning-fast, tracked shipping that gets your order to your door on time, every time.",
  },
  {
    icon: Gift,
    title: "Free Shipping",
    desc: "Complimentary delivery on orders over $50. Transparent pricing, zero hidden fees.",
  },
  {
    icon: Award,
    title: "Premium Quality",
    desc: "Thoughtfully crafted materials and rigorous quality checks for lasting style and comfort.",
  },
];

export function Cards() {
  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12 tracking-tight">
          Why Shop With Us
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-orange-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
