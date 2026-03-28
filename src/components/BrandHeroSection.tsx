import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const BrandHeroSection = () => {
  return (
    <section className="relative pt-28 pb-48 bg-[url('/images/athlete-test-img-3.png')] bg-cover bg-center bg-no-repeat md:bg-fixed">
      <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/85 via-nil-navy/50 to-nil-orange/45 z-0"></div> {/* Gradient Overlay */}
      <div className="relative z-10 container-custom flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 mt-40 text-gray-100">
            ACTIVATE HISPANIC AUDIENCES <span className="heading-gradient-light">WITH TRUST, SCALE, AND PERFORMANCE</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-xl">
            ÑIL Hispanic™ helps brands reach Latino and Latina Gen Z audiences, their families, and
            communities through a national network of 1,100+ trusted college student-athletes —
            delivering culturally credible content and measurable results.
          </p>

        </div>
        <div className="md:w-1/2 flex justify-center">
          {/* Optional: You can add an image or graphic here if needed */}
        </div>
      </div>
    </section>
  );
};

export default BrandHeroSection;
