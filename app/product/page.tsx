// app/product/page.tsx
"use client";
import { Navigation } from "../components/header";
import { ProductInfoClient } from "./components/product";

// ✅ Keep this - forces dynamic rendering for useSearchParams
export const dynamic = "force-dynamic";

// ❌ REMOVE THIS LINE:
// export const revalidate = 0;

export default function Page() {
  return (
    <div>
      <Navigation />
      <ProductInfoClient />
    </div>
  );
}
