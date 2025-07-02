import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, Users, Calendar, Network, Trophy, Gamepad2, Music, Coffee, Briefcase, Gift } from 'lucide-react';

const HolaHousesPage = () => {
  const visionPoints = [
    {
      icon: Home,
      title: "Cultural & Social Hub",
      description: "A dedicated space where Hispanic student-athletes can relax, connect, and feel at home on campus."
    },
    {
      icon: Users,
      title: "Community Connection",
      description: "Meet peers from other teams, build lasting friendships, and create a supportive network of fellow athletes."
    },
    {
      icon: Calendar,
      title: "Event Hosting",
      description: "Host cultural celebrations, NIL-related events, and networking opportunities in a welcoming environment."
    },
    {
      icon: Network,
      title: "Mentorship & Growth",
      description: "Find mentorship opportunities, celebrate heritage and identity, and gain visibility within the community."
    }
  ];

  const sponsorshipOpportunities = [
    {
      icon: Music,
      title: "Music & Entertainment Experiences",
      description: "Host listening lounges, live artist showcases, or branded playlists curated by student-athletes."
    },
    {
      icon: Gamepad2,
      title: "Interactive & Gaming Zones",
      description: "Bring in consoles, e-sports tournaments, or custom branded gaming lounges for student engagement."
    },
    {
      icon: Coffee,
      title: "Lifestyle & Chill Zones",
      description: "Furnish relaxation lounges with your brand's products — massage chairs, snack stations, or fitness tech."
    },
    {
      icon: Briefcase,
      title: "NIL Activation Stations",
      description: "Sponsor workshops and content creation zones for student-athletes to build their brands and connect with fans."
    },
    {
      icon: Gift,
      title: "Athlete Gifting & Pop-Ups",
      description: "Host sneaker drops, product seeding events, or cultural collabs with LatinX athlete ambassadors."
    },
    {
      icon: Trophy,
      title: "Brand-Athlete Collaborations",
      description: "Develop ambassador programs with student-athletes who reflect your values and expand your reach."
    }
  ];

  const benefits = [
    "Deep Cultural Alignment with one of the fastest-growing communities in the U.S.",
    "Long-Term Brand Loyalty from a young, influential demographic",
    "Campus Visibility & Respect among students, faculty, and fans",
    "Genuine Social Impact by investing in equity, representation, and community"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        <HeroSection
          title={<><span className="font-bold">HOLA</span> <span className="heading-gradient-light">HOUSES</span></>}
          subtitle="The House of LatinX Athletes - Creating cultural and social hubs on campuses nationwide."
          backgroundImageUrl="/images/athlete-test-img-22.jpg"
          backgroundPosition="center"
          className="pb-96"
        />

        {/* Vision Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-6">OUR VISION: THE HOUSE OF LATINX ATHLETES</h2>
              <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                HOLA is a first-of-its-kind initiative to establish on-campus community spaces across U.S. universities specifically designed for Hispanic student-athletes. Launching in 2026, HOLA will be a cultural and social hub — a place where athletes can relax, connect, and thrive.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {visionPoints.map((point, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    <point.icon className="w-8 h-8 text-nil-orange mr-4" />
                    <h3 className="text-2xl font-semibold text-nil-navy">{point.title}</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Purpose & Impact Section */}
        <section className="relative py-16 md:py-24 bg-[url('/images/athlete-test-img-20.jpeg')] bg-cover bg-center bg-no-repeat bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/90 via-nil-navy/70 to-nil-orange/60 z-0"></div>
          <div className="relative z-10 container-custom text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">PURPOSE & IMPACT</h2>
            </div>
            <div className="max-w-4xl mx-auto space-y-6">
              <p className="text-lg md:text-xl leading-relaxed bg-white/10 p-6 rounded-lg shadow-lg">
                While Hispanic students make up a growing share of NCAA athletics, many report feeling disconnected from broader campus life and from one another. HOLA addresses that by creating a dedicated, inclusive destination — a "home base" for LatinX student-athletes.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-nil-navy/50 backdrop-blur-md p-6 rounded-xl border border-nil-orange/50">
                  <h3 className="text-xl font-semibold text-nil-orange mb-3">For Universities</h3>
                  <p className="text-gray-200">Partnering with HOLA signals a strong institutional commitment to inclusion and belonging. It enhances the student-athlete experience, strengthens alumni pride, and positions the university as a leader in cultural engagement and NIL innovation.</p>
                </div>
                <div className="bg-nil-navy/50 backdrop-blur-md p-6 rounded-xl border border-nil-orange/50">
                  <h3 className="text-xl font-semibold text-nil-orange mb-3">For Student-Athletes</h3>
                  <p className="text-gray-200">HOLA provides a space to meet peers from other teams, host cultural and NIL-related events, collaborate and network, celebrate heritage and identity, and find mentorship and community.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Brands Should Support */}
                <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-6">WHY BRANDS SHOULD SUPPORT HOLA</h2>
              <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                HOLA offers brands authentic, on-campus access to a powerful and growing demographic. With nearly 1 in 5 college students identifying as Hispanic and increasing participation in college athletics, the opportunity is massive.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sponsorshipOpportunities.map((opportunity, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                  <div className="flex justify-center mb-4">
                    <opportunity.icon className="w-10 h-10 text-nil-orange" />
                  </div>
                  <h3 className="text-xl font-bold text-nil-navy mb-3 text-center">{opportunity.title}</h3>
                  <p className="text-gray-600 text-center">{opportunity.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What's In It for Sponsors */}
        <section className="relative py-16 md:py-24 bg-[url('/images/athlete-test-img-21.jpg')] bg-cover bg-center bg-no-repeat bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-orange/70 via-nil-navy/80 to-nil-navy/90 z-0"></div>
          <div className="relative z-10 container-custom text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">WHAT'S IN IT FOR SPONSORS?</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="bg-nil-navy/50 backdrop-blur-md p-6 rounded-xl shadow-xl border border-nil-orange/50">
                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-nil-orange rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <p className="text-gray-200 leading-relaxed">{benefit}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <p className="text-xl font-semibold text-nil-orange bg-white/10 p-6 rounded-lg">
                  Those who support HOLA will lead with the Hispanic community — not follow.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Coming 2026 Section */}
        <section className="relative py-16 md:py-24 bg-[url('/images/background-img-1.png')] bg-cover bg-center bg-no-repeat bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/85 via-nil-navy/50 to-nil-orange/45 z-0"></div>
          <div className="relative z-10 container-custom text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold heading-gradient-light mb-6">COMING 2026 — BE A FOUNDING PARTNER</h2>
            <div className="max-w-3xl mx-auto space-y-6 text-gray-200 text-lg">
              <p className="leading-relaxed">
                We are actively seeking university and brand partners to bring HOLA to campuses nationwide. As a founding sponsor, your organization can help shape the future of Hispanic student-athlete engagement, leadership, and empowerment.
              </p>
              <p className="font-semibold text-white leading-relaxed">
                Join us in creating spaces where Hispanic student-athletes can thrive, connect, and build the foundations for lifelong success.
              </p>
            </div>
            <div className="mt-10 space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Button asChild size="lg" className="btn-primary hover:bg-nil-orange/90 transition-colors text-lg px-10 py-6">
                <Link to="/contact">Become a Founding Partner</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-nil-navy transition-colors text-lg px-10 py-6">
                <Link to="/contact">Learn More</Link>
              </Button>
            </div>
            <p className="mt-8 text-xl font-semibold text-white">
              HOLA Houses: Where Culture Meets Community, Where Athletes Become Leaders.
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default HolaHousesPage;
