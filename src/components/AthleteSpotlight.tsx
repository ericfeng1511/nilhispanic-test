
import { Button } from "@/components/ui/button";

const AthleteCard = ({ name, sport, school, quote }: { name: string; sport: string; school: string; quote: string }) => {
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2">
      <div className="h-60 bg-nil-light-gray flex items-center justify-center">
        {/* Placeholder for athlete image */}
        <span className="text-nil-dark-gray">Athlete Photo</span>
      </div>
      <div className="p-6">
        <h4 className="text-xl font-bold text-nil-navy mb-1">{name}</h4>
        <p className="text-nil-orange mb-3">{sport} • {school}</p>
        <p className="text-nil-dark-gray italic mb-4">"{quote}"</p>
      </div>
    </div>
  );
};

const AthleteSpotlight = () => {
  const athletes = [
    {
      name: "Maria Rodriguez",
      sport: "Soccer",
      school: "University of Texas",
      quote: "NIL Hispanic has helped me build my personal brand while staying true to my cultural roots."
    },
    {
      name: "Carlos Mendez",
      sport: "Basketball",
      school: "Arizona State",
      quote: "Through NIL Hispanic, I've connected with brands that share my values and speak to my community."
    },
    {
      name: "Sofia Hernandez",
      sport: "Volleyball",
      school: "UCLA",
      quote: "Being part of NIL Hispanic means using my platform to inspire the next generation of Hispanic athletes."
    }
  ];

  return (
    <section id="athletes" className="py-20 bg-nil-light-blue">
      <div className="container-custom">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient">Athlete Spotlight</h2>
          <p className="text-nil-dark-gray max-w-3xl mx-auto text-lg">
            Meet some of the outstanding Hispanic student-athletes in our network who are making an impact both in their sports and communities.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {athletes.map((athlete, index) => (
            <AthleteCard 
              key={index}
              name={athlete.name}
              sport={athlete.sport}
              school={athlete.school}
              quote={athlete.quote}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button className="btn-secondary">View More Athletes</Button>
        </div>
      </div>
    </section>
  );
};

export default AthleteSpotlight;
