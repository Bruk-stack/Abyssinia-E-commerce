"use client";
import { useState, useEffect } from "react";

export default function Page() {
  useEffect(() => {
    const fetchApp = async () => {
      const res = await fetch("/api/fetch", {
        method: "GET",
      });

      const data = await res.json();
      console.log("Request sent");
      if (!data.success) {
        console.log(data.error);
      }
      console.log(data.message);
    };
    fetchApp();
  }, []);

  return (
    <div>
      <p>Loading</p>
    </div>
  );
}
