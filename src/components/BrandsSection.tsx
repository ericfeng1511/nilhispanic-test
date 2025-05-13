
import { Button } from '@/components/ui/button';

const BrandsSection = () => {
  const benefits = [
    {
      title: "Untapped Hispanic Market",
      description: "Connect with the fast-growing Hispanic demographic through authentic representatives they trust and admire."
    },
    {
      title: "Family & Community Influence",
      description: "Hispanic student-athletes have strong influence within family networks and communities that support them."
    },
    {
      title: "Authentic Brand Ambassadors",
      description: "Work with genuine representatives who embody hard work, dedication, and cultural pride."
    },
    {
      title: "Aggregated Audience Reach",
      description: "Our 'group influencing' approach combines multiple micro-influencers for greater collective impact."
    }
  ];

  return (
    <section id="brands" className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient">For Brands</h2>
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
              <Button className="btn-primary">Schedule Brand Consultation</Button>
            </div>
          </div>
          
          <div className="bg-nil-navy rounded-lg p-8 text-white flex flex-col justify-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">Why Hispanic Student-Athletes?</h3>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-nil-orange font-bold mr-2">→</span>
                <span>Hispanic Americans represent over 62 million people with $1.9 trillion in purchasing power</span>
              </li>
              <li className="flex items-start">
                <span className="text-nil-orange font-bold mr-2">→</span>
                <span>Student-athletes are trusted voices in their communities and family networks</span>
              </li>
              <li className="flex items-start">
                <span className="text-nil-orange font-bold mr-2">→</span>
                <span>76% of Hispanic consumers are more likely to purchase from brands that support their community</span>
              </li>
              <li className="flex items-start">
                <span className="text-nil-orange font-bold mr-2">→</span>
                <span>Hispanic consumers are digital-first and highly engaged on social media platforms</span>
              </li>
              <li className="flex items-start">
                <span className="text-nil-orange font-bold mr-2">→</span>
                <span>Hispanic student-athletes can serve as event staffers, brand ambassadors, and authentic spokespeople</span>
              </li>
            </ul>
            
            <p className="italic text-sm">*Statistics based on 2023 market research</p>
          </div>
        </div>
        
        <div className="mt-16">
          <h3 className="text-2xl font-bold mb-8 text-center">Trusted By</h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {/* Placeholder for partner logos - replace with actual logos */}
            {[1, 2, 3, 4, 5].map((logo) => (
              <div key={logo} className="w-32 h-12 bg-nil-light-gray flex items-center justify-center rounded">
                <span className="text-nil-dark-gray font-semibold">Partner {logo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
