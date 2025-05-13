
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import BrandsSection from "@/components/BrandsSection";
import AthleteSpotlight from "@/components/AthleteSpotlight";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <HowItWorksSection />
        <BrandsSection />
        <AthleteSpotlight />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
