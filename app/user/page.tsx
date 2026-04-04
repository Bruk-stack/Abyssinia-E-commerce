"use client";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    localStorage.setItem("userId", "64f2a9c1e3b8a7d9f4c2b1e8");
  }, []);

  return <div>done</div>;
}
