import FeaturesSection from "@/components/organisms/FeaturesSection";
import Footer from "@/components/organisms/Footer";
import HeroSection from "@/components/organisms/HeroSection";
import Navbar from "@/components/organisms/Navbar";
import StatsSection from "@/components/organisms/StatsSection";

export default function LandingTemplate() {
  return (
    <>
      <Navbar />

      <main>
        <HeroSection />

        <StatsSection />

        <FeaturesSection />
      </main>

      <Footer />
    </>
  );
}