
const AboutSection = () => {
  return (
    <section id="about" className="">
      <div className="container-custom">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient">THE OPPORTUNITY</h2>
          <div className="text-nil-dark-gray max-w-3xl mx-auto text-lg">
            <p>
              Hispanics are the fastest-growing and most culturally influential segment of Gen Z.
            </p>
            <p className="mt-6">
              They over-index in sports fandom, social video creation, and creator engagement—yet remain under-leveraged in traditional NIL and influencer campaigns.
            </p>
            <p className="mt-6">
              ÑIL Hispanic™ organizes cultural trust into a scalable execution system.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="w-full md:w-3/5">
            <img 
              src="/images/athlete-test-img-27.jpg" 
              alt="Hispanic athletes in action" 
              className="rounded-lg shadow-xl w-full h-auto object-cover max-h-[400px] md:max-h-[500px]"
            />
          </div>
          <div className="w-full md:w-2/5">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-nil-navy">WHY ÑIL HISPANIC™?</h3>
            
            <div className="mb-6">
              <h4 className="text-xl font-semibold mb-2 text-nil-orange">National Hispanic Student-Athlete Network</h4>
              <p className="text-nil-dark-gray">
                1,100+ Latino and Latina college student-athletes across 100+ universities in 22 states.
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-xl font-semibold mb-2 text-nil-orange">Scalable Group Influence</h4>
              <p className="text-nil-dark-gray">
                We aggregate micro- and nano-creators to deliver macro-level performance at micro-level cost.
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-xl font-semibold mb-2 text-nil-orange">Built for Multi-Market Execution</h4>
              <p className="text-nil-dark-gray">
                Activate 5 or 500 athletes across priority Hispanic markets with centralized campaign management.
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-xl font-semibold mb-2 text-nil-orange">Cultural Credibility</h4>
              <p className="text-nil-dark-gray">
                Our athletes influence families, teammates, youth clubs, and local communities. They create multiplier effects that paid media cannot replicate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
