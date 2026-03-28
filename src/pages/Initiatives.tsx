import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import { Link } from 'react-router-dom';
import { Home, Award, Handshake } from 'lucide-react';

const InitiativesPage = () => {
  const initiatives = [
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
        <HeroSection
          title={<>OUR <span className="heading-gradient-light">INITIATIVES</span></>}
          subtitle="Discover the programs and projects we're championing to uplift and support the Hispanic student-athlete community."
          backgroundImageUrl="/images/athlete-test-img-15.jpg"
          backgroundPosition="right"
          className="pb-96"
        />

        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient">
                EXPLORE OUR CURRENT PROGRAMS
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {initiatives.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    to={item.href}
                    key={item.title}
                    className="group bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center"
                  >
                    <div className="flex justify-center items-center bg-nil-navy text-white w-16 h-16 rounded-full mb-4 group-hover:bg-nil-orange transition-colors duration-300">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-nil-navy mb-2 group-hover:text-nil-orange transition-colors duration-300">{item.title}</h3>
                    <p className="text-gray-600 flex-grow">{item.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default InitiativesPage;
