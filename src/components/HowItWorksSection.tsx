
import { ArrowRight } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Schedule a Consultation",
      description: "Meet with our team to discuss your brand goals and how Hispanic student-athletes can help you reach them.",
      color: "bg-nil-light-blue"
    },
    {
      number: "02",
      title: "Match with Athletes",
      description: "We connect you with student-athletes whose personal brand and audience align with your company values and target market.",
      color: "bg-nil-light-gray"
    },
    {
      number: "03",
      title: "Create Campaigns",
      description: "Develop authentic marketing campaigns that leverage the unique stories and influence of Hispanic student-athletes.",
      color: "bg-nil-light-blue"
    },
    {
      number: "04",
      title: "Measure Results",
      description: "Track campaign performance through detailed analytics and make data-driven adjustments for optimal results.",
      color: "bg-nil-light-gray"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-nil-light-gray">
      <div className="container-custom">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient">How It Works</h2>
          <p className="text-nil-dark-gray max-w-3xl mx-auto text-lg">
            Our streamlined process connects brands with Hispanic student-athletes to create authentic marketing partnerships that drive results.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`${step.color} rounded-lg p-8 shadow-md transition-transform duration-300 hover:-translate-y-2`}
            >
              <div className="flex items-center mb-4">
                <span className="text-4xl font-bold text-nil-orange mr-3">{step.number}</span>
                <h3 className="text-2xl font-bold text-nil-navy">{step.title}</h3>
              </div>
              <p className="text-nil-dark-gray">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a href="#contact" className="inline-flex items-center text-nil-orange font-semibold hover:underline">
            Ready to get started? <ArrowRight className="ml-2" size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
