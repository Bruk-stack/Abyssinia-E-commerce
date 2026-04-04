"use client";

import { MessageCircle, Mail, Zap, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const contactChannels = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    desc: "Instant answers from our styling experts, available around the clock.",
    route: "/chatbot",
    accent: "from-green-500 to-emerald-600",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
    actionText: "Start Chatting", // ✅ Enhanced: More inviting & action-oriented
    actionHint: "24/7 instant support", // ✅ New: Micro-copy for context
  },
  {
    icon: Mail,
    title: "Priority Email",
    desc: "Detailed support for orders, returns, and custom requests.",
    route: "/contact",
    accent: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    actionText: "Write to Us", // ✅ Enhanced: More personal than "Email us"
    actionHint: "Reply within 24h",
  },
  {
    icon: Zap,
    title: "Express Response",
    desc: "We guarantee a reply within 2 hours during business hours.",
    route: "/contact#faq",
    accent: "from-purple-500 to-violet-600",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
    actionText: "Browse FAQs", // ✅ Enhanced: Clear benefit, not just "FAQ"
    actionHint: "Instant answers",
  },
];

export function ContactHeader() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-gray-50 dark:bg-gray-950 py-20 px-4 sm:px-6 lg:px-8">
      {/* Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-400/15 dark:bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Hero Text */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
            CUSTOMER CARE
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
            We're Here to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              Help You Shine
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Whether you need styling advice, order updates, or return
            assistance, our dedicated team delivers seamless support tailored to
            your experience.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactChannels.map((channel, idx) => (
            <div
              key={idx}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-orange-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Corner Accent */}
              <div
                className={`absolute top-0 right-0 w-32 h-32 ${channel.bg} rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity`}
              />

              {/* Icon */}
              <div
                className={`relative w-12 h-12 rounded-xl ${channel.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <channel.icon className={`w-6 h-6 ${channel.text}`} />
              </div>

              {/* Content */}
              <h3 className="relative text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {channel.title}
              </h3>
              <p className="relative text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                {channel.desc}
              </p>

              {/* CTA */}
              <button
                onClick={() => router.push(channel.route)}
                className={`relative flex items-center gap-2 text-sm font-semibold ${channel.text} hover:gap-3 transition-all`}
              >
                {channel.actionText ? channel.actionText : "Get Started"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
