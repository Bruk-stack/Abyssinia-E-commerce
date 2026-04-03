"use client";
import { Navigation } from "../components/header";
import { Products } from "./components/products";
import { FloatingChatButton } from "../components/chatbot";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div>
      <Navigation />
      <Products />
      <FloatingChatButton onClick={() => router.push("/chatbot")} />
    </div>
  );
}
