// app/products/add/page.tsx
import ProductForm from "./components/form"; // adjust path
export const dynamic = "force-dynamic";

export default function AddProductPage() {
  return <ProductForm mode="create" />;
}
