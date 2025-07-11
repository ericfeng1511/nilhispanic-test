import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ContactForm } from '@/components/ContactForm';
import { Palette, Share2, Code, PenTool, Briefcase, Megaphone } from 'lucide-react';

const WorkWithUsPage = () => {
  const opportunities = [
    {
      icon: Palette,
      title: "Submit Your Artwork",
      description: "Have a great design for merchandise? Submit your artwork and earn a percentage of sales if it's selected."
    },
    {
      icon: Share2,
      title: "On-Campus Social Media Team",
      description: "Join our team of 2-4 members per campus to create content and manage our social media presence at your school."
    },
    {
      icon: Code,
      title: "Computer Science Team",
      description: "Lend your coding skills to help us build and maintain our digital platforms and initiatives."
    },
    {
      icon: PenTool,
      title: "Graphic Design Team",
      description: "Use your creative talents to design compelling visuals for our campaigns, social media, and website."
    },
    {
      icon: Briefcase,
      title: "Local Business Development",
      description: "Become one of our 2 sales team members in your city, connecting local businesses with sponsorship opportunities."
    },
    {
      icon: Megaphone,
      title: "Brand Ambassador",
      description: "Inform national brands at the local level about your involvement and the mission of ÑIL Hispanic."
    }
  ];
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <HeroSection
          title={<><span className="heading-gradient-light">WORK WITH US</span></>}
          subtitle="Let's build the future of Hispanic student-athlete empowerment together."
          backgroundImageUrl="/images/athlete-test-img-18.jpg"
          backgroundPosition="center"
          className="pb-96"
        />

        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient">
                OPPORTUNITIES TO COLLABORATE
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {opportunities.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="group bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center"
                  >
                    <div className="flex justify-center items-center bg-nil-navy text-white w-16 h-16 rounded-full mb-4 group-hover:bg-nil-orange transition-colors duration-300">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-nil-navy mb-2 group-hover:text-nil-orange transition-colors duration-300">{item.title}</h3>
                    <p className="text-gray-600 flex-grow">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="relative py-16 md:py-24 bg-[url('/images/background-img-1.png')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/85 via-nil-navy/50 to-nil-orange/45 z-0"></div>
          <div className="relative z-10 container-custom text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold heading-gradient-light mb-6">READY TO JOIN OUR TEAM?</h2>
            <div className="max-w-3xl mx-auto space-y-6 text-gray-200 text-lg">
              <p className="leading-relaxed">
                Let's work together to empower Hispanic student-athletes and build something meaningful.
              </p>
            </div>
            <div className="mt-10">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="btn-primary hover:bg-nil-orange/90 transition-colors text-lg px-10 py-6">
                    Get Started Today
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Join Our Team</DialogTitle>
                    <DialogDescription>
                      Tell us about your skills and interests, and we'll connect you with the right opportunities to contribute to the ÑIL Hispanic mission.
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
    </div>
  );
};

export default WorkWithUsPage;
