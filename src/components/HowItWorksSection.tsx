import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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

          <Link
            to="/for-brands"
            className="inline-flex items-center text-white bg-nil-orange/90 hover:bg-nil-orange px-6 py-3 rounded-lg font-bold transition-all text-lg shadow-lg"
          >
            Learn more <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </div>

      <div id="why-now" className="pt-16 pb-20">
        <div className="md:w-1/2 mb-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8 heading-gradient-light">WHY NOW</h2>

          <ul className="space-y-4 text-gray-300 text-lg md:text-xl">
            <li className="flex items-start">
              <span className="text-nil-orange mr-3 mt-1">•</span>
              <span>Creator-led content drives trust and discovery</span>
            </li>
            <li className="flex items-start">
              <span className="text-nil-orange mr-3 mt-1">•</span>
              <span>Young Hispanics are the fastest-growing and most culturally influential segment of Gen Z</span>
            </li>
            <li className="flex items-start">
              <span className="text-nil-orange mr-3 mt-1">•</span>
              <span>Hispanics over-index in sports fandom and social video engagement</span>
            </li>
            <li className="flex items-start">
              <span className="text-nil-orange mr-3 mt-1">•</span>
              <span>Major sports moments are accelerating investment in Hispanic-relevant creator campaigns</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default HowItWorksSection;
