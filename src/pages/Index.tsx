
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AthleteSpotlight from "@/components/AthleteSpotlight";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection 
          title={<>WE EMPOWER <span className="heading-gradient-light">HISPANIC STUDENT-ATHLETES.</span></>}
          subtitle="Unlocking opportunities for the next generation of leaders, on and off the field."
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
          className="pb-96"
        />
        <HowItWorksSection />
        <AthleteSpotlight />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
