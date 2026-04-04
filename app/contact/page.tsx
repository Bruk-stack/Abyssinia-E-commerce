"use client";
import { Navigation } from "../components/header";
import { ContactForm } from "./components/form";
import { ContactHeader } from "./components/header";

export default function Page() {
  return (
    <div>
      <Navigation />
      <ContactHeader />
      <ContactForm />
    </div>
  );
}
