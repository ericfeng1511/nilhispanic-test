import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import { Button } from '@/components/ui/button';
import { BarChart, Globe, Heart, Smartphone, Tv, Users } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ContactForm } from '@/components/ContactForm';

const SoccerPage = () => {
  const stats = [
    {
      icon: 'Users',
      value: "73%",
      label: "of U.S. Hispanics aged 16 and older call themselves soccer fans.",
    },
    {
      icon: 'Heart',
      value: "82%",
      label: "of Hispanic soccer fans grew up playing the game.",
    },
    {
      icon: 'Tv',
      value: "36%",
      label: "of Hispanic fans watch at least half of soccer games at a bar or restaurant.",
    },
    {
      icon: 'BarChart',
      value: "91%",
      label: "of Latina soccer fans watch soccer at least once a month, 62% watch weekly.",
    },
    {
      icon: 'Smartphone',
      value: "16%",
      label: "of Hispanic soccer fans over-index in consuming soccer content on TikTok.",
    },
    {
      icon: 'Globe',
      value: "84%",
      label: "of Latinos are willing to show loyalty to brands that demonstrate community involvement.",
    },
  ];

  const iconComponents: { [key: string]: React.FC<LucideProps> } = {
    Users,
    Heart,
    Tv,
    BarChart,
    Smartphone,
    Globe,
  };

  const rationale = [
    {
      title: "Capitalize on the Pre-World Cup Hype Cycle",
      description: "With the 2026 World Cup and 2028 Olympics in the U.S., soccer interest will soar. Early investment will position your brand as a key supporter, maximizing visibility and return."
    },
    {
      title: "Hispanic Market Growth & Soccer’s Central Role",
      description: "Soccer is central to Hispanic culture, with 70% of fans naming it their favorite sport. Partnering with ÑIL Hispanic™ Soccer lets your brand connect authentically with a community that values tradition and family."
    },
    {
      title: "Women’s Soccer: An Emerging Marketing Goldmine",
      description: "The 2023 Women’s World Cup broke records, and NWSL attendance surged 48%. Supporting ÑIL Hispanic™ Soccer aligns your brand with women’s sports, equality, empowerment and innovation."
    },
    {
      title: "Amplify Your Reach Through Influencers",
      description: "ÑIL Hispanic™ initiatives offer brand exposure at all levels of soccer, nurturing talent and community to position your brand as a trusted supporter of Hispanic soccer."
    }
  ];

  const hostCities = "Atlanta, Boston, Dallas, Houston, Kansas City, Los Angeles, Miami, New York / New Jersey, Philadelphia, San Francisco Bay Area, Seattle";

  return (
    <>
      <Header />
      <main>
        <HeroSection
          title={<span className="heading-gradient-light">ÑIL HISPANIC™ SOCCER</span>}
          subtitle="Position your brand as a champion of soccer’s growth in the U.S."
          backgroundImageUrl="/images/athlete-test-img-4.jpg"
          backgroundPosition="center"
          className="pb-96"
        />

        {/* Intro Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-12">
                CAPITALIZE ON THE MOMENTUM OF EXPLOSIVE TRENDS IN THE U.S.
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <img src="/images/athlete-test-img-17.jpg" alt="Soccer trends" className="rounded-lg shadow-xl w-full" />
              </div>
              <div className="text-left">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  With the Men's World Cup (2026), Women's World Cup (2027), and LA28 Olympics on the horizon, the time is now to position your brand as a champion of soccer’s growth in the U.S. Women’s soccer, led by the NWSL and fueled by role models on and off the field, is exploding in popularity. Associating with ÑIL Hispanic™ programs showcases your commitment to equality, representation, and empowerment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Host Cities Section */}
        <section className="relative py-16 md:py-24 bg-[url('/images/athlete-test-img-6.jpg')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/90 via-nil-navy/70 to-nil-orange/60 z-0"></div>
          <div className="relative z-10 container-custom text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 heading-gradient-light">WORLD CUP 2026 U.S. HOST CITIES</h2>
            <p className="text-xl md:text-2xl font-semibold mb-8 max-w-4xl mx-auto">
              {hostCities}
            </p>
            <img src="/images/world-cup-cities.png" alt="World Cup 2026 Host Cities Map" className="mx-auto mb-8 rounded-lg shadow-2xl" />
            <p className="text-lg md:text-xl max-w-3xl mx-auto bg-white/10 p-6 rounded-lg shadow-lg">
              Six of these are major Hispanic markets, home to dozens of ÑIL Hispanic™ schools and hundreds of soccer student-athletes.
            </p>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient">
                The Hispanic Community: A Powerful Force in Soccer
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {stats.map((stat, index) => {
                const IconComponent = iconComponents[stat.icon];
                return (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <div className="flex justify-center mb-4">
                      {IconComponent && <IconComponent className="w-10 h-10 text-nil-orange" />}
                    </div>
                    <p className="text-4xl font-bold text-nil-navy mb-2">{stat.value}</p>
                    <p className="text-gray-600">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Rationale for Sponsorship Section */}
        <section className="relative py-16 md:py-24 bg-[url('/images/athlete-test-img-14.jpg')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-orange/70 via-nil-navy/80 to-nil-navy/90 z-0"></div>
          <div className="relative z-10 container-custom text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient-light">
                WHY SPONSOR ÑIL HISPANIC™ SOCCER?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {rationale.map((item, index) => (
                <div key={index} className="bg-nil-navy/50 backdrop-blur-md p-8 rounded-xl shadow-xl border border-nil-orange/50">
                  <h3 className="text-2xl font-semibold text-nil-orange mb-4">{item.title}</h3>
                  <p className="text-gray-200 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="relative py-16 md:py-24 bg-[url('/images/background-img-1.png')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/85 via-nil-navy/50 to-nil-orange/45 z-0"></div>
          <div className="relative z-10 container-custom text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold heading-gradient-light mb-6">JOIN THE MOVEMENT</h2>
            <div className="max-w-3xl mx-auto space-y-6 text-gray-200 text-lg">
                <p className="leading-relaxed">
                    Partner with ÑIL Hispanic™ Soccer and connect with a passionate, loyal, and growing audience. Let's build the future of soccer together.
                </p>
            </div>
            <div className="mt-10">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="btn-primary hover:bg-nil-orange/90 transition-colors text-lg px-10 py-6">
                    Partner With Us
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Partner with ÑILH Soccer</DialogTitle>
                    <DialogDescription>
                      Let's discuss how your brand can connect with Hispanic soccer fans and student-athletes through our soccer initiatives.
                    </DialogDescription>
                  </DialogHeader>
                  <ContactForm />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default SoccerPage;
