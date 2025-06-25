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
      name: "test name 1",
      sport: "test sport 1",
      school: "test school 1",
      quote: "test quote 1"
    },
    {
      name: "test name 2",
      sport: "test sport 2",
      school: "test school 2",
      quote: "test quote 2"
    },
    {
      name: "test name 3",
      sport: "test sport 3",
      school: "test school 3",
      quote: "test quote 3"
    }
  ]

  return (
    <section id="athletes" className="py-20 bg-gradient-to-br from-nil-light-blue via-nil-orange/20 to-nil-navy/30">
      <div className="container-custom">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient">ATHLETE SPOTLIGHT</h2>
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
