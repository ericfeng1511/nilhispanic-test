
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="pt-28 pb-16 bg-gradient-to-br from-white to-nil-light-blue">
      <div className="container-custom flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Empowering Hispanic <span className="heading-gradient">Student-Athletes</span>
          </h1>
          <p className="text-nil-dark-gray text-lg md:text-xl mb-8 max-w-xl">
            Bridging the gap between Hispanic student-athletes and brands seeking authentic ambassadors with strong family and community connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="btn-primary">For Brands</Button>
            <Button className="btn-secondary">For Athletes</Button>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img 
            src="/placeholder.svg" 
            alt="Hispanic student athletes celebrating" 
            className="rounded-lg shadow-xl max-w-full h-auto object-cover" 
            style={{ maxHeight: "500px" }}
          />
        </div>
      </div>
      <div className="container-custom mt-12">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-wrap justify-around items-center gap-6">
          <div className="text-center">
            <p className="font-bold text-3xl text-nil-navy">500+</p>
            <p className="text-nil-dark-gray">Student Athletes</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-3xl text-nil-navy">50+</p>
            <p className="text-nil-dark-gray">Partner Brands</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-3xl text-nil-navy">30+</p>
            <p className="text-nil-dark-gray">Universities</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-3xl text-nil-navy">100%</p>
            <p className="text-nil-dark-gray">Success Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
