"use client";

import dynamic from "next/dynamic";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

const PharmacyContent = dynamic(
  () => import("@/components/pharmacy/pharmacy-content"),
  { ssr: false }
);

export default function PharmacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PharmacyContent />
      <Footer />
    </div>
  );
}

