import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ContactForm } from '@/components/ContactForm';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Users, Shield, Heart, Star, TrendingUp, Handshake, X, Download } from 'lucide-react';

const FLYER_SEEN_KEY = 'hasSeenInfluencerStaffersFlyerPopup';

const InfluencerStaffersPage = () => {
  const [showFlyerModal, setShowFlyerModal] = useState(false);

  // Show the flyer popup only if it hasn't been seen in this browser session
  useEffect(() => {
    const hasSeenFlyer = localStorage.getItem(FLYER_SEEN_KEY);
    if (!hasSeenFlyer) {
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => {
        setShowFlyerModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseFlyerModal = () => {
    setShowFlyerModal(false);
    localStorage.setItem(FLYER_SEEN_KEY, 'true');
  };

  const benefits = [
    {
      icon: Shield,
      title: "TRUSTED STAFFING",
      description: "Support from athletes trained in leadership and discipline. Get reliable, professional staff who understand teamwork and commitment."
    },
    {
      icon: Heart,
      title: "CULTURAL CONNECTION",
      description: "Authentic connection that resonates deeply with Hispanic families and communities. Build trust through shared cultural understanding."
    },
    {
      icon: Star,
      title: "AUTHENTIC PROMOTION",
      description: "Genuine promotion via their social platforms and peer networks. Reach audiences through trusted voices and authentic storytelling."
    },
    {
      icon: Users,
      title: "POWERFUL ROLE MODELS",
      description: "Inspiring role models for youth and community audiences. Student-athletes who embody excellence both on and off the field."
    }
  ];

  const services = [
    {
      title: "Event Staffing",
      description: "Professional, reliable staff for your events, camps, and activations with the added benefit of social media reach."
    },
    {
      title: "Camp & Clinic Support",
      description: "Experienced student-athletes who can mentor, coach, and inspire while promoting your programs to their networks."
    },
    {
      title: "Brand Activations",
      description: "Authentic brand ambassadors who can engage audiences and create genuine connections with your target demographic."
    },
    {
      title: "Social Media Promotion",
      description: "Organic promotion through their established social platforms and peer networks for maximum authentic reach."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        <HeroSection
          title={<><span className="font-bold">INFLUENCER</span> <span className="heading-gradient-light">STAFFERS</span></>}
          subtitle="Staff camps, clinics, or activations with Hispanic college student athletes who can also promote to their followers."
          backgroundImageUrl="/images/athlete-test-img-14.jpg"
          backgroundPosition="center"
          className="pb-96"
          buttons={[
            {
              text: (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Flyer
                </>
              ),
              link: "#",
              className: "btn-primary",
              size: "sm",
              onClick: () => {
                const link = document.createElement('a');
                link.href = '/images/influencer-staffers-flyer.jpg';
                link.download = 'influencer-staffers-flyer.jpg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }
          ]}
        />

{/* Main Value Proposition */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-6">STAFF CAMPS, CLINICS, OR ACTIVATIONS WITH HISPANIC STUDENT-ATHLETES</h2>
              <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                Our Influencer-Staffers program connects you with Hispanic student-athletes who can both provide professional event support and promote to their followers. Get the best of both worlds: reliable staffing and authentic social media reach.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <img src="/images/athlete-test-img-9.jpg" alt="Student-athletes at event" className="rounded-lg shadow-xl w-full" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-nil-navy mb-4">Why Choose Influencer-Staffers?</h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Traditional event staff just show up and do the job. Our student-athletes bring professionalism, cultural connection, and built-in promotion to amplify your event's reach and impact.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-nil-orange rounded-full mr-3"></div>
                    <span className="text-gray-700">Professional event support</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-nil-orange rounded-full mr-3"></div>
                    <span className="text-gray-700">Social media promotion included</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-nil-orange rounded-full mr-3"></div>
                    <span className="text-gray-700">Cultural authenticity and connection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="relative py-16 md:py-24 bg-[url('/images/athlete-test-img-6.jpg')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/90 via-nil-navy/70 to-nil-orange/60 z-0"></div>
          <div className="relative z-10 container-custom text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">WHAT MAKES OUR INFLUENCER-STAFFERS DIFFERENT</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-nil-navy/50 backdrop-blur-md p-8 rounded-xl shadow-xl border border-nil-orange/50">
                  <div className="flex items-center mb-4">
                    <benefit.icon className="w-8 h-8 text-nil-orange mr-4" />
                    <h3 className="text-2xl font-semibold text-nil-orange">{benefit.title}</h3>
                  </div>
                  <p className="text-gray-200 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-6">OUR SERVICES</h2>
              <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                From camps and clinics to brand activations, our student-athletes provide professional support while authentically promoting your event to their networks.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => (
                <div key={index} className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2 h-full">
                  <h3 className="text-xl font-bold text-white bg-nil-orange p-4">{service.title}</h3>
                  <div className="p-6">
                    <p className="text-nil-dark-gray">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Investment Section */}
        <section className="relative py-16 md:py-24 bg-[url('/images/athlete-test-img-7.jpg')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-orange/70 via-nil-navy/80 to-nil-navy/90 z-0"></div>
          <div className="relative z-10 container-custom text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">INVEST IN THE FUTURE</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-nil-navy/50 backdrop-blur-md p-8 rounded-xl shadow-xl border border-nil-orange/50 text-center">
                <div className="flex items-center justify-center mb-6">
                  <TrendingUp className="w-12 h-12 text-nil-orange mr-4" />
                  <h3 className="text-2xl font-semibold text-nil-orange">The Fastest-Growing Demographic</h3>
                </div>
                <p className="text-lg text-gray-200 leading-relaxed mb-6">
                  By hiring these student-athletes, you're investing in the fastest-growing, most influential Gen Z demographic: <span className="font-bold text-nil-orange">17-24 year-old Hispanics!</span>
                </p>
                {/* <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-nil-orange mb-2">18M+</div>
                    <div className="text-sm text-gray-300">Hispanic Gen Z (17-24)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-nil-orange mb-2">3.2x</div>
                    <div className="text-sm text-gray-300">Higher Social Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-nil-orange mb-2">85%</div>
                    <div className="text-sm text-gray-300">Trust Peer Recommendations</div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 md:py-24 bg-[url('/images/background-img-1.png')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/85 via-nil-navy/50 to-nil-orange/45 z-0"></div>
          <div className="relative z-10 container-custom text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold heading-gradient-light mb-6">READY TO HIRE INFLUENCER-STAFFERS?</h2>
            <div className="max-w-3xl mx-auto space-y-6 text-gray-200 text-lg">
              <p className="leading-relaxed">
                Transform your next event, camp, or activation with student-athletes who bring both professional support and authentic social media reach. Get staffing and promotion in one powerful package.
              </p>
              <p className="font-semibold text-white leading-relaxed">
                Connect with the Hispanic community through trusted voices and authentic storytelling.
              </p>
            </div>
            <div className="mt-10 flex justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="btn-primary hover:bg-nil-orange/90 transition-colors text-lg px-10 py-6">
                    Hire Influencer-Staffers
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Hire Influencer-Staffers</DialogTitle>
                    <DialogDescription>
                      Let's discuss how our Hispanic student-athletes can provide professional staffing and authentic promotional support for your events and brand activations.
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
      
      {/* Flyer Popup Modal */}
      <Dialog open={showFlyerModal} onOpenChange={handleCloseFlyerModal}>
        <DialogContent className="max-w-2xl w-full mx-4 p-0 bg-transparent border-0 shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Influencer Staffers Flyer</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <button
              onClick={handleCloseFlyerModal}
              className="absolute -top-4 -right-4 z-50 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              aria-label="Close flyer"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
            <img 
              src="/images/influencer-staffers-flyer.jpg" 
              alt="Influencer Staffer Services Flyers" 
              className="w-full h-auto rounded-lg shadow-2xl"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InfluencerStaffersPage;
