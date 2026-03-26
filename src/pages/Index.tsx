import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AthleteSpotlight from "@/components/AthleteSpotlight";
import HowWeDeliverSection from "@/components/HowWeDeliverSection";
import OurWorkSection from "@/components/OurWorkSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { WelcomePopup } from "@/components/WelcomePopup";
import { useEffect, useState } from "react";

const Index = () => {
  const handleSignUpClick = () => {
    // Trigger the header's auth modal by dispatching a custom event
    window.dispatchEvent(new CustomEvent('openAuthModal'));
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection
          title={<>REACH HISPANIC AUDIENCES AT SCALE <span className="heading-gradient-light">THROUGH TRUSTED COLLEGE STUDENT-ATHLETES.</span></>}
          subtitle="We aggregate 1,100+ Latino and Latina college student-athletes to deliver high-performing content and on-the-ground presence across top U.S. Hispanic markets."
          backgroundImageUrl="/images/athlete-test-img-25.jpg"
          buttons={[
            {
              text: "Brands",
              link: "/for-brands",
              className: "btn-primary"
            },
            {
              text: "Athletes",
              link: "/for-athletes",
              className: "btn-secondary"
            }
          ]}
          className="pb-20"
        >
          <HowItWorksSection />
        </HeroSection>
        <AthleteSpotlight />
        <HowWeDeliverSection />
        <OurWorkSection />
        <ContactSection />
      </main>
      <Footer />
      <WelcomePopup onSignUpClick={handleSignUpClick} />
    </div>
  );
};

export default Index;
