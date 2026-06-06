import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PricingPage() {
  return (
    <main className="bg-[#030303] min-h-screen pt-16 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-32">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Pricing</h1>
          <p className="text-white/60 text-lg">Pricing information is coming soon.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
