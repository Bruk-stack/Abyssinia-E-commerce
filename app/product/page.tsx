"use client";
import { Navigation } from "../components/header";
import { ProductInfo } from "./components/product";

export default function Page() {
  return (
    <div>
      <Navigation />
      <ProductInfo />
    </div>
  );
}
