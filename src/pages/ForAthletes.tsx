import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from '@/components/HeroSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShieldCheck, Megaphone, DollarSign, Users, BookOpen, Mic, BarChart2, Heart } from 'lucide-react';

const ForAthletesPage = () => {
  const empowermentPoints = [
    {
      icon: ShieldCheck,
      title: "NIL Education & Compliance",
      description: "Navigate the complexities of NIL with confidence. We provide clear, straightforward guidance on rules and regulations to ensure you stay eligible and protected."
    },
    {
      icon: Megaphone,
      title: "Personal Branding",
      description: "Your story is your brand. We help you identify your unique value, build a powerful personal narrative, and create a brand that resonates with fans and sponsors."
    },
    {
      icon: DollarSign,
      title: "Financial Literacy",
      description: "Learn how to manage your earnings responsibly. Our workshops cover budgeting, taxes, and smart investment strategies to set you up for long-term financial success."
    },
    {
      icon: Users,
      title: "Community & Networking",
      description: "Connect with a powerful network of Hispanic athletes, alumni, and business leaders. Build relationships that will support you on and off the field."
    }
  ];

  const playbookTips = [
    {
      icon: Mic,
      title: "Define Your Brand Voice",
      description: "What are your core values? What makes you unique? Your content should consistently reflect who you are."
    },
    {
      icon: BarChart2,
      title: "Know Your Audience",
      description: "Engage with your followers. Understand what they care about and create content that provides value to them."
    },
    {
      icon: Heart,
      title: "Authenticity is Key",
      description: "Be genuine. Fans and brands are drawn to athletes who are real and relatable. Share your journey—the wins and the challenges."
    },
    {
      icon: BookOpen,
      title: "Content is King",
      description: "Plan your content. Mix in behind-the-scenes footage, training clips, community involvement, and personal interests to create a well-rounded profile."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        <HeroSection
          title={<><span className="font-bold">YOUR TIME</span> <span className="heading-gradient-light">IS NOW</span></>}
          subtitle="Unlock your potential, build your legacy. We're here to help you succeed."
          backgroundImageUrl="/images/athlete-test-img-5.jpg"
          backgroundPosition="center"
          className="pb-96"
        />

        <section className="py-16 md:py-24 bg-white">
          <div className="container-custom">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-12">EMPOWERING THE NEXT GENERATION OF HISPANIC ATHLETES</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <img src="/images/athlete-test-img-12.jpg" alt="Hispanic athletes empowerment" className="rounded-lg shadow-xl w-full" />
              </div>
              <div className="text-left">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  At ÑIL Hispanic, we believe in your potential. The world of Name, Image, and Likeness (NIL) has opened up incredible opportunities, and we are here to provide the resources, guidance, and community you need to thrive. Our programs are designed to help you build a successful brand, make smart financial decisions, and prepare for a prosperous life beyond sports.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24 bg-[url('/images/athlete-test-img-13.jpg')] bg-cover bg-center bg-no-repeat bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-orange/70 via-nil-navy/80 to-nil-navy/90 z-0"></div>
          <div className="relative z-10 container-custom text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">HOW WE EMPOWER YOU</h2>
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

        <section className="py-16 md:py-24 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient">YOUR NIL PLAYBOOK: TIPS FOR SUCCESS</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {playbookTips.map((tip, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
                  <div className="flex justify-center mb-4">
                    <tip.icon className="w-10 h-10 text-nil-orange" />
                  </div>
                  <h3 className="text-xl font-bold text-nil-navy mb-2">{tip.title}</h3>
                  <p className="text-gray-600">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/20 to-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-6">JOIN OUR COMMUNITY</h2>
            <div className="max-w-3xl mx-auto space-y-6 text-gray-700 text-lg">
              <p className="leading-relaxed">
                You are not alone on this journey. Connect with fellow Hispanic athletes who share your drive and ambition. Get involved, ask questions, and grow with us.
              </p>
            </div>
            <div className="mt-10">
              <Button asChild size="lg" className="btn-primary hover:bg-nil-orange/90 transition-colors text-lg px-10 py-6">
                <Link to="/contact">Get Involved</Link>
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
