import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandHeroSection from '@/components/BrandHeroSection';
import BrandWelcomePopup from '@/components/BrandWelcomePopup';
import FactCard from '@/components/FactCard';
import AboutSection from '@/components/AboutSection';
import BrandsSection from '@/components/BrandsSection';

const ForBrandsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <BrandHeroSection />
        <section className="py-20 bg-gradient-to-br from-nil-light-blue via-nil-orange/20 to-nil-navy/30">
          <AboutSection />
        </section>

        <section className="relative py-32 bg-[url('/images/athlete-test-img-16.png')] bg-cover bg-center bg-no-repeat bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/85 via-nil-navy/50 to-nil-orange/45 z-0"></div>
          <div className="relative z-10 container-custom">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">THE FACTS</h2>
              {/* <p className="text-gray-200 max-w-3xl mx-auto text-lg">
                Discover key insights into the rapidly growing Hispanic market and its connection to sports.
              </p> */}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FactCard 
                title="INCREASE IN POPULATION" 
                body={<>The U.S. Hispanic population is 
                      growing rapidly and is projected 
                      to reach over <span className="text-nil-orange font-semibold">71 million by 2025 </span> 
                      (~20.5% of total pop).</>} 
              />
              <FactCard 
                title="HIGH PURCHASING POWER" 
                body={<>U.S. Hispanics have a high 
                      purchasing power, with an 
                      estimated <span className="text-nil-orange font-semibold">spending power of
                      $2.6 trillion in 2025 </span>(~12% of 
                      all US buying power).</>}
              />
              <FactCard 
                title="YOUNGER DEMOGRAPHIC" 
                body={<><span className="text-nil-orange font-semibold">32.5%</span> of multiracial Latino 
                  population is <span className="text-nil-orange font-semibold">&lt;18 years old</span> (compared to 22% of 
                  general population).</>}
              />
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-nil-light-blue via-nil-orange/20 to-nil-navy/30">
          <BrandsSection />
        </section>

        <section className="relative py-20 bg-[url('/images/athlete-test-img-1.png')] bg-cover bg-center bg-no-repeat bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/85 via-nil-navy/50 to-nil-orange/45 z-0"></div>
          <div className="relative z-10 container-custom">
            <div className="text-center pt-0 pb-14 md:pt-8 md:pb-20"> {/* Adjusted padding for better placement within section */} 
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">CURRENT INITIATIVES</h2>
              {/* <p className="text-gray-200 max-w-3xl mx-auto text-lg">
                Explore the impactful projects and programs we are currently spearheading.
              </p> */}
            </div>
            {/* Content related to initiatives can be added here */}
          </div>
        </section>
      </main>
      <Footer />
      <BrandWelcomePopup />
    </div>
  );
};

export default ForBrandsPage;
