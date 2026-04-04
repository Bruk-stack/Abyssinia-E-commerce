"use client";
import { Navigation } from "../components/header";
import AccountDashboard from "./components/dashboard";

export default function Page() {
  return (
    <div>
      <Navigation />
      <AccountDashboard />
    </div>
  );
}
