
import { Button } from '@/components/ui/button';
// import { SchedulingModal } from './SchedulingModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContactForm } from "./ContactForm";

const BrandsSection = () => {
  const benefits = [
    {
      title: "Social-First Creator Campaigns",
      description: "Aggregated Hispanic student-athletes driving engagement beyond paid reach"
    },
    {
      title: "Retail & Store Openings",
      description: "Localized athlete creators generating traffic and cultural credibility"
    },
    {
      title: "Experiential & Community Activation",
      description: "Athletes integrated as coaches, mentors, and on-site brand ambassadors"
    },
    {
      title: "Major Sports Moments",
      description: "World Cup, NFL, MLS, NCAA campaigns powered by culturally relevant athletes"
    }
  ];

  return (
    <section id="brands" className="">
      <div className="container-custom">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient">HOW WE DELIVER</h2>
          <p className="text-nil-dark-gray max-w-3xl mx-auto text-lg">
            Partner with Hispanic student-athletes to authentically connect with an engaged demographic and create meaningful marketing campaigns.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="grid grid-cols-1 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-nil-light-gray p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-2 text-nil-navy">{benefit.title}</h3>
                  <p className="text-nil-dark-gray">{benefit.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              {/* <SchedulingModal 
                title="Schedule Brand Consultation"
                description="Let's discuss how your brand can connect with Hispanic student-athletes and tap into this powerful demographic."
                source="For Brands Page - Schedule Brand Consultation Button"
              >
                <Button className="btn-primary">Schedule Brand Consultation</Button>
              </SchedulingModal> */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="btn-primary">Schedule Brand Consultation</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Contact Us</DialogTitle>
                    <DialogDescription>
                      Fill out the form below and we'll get back to you as soon as possible.
                    </DialogDescription>
                  </DialogHeader>
                  <ContactForm />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="bg-nil-navy rounded-lg p-8 text-white flex flex-col justify-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">WHAT BRANDS RECEIVE</h3>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-nil-orange font-bold mr-2">→</span>
                <span>Aggregated Hispanic creator infrastructure</span>
              </li>
              <li className="flex items-start">
                <span className="text-nil-orange font-bold mr-2">→</span>
                <span>Multi-market activation capability</span>
              </li>
              <li className="flex items-start">
                <span className="text-nil-orange font-bold mr-2">→</span>
                <span>Centralized campaign management</span>
              </li>
              <li className="flex items-start">
                <span className="text-nil-orange font-bold mr-2">→</span>
                <span>Athlete contracting and compliance handled</span>
              </li>
              <li className="flex items-start">
                <span className="text-nil-orange font-bold mr-2">→</span>
                <span>Performance tracking and reporting</span>
              </li>
              <li className="flex items-start">
                <span className="text-nil-orange font-bold mr-2">→</span>
                <span>Cultural credibility embedded into execution</span>
              </li>
            </ul>
            
            {/* <p className="italic text-sm">*Statistics based on 2023 market research</p> */}
          </div>
        </div>
        
        {/* <div className="mt-16">
          <h3 className="text-2xl font-bold mb-8 text-center">Trusted By</h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {/* Placeholder for partner logos - replace with actual logos */}
            {/* {[1, 2, 3, 4, 5].map((logo) => (
              <div key={logo} className="w-32 h-12 bg-nil-light-gray flex items-center justify-center rounded">
                <span className="text-nil-dark-gray font-semibold">Partner {logo}</span>
              </div>
            ))} */}
          {/* </div>
        </div> */}
      </div>
    </section>
  );
};

export default BrandsSection;
