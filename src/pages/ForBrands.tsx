import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandHeroSection from '@/components/BrandHeroSection';
import InitiativePopup from '@/components/InitiativePopup';
import FactCard from '@/components/FactCard';
import AboutSection from '@/components/AboutSection';
import BrandsSection from '@/components/BrandsSection';
import { Link } from 'react-router-dom';
import { Users, Home, Award, Handshake } from 'lucide-react';

const ForBrandsPage = () => {
  const initiatives = [
    {
      title: 'The Collective',
      description: 'A unified fund supporting Hispanic student-athletes across all sports and universities.',
      icon: Users,
      href: '/initiatives/collective',
    },
    {
      title: 'HOLA Houses',
      description: 'On-campus community spaces across U.S. universities specifically designed for Hispanic student-athletes.',
      icon: Home,
      href: '/initiatives/hola-houses',
    },
    {
      title: 'ÑIL Soccer',
      description: 'Targeted support for soccer programs to capitalize on the sport\'s explosive growth in the U.S.',
      icon: Award, // Using Award as a proxy for a soccer ball/trophy
      href: '/initiatives/soccer',
    },
    {
      title: 'Influencer Staffers',
      description: 'Staff camps, clinics, or activations with Hispanic student athletes who can also promote to their followers.',
      icon: Handshake,
      href: '/initiatives/influencer-staffers',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <BrandHeroSection />
        <section className="py-20 bg-gradient-to-br from-nil-light-blue via-nil-orange/40 to-nil-navy/50 bg-gradient-with-image">
          <AboutSection />
        </section>

        <section className="relative py-32 bg-[url('/images/athlete-test-img-23.jpg')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/85 via-nil-navy/50 to-nil-orange/45 z-0"></div>
          <div className="relative z-10 container-custom">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">MARKET MOMENT</h2>
              {/* <p className="text-gray-200 max-w-3xl mx-auto text-lg">
                Discover key insights into the rapidly growing Hispanic market and its connection to sports.
              </p> */}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FactCard
                title="INCREASE IN POPULATION"
                body={<>The U.S. Hispanic population is
                      growing rapidly and is projected
                      to reach over <span className="text-nil-orange font-semibold">71 million by 2026 </span>
                      (~20.5% of total pop).</>}
              />
              <FactCard
                title="HIGH PURCHASING POWER"
                body={<>U.S. Hispanics have a high
                      purchasing power, with an
                      estimated <span className="text-nil-orange font-semibold">spending power of
                      $4 trillion by 2026 </span>(~12% of
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

        <section className="py-20 bg-gradient-to-br from-nil-light-blue via-nil-orange/40 to-nil-navy/50 bg-gradient-with-image">
          <BrandsSection />
        </section>

        <section className="relative py-20 bg-[url('/images/background-img-1.png')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/85 via-nil-navy/50 to-nil-orange/45 z-0"></div>
          <div className="relative z-10 container-custom">
            <div className="text-center pt-0 pb-14 md:pt-8 md:pb-20"> {/* Adjusted padding for better placement within section */} 
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">EXPLORE OUR CURRENT INITIATIVES</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {initiatives.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    to={item.href}
                    key={item.title}
                    className="group bg-white/10 p-6 rounded-lg shadow-lg text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center hover:bg-white/20"
                  >
                    <div className="flex justify-center items-center bg-nil-navy text-white w-16 h-16 rounded-full mb-4 group-hover:bg-nil-orange transition-colors duration-300">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-nil-orange transition-colors duration-300">{item.title}</h3>
                    <p className="text-gray-300 flex-grow">{item.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <InitiativePopup />
    </div>
  );
};

export default ForBrandsPage;
