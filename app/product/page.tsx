// app/product/page.tsx
"use client";
import { Navigation } from "../components/header";
import { ProductInfo } from "./components/product";

// ✅ FORCE DYNAMIC RENDERING - Required for useSearchParams
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <div>
      <Navigation />
      <ProductInfo />
    </div>
  );
}
