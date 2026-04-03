"use client";

export default function HomePage() {
  return (
    <main className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/Gemini_Generated_Image_kr9xw6kr9xw6kr9x.png"
          alt="Shopping lifestyle background"
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight tracking-tight">
          Style Meets Simplicity
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl mx-auto font-medium">
          Curated essentials, premium quality, and fast delivery. Shop what you
          love today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/products"
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-orange-500/30 active:scale-[0.98]"
          >
            Shop Now
          </a>
          <a
            href="/suggestions"
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full backdrop-blur-sm border border-white/30 transition-all"
          >
            Get Suggestions
          </a>
        </div>
      </div>
    </main>
  );
}
