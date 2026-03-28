import { ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContactForm } from "@/components/ContactForm";

const HowItWorksSection = () => {
  return (
    <>
      <div id="who-we-are" className="pt-16 pb-20 flex justify-end">
        <div className="md:w-1/2 text-right">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 heading-gradient-light">WHO WE ARE</h2>

          <p className="text-gray-300 text-lg md:text-xl mb-6">
            ÑIL Hispanic™ is the only national Hispanic college student-athlete network built for multi-market campaign execution.
          </p>

          <p className="text-gray-300 text-lg md:text-xl mb-8">
            We help brands convert cultural credibility into measurable performance by sourcing, managing, and activating campaigns with 5 or 500 Hispanic student-athletes.
          </p>

          <p className="text-gray-300 text-lg md:text-xl mb-8">
            One partner. National reach. Local trust.
          </p>

          <Dialog>
            <DialogTrigger asChild>
              <button className="inline-flex items-center text-white bg-nil-orange/90 hover:bg-nil-orange px-6 py-3 rounded-lg font-bold transition-all text-lg shadow-lg">
                Learn more <ArrowRight className="ml-2" size={20} />
              </button>
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

      <div id="why-now" className="pt-16 pb-20">
        <div className="md:w-1/2 mb-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8 heading-gradient-light">WHY NOW</h2>

          <ul className="space-y-4 text-gray-300 text-lg md:text-xl">
            <li className="flex items-start">
              <span className="text-nil-orange mr-3 mt-1">•</span>
              <span>Audiences trust creators more than brands. Hispanic student-athletes are both.</span>
            </li>
            <li className="flex items-start">
              <span className="text-nil-orange mr-3 mt-1">•</span>
              <span>Young Hispanics are Gen Z's fastest-growing segment, and they're setting the cultural agenda</span>
            </li>
            <li className="flex items-start">
              <span className="text-nil-orange mr-3 mt-1">•</span>
              <span>Hispanic fans watch more, share more, and engage more, especially when it's sport</span>
            </li>
            <li className="flex items-start">
              <span className="text-nil-orange mr-3 mt-1">•</span>
              <span>The biggest sports moments in the U.S. now have a Hispanic audience at their center</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default HowItWorksSection;
