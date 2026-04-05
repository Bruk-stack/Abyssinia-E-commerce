"use client";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    const userData = {
      userId: "64f2a9c1e3b8a7d9f4c2b1e8",
      name: "Abel Mitiku",
      phone: "251920202020",
      email: "abelmitiku461@gmail.com",
      location: "Bahir Dar, Near Benmas",
    };

    localStorage.setItem("user", JSON.stringify(userData));

    console.log("✅ User saved:", userData);
  }, []);

  return <div className="p-4 text-green-600">✅ Demo user set!</div>;
}
