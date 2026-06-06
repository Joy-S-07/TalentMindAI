"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FeaturesSection } from "@/components/features-section";

export default function FeaturesPage() {
  return (
    <main className="bg-[#030303] min-h-screen pt-16 flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-grow flex flex-col">
        {/* We reuse the beautiful FeaturesSection component from the homepage */}
        <div className="py-12 md:py-24">
            <FeaturesSection />
        </div>
      </div>

      <Footer />
    </main>
  );
}
