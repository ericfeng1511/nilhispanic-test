
const AboutSection = () => {
  return (
    <section id="about" className="">
      <div className="container-custom">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient">OUR MISSION</h2>
          <p className="text-nil-dark-gray max-w-3xl mx-auto text-lg">
            Empower Hispanic student-athletes to maximize their opportunities in the Name, Image, Likeness (NIL) landscape.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="md:w-1/2">
            <img 
              src="/images/athlete-test-img-19.jpg" 
              alt="Hispanic athletes in action" 
              className="rounded-lg shadow-xl max-w-full h-auto object-cover"
            />
          </div>
          <div className="md:w-1/2">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-nil-navy">WHAT SETS US APART</h3>
            
            <div className="mb-6">
              <h4 className="text-xl font-semibold mb-2 text-nil-orange">Demographic Focus</h4>
              <p className="text-nil-dark-gray">
                We exclusively focus on Hispanic student-athletes, providing specialized support and opportunities tailored to their unique backgrounds and communities.
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-xl font-semibold mb-2 text-nil-orange">Group Influencing</h4>
              <p className="text-nil-dark-gray">
                Unlike typical NIL organizations that focus on singular influencer-athletes, we aggregate multiple nano and micro influencer-athletes to create powerful marketing campaigns with broader reach.
              </p>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold mb-2 text-nil-orange">Hybrid App & Agency</h4>
              <p className="text-nil-dark-gray">
                We guide brands to partner with the most relevant Hispanic college student-athletes in any market, and then create effective, authentic campaigns that engage Hispanic and youth audiences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
