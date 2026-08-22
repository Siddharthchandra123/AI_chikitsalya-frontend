import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/home/hero-section";
import { ServicesGrid } from "@/components/home/services-grid";
import { StatsSection } from "@/components/home/stats-section";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <ServicesGrid />
        <StatsSection />
      </main>
      <Footer />
    </div>
  );
}

