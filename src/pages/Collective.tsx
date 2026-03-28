import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection'; // Assuming HeroSection is in @/components
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom'; // For CTA button
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ContactForm } from '@/components/ContactForm';
import FactCard from '@/components/FactCard';

const CollectivePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        <HeroSection
          title={<><span className="font-bold">ÑILH</span> <span className="heading-gradient-light">COLLECTIVE</span></>}
          subtitle="Championing the success of Hispanic student-athletes nationwide, on and off the field."
          backgroundImageUrl="/images/athlete-test-img-15.jpg"
          backgroundPosition="left"
          className="pb-96"
        />

        {/* Welcome Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-12">EMPOWERING HISPANIC STUDENT-ATHLETES NATIONWIDE</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <img src="/images/athlete-test-img-12.jpg" alt="Empowering student athletes" className="rounded-lg shadow-xl w-full" />
              </div>
              <div className="text-left">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  At ÑILH Collective (ÑIL Hispanic™ Collective), we are revolutionizing the landscape for Hispanic college student-athletes. As a national nonprofit, we are committed to raising funds and creating impactful programs that champion their success both on and off the field. Unlike other initiatives, we are school-agnostic, meaning our focus spans across all sports and schools, ensuring no Hispanic student-athlete is left behind.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why ÑILH Collective Section */}
        <section className="relative py-16 md:py-24 bg-[url('/images/athlete-test-img-10.jpg')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/90 via-nil-navy/70 to-nil-orange/60 z-0"></div>
          <div className="relative z-10 container-custom text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">WHY ÑILH COLLECTIVE?</h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-6">
              <p className="text-lg md:text-xl leading-relaxed bg-white/10 p-6 rounded-lg shadow-lg">
                Our goal is to raise a minimum of <span className="font-bold text-nil-orange">$1,000 per student-athlete in 2025</span>, with ambitious targets to reach <span className="font-bold text-nil-orange">$10,000 or more by 2030</span>. These funds alleviate financial burdens on families, reduce stress, and create opportunities for student-athletes to thrive academically, athletically, and personally. This isn’t just about financial aid—it’s about creating a win-win for the student-athlete, their family, their school, and their sport.
              </p>
            </div>
          </div>
        </section>

        {/* Our Vision Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/40 to-nil-navy/50 bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-4">OUR VISION</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FactCard 
                title="Support Hispanic Student-Athletes Nationwide" 
                body="No matter the sport or school, our programs are designed to elevate all Hispanic student-athletes, including those in sports like soccer, baseball, track and field, wrestling, and more—not just football and basketball."
              />
              <FactCard 
                title="Foster Community and Connections" 
                body="Through networking opportunities, we connect student-athletes with peers, alumni, professional athletes, and successful business leaders. These relationships foster inspiration, mentorship, and collaboration."
              />
              <FactCard 
                title="Empower NIL Success" 
                body="We provide workshops and resources to help student-athletes market themselves effectively and secure corporate NIL deals. We also work with school collectives to democratize NIL funding, ensuring equitable support for Hispanic athletes."
              />
              <FactCard 
                title="Prepare for Life Beyond College" 
                body="Our job preparation programs equip student-athletes with the skills and connections they need to transition seamlessly into their post-college careers."
              />
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="relative py-16 md:py-24 bg-[url('/images/athlete-test-img-8.jpg')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-orange/70 via-nil-navy/80 to-nil-navy/90 z-0"></div>
          <div className="relative z-10 container-custom text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">WHAT WE OFFER</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {[{
                  title: "Financial Support",
                  points: [
                    "Immediate funding goals to alleviate financial stress.",
                    "Long-term growth in NIL opportunities for Hispanic student-athletes."
                  ]
                },{
                  title: "Networking Opportunities",
                  points: [
                    "Connections with fellow student-athletes across the country.",
                    "Alumni mentorship from successful Hispanic professionals."
                  ]
                },{
                  title: "Personal and Professional Development",
                  points: [
                    "Workshops on NIL marketing best practices.",
                    "Job preparation programs to ensure career readiness."
                  ]
                },{
                  title: "Community Building",
                  points: [
                    "A space where Hispanic student-athletes can share experiences, inspire one another, and know they are not alone."
                  ]
                }
              ].map((offer, index) => (
                <div key={index} className="bg-nil-navy/50 backdrop-blur-md p-8 rounded-xl shadow-xl border border-nil-orange/50">
                  <h3 className="text-2xl font-semibold text-nil-orange mb-4">{offer.title}</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-200">
                    {offer.points.map((point, pIndex) => (
                      <li key={pIndex}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Be Part of the Movement Section */}
        <section className="relative py-16 md:py-24 bg-[url('/images/background-img-1.png')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/85 via-nil-navy/50 to-nil-orange/45 z-0"></div>
          <div className="relative z-10 container-custom text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold heading-gradient-light mb-6">BE PART OF THE MOVEMENT</h2>
            <div className="max-w-3xl mx-auto space-y-6 text-gray-200 text-lg">
              <p className="leading-relaxed">
                Brands, companies, professional athletes, entertainers, and business leaders—we invite you to join us in making history. Together, we can empower the next generation of Hispanic student-athletes to reach their full potential and redefine the future of college sports.
              </p>
            </div>
            <div className="mt-10">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="btn-primary hover:bg-nil-orange/90 transition-colors text-lg px-10 py-6">
                    Learn More & Get Involved
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Join the ÑILH Collective</DialogTitle>
                    <DialogDescription>
                      Learn more about our collective and how you can get involved in championing Hispanic student-athletes nationwide.
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

export default CollectivePage;
