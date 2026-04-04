"use client";
import { Navigation } from "../components/header";
import { Cards } from "./components/cards";
import { Experience } from "./components/experience";
export default function Page() {
  return (
    <div>
      <Navigation />
      <Cards />
      <Experience />
    </div>
  );
}