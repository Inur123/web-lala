import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import InfoBar from "@/components/landing/InfoBar";
import WhySection from "@/components/landing/WhySection";
import FlowSection from "@/components/landing/FlowSection";
import RegistrationSection from "@/components/landing/RegistrationSection";
import Footer from "@/components/landing/Footer";
import ScrollToTop from "@/components/ui/scroll-to-top";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <InfoBar />
        <WhySection />
        <FlowSection />
        <RegistrationSection />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
