import { Navigation } from "../components/header";
import { ProductInfoClient } from "./components/product";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div>
      <Navigation />
      <ProductInfoClient />
    </div>
  );
}
