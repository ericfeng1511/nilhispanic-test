import React, { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from '@/components/HeroSection';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Megaphone, Users, BarChart2 } from 'lucide-react';
import InstagramPost from '@/components/InstagramPost';
import { AuthModal } from '@/components/AuthModal';

const ForAthletesPage = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const empowermentPoints = [
    {
      icon: Megaphone,
      title: "Brand Opportunities",
      description: "Access national and regional brand campaigns built specifically for Hispanic student-athletes."
    },
    {
      icon: ShieldCheck,
      title: "Personal Brand Development",
      description: "Define your story, strengthen your presence, and build a brand that resonates beyond the field."
    },
    {
      icon: BarChart2,
      title: "NIL Education & Protection",
      description: "Clear guidance on compliance, contracts, and eligibility so you operate with confidence."
    },
    {
      icon: Users,
      title: "Network & Exposure",
      description: "Connect with fellow Hispanic athletes, alumni, and business leaders who understand your journey."
    }
  ];

  // TODO: Replace these placeholder URLs with the actual URLs of the Instagram posts you want to feature.
  const instagramUrls = [
    "https://www.instagram.com/p/DKAdmUkSN2z/?utm_source=ig_web_copy_link&igsh=ZTA4NHVrOGYxM3Rz",
    "https://www.instagram.com/p/DJubjn-Sz4Y/?utm_source=ig_web_copy_link&igsh=MThqMHN1Z3Mwbm16Yw==",
    "https://www.instagram.com/p/DJcZsi1yNU3/?utm_source=ig_web_copy_link&igsh=eDdybXNiN3h3OHZ0"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        <HeroSection
          title={<><span className="font-bold">TURN YOUR CULTURE</span> <span className="heading-gradient-light">INTO OPPORTUNITY</span></>}
          subtitle="Join the only national Hispanic college student-athlete network built to connect you with real brand campaigns, community influence, and long-term career growth."
          backgroundImageUrl="/images/athlete-test-img-1.png"
          backgroundPosition="center"
          className="pb-96"
          buttons={[
            {
              text: "Create Your Profile",
              link: "#",
              onClick: () => setAuthModalOpen(true),
              className: "bg-nil-orange hover:bg-nil-orange/90 text-white font-semibold px-8 py-3",
              size: "lg"
            }
          ]}
        />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient">ATHLETE SPOTLIGHTS</h2>
              <p className="text-nil-dark-gray max-w-3xl mx-auto text-lg mt-4">
                See how Hispanic student-athletes across the country are building their brands, landing opportunities, and representing their communities.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
              {instagramUrls.map((url, index) => (
                <InstagramPost key={index} url={url} />
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24 bg-[url('/images/athlete-test-img-13.jpg')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-orange/70 via-nil-navy/80 to-nil-navy/90 z-0"></div>
          <div className="relative z-10 container-custom text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">HOW ÑIL HISPANIC WORKS FOR YOU</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {empowermentPoints.map((point, index) => (
                <div key={index} className="bg-nil-navy/50 backdrop-blur-md p-8 rounded-xl shadow-xl border border-nil-orange/50">
                  <div className="flex items-center mb-4">
                    <point.icon className="w-8 h-8 text-nil-orange mr-4" />
                    <h3 className="text-2xl font-semibold text-nil-orange">{point.title}</h3>
                  </div>
                  <p className="text-gray-200 leading-relaxed">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-12">YOU'RE NOT JUST AN ATHLETE. YOU'RE AN INFLUENCER.</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <img src="/images/athlete-test-img-12.jpg" alt="Hispanic athletes empowerment" className="rounded-lg shadow-xl w-full" />
              </div>
              <div className="text-left space-y-4">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  Hispanic student-athletes carry influence beyond social media. You represent your family, your community, and the next generation watching you succeed.
                </p>
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  ÑIL Hispanic™ organizes that influence into real opportunities — connecting you to brands that value authenticity, culture, and leadership.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24 bg-[url('/images/background-img-1.png')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/85 via-nil-navy/50 to-nil-orange/45 z-0"></div>
          <div className="relative z-10 container-custom text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold heading-gradient-light mb-6">JOIN THE NATIONAL HISPANIC ATHLETE NETWORK</h2>
            <div className="max-w-3xl mx-auto space-y-4 text-gray-200 text-lg">
              <p className="leading-relaxed">
                Be part of a structured community designed to elevate Hispanic student-athletes across sports and universities.
              </p>
              <p className="leading-relaxed">
                Build relationships. Access opportunities. Represent your culture with purpose.
              </p>
            </div>
            <div className="mt-10">
              <Button
                size="lg"
                className="bg-nil-orange hover:bg-nil-orange/90 text-white font-semibold transition-colors text-lg px-10 py-6"
                onClick={() => setAuthModalOpen(true)}
              >
                Create Your Profile
              </Button>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default ForAthletesPage;
