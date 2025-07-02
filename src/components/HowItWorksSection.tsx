
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Schedule a Consultation",
      description: "Meet with our team to discuss your brand goals and how Hispanic student-athletes can help you reach them.",
      color: "bg-white"
    },

    {
      number: "02",
      title: "Match with Athletes",
      description: "We connect you with student-athletes whose personal brand and audience align with your company values and objectives.",
      color: "bg-nil-light-gray"
    },

    {
      number: "03",
      title: "Create Campaigns",
      description: "Develop authentic marketing campaigns that leverage the unique stories and influence of Hispanic student-athletes.",
      color: "bg-nil-light-gray"
    },

    {
      number: "04",
      title: "Measure Results",
      description: "Track campaign performance through detailed analytics and make data-driven adjustments for optimal results.",
      color: "bg-white"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-nil-light-blue via-nil-orange/40 to-nil-navy/50 bg-gradient-with-image">
      <div className="container-custom">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient">OUR MISSION</h2>
          <p className="text-nil-dark-gray max-w-3xl mx-auto text-lg">
          We empower Hispanic student-athletes to <b>maximize their opportunities</b> in the Name, Image, and Likeness landscape while connecting brands to an <b>untapped and influential demographic</b>.
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
                    <Link to="/for-brands" className="inline-flex items-center text-nil-orange font-semibold hover:underline">
            Learn more <ArrowRight className="ml-2" size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
