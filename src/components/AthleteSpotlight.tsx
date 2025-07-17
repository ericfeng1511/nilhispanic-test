import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Target, Heart, TrendingUp } from "lucide-react";

const PromoCard = ({ 
  title, 
  description, 
  features, 
  buttonText, 
  buttonLink, 
  icon: Icon,
  buttonClassName 
}: { 
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonLink: string;
  icon: any;
  buttonClassName: string;
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
      <div className="flex items-center mb-6">
        <div className="bg-nil-orange/10 p-3 rounded-lg mr-4">
          <Icon className="h-8 w-8 text-nil-orange" />
        </div>
        <h3 className="text-2xl font-bold text-nil-navy">{title}</h3>
      </div>
      
      <p className="text-nil-dark-gray mb-6 text-lg leading-relaxed">
        {description}
      </p>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <div className="w-2 h-2 bg-nil-orange rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <span className="text-nil-dark-gray">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Link to={buttonLink}>
        <Button className={`w-full transition-all duration-300 ${buttonClassName}`}>
          {buttonText}
        </Button>
      </Link>
    </div>
  );
};

const AthleteSpotlight = () => {
  return (
    <section 
      id="opportunities" 
      className="relative py-20 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: 'url(/images/athlete-test-img-28.jpg)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/90 via-nil-navy/75 to-nil-orange/60 z-0"></div>
      
      <div className="relative z-10 container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            DISCOVER YOUR <span className="heading-gradient-light">OPPORTUNITIES</span>
          </h2>
          <p className="text-gray-200 max-w-4xl mx-auto text-xl leading-relaxed">
            Whether you're a brand aiming to win with the Hispanic market—or an athlete ready to unlock your potential—we’ll help you thrive at the intersection of culture and influence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <PromoCard
            title="For Brands"
            description="Connect with the fastest-growing demographic in sports and unlock authentic partnerships that drive real results."
            features={[
              "Access to 71M+ Hispanics with $2.6T buying power",
              "Authentic cultural connections and brand loyalty",
              "Comprehensive athlete network and event staffing",
              "Data-driven campaigns with measurable ROI"
            ]}
            buttonText="Partner With Us"
            buttonLink="/for-brands"
            icon={Target}
            buttonClassName="btn-primary hover:bg-nil-orange/90"
          />
          
          <PromoCard
            title="For Athletes"
            description="Unlock opportunities, develop your skills, and build your personal brand while staying true to your cultural identity."
            features={[
              "NIL deal opportunities and brand partnerships",
              "Professional development and career planning",
              "Cultural mentorship and community support",
              "Exclusive access to events and networking"
            ]}
            buttonText="Join Our Network"
            buttonLink="/for-athletes"
            icon={Users}
            buttonClassName="btn-secondary hover:bg-nil-light-blue/90"
          />
        </div>
        
        <div className="text-center mt-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white">
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-nil-orange mr-2" />
              <span className="text-lg font-semibold">Culturally Connected</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-nil-orange mr-2" />
              <span className="text-lg font-semibold">Results Driven</span>
            </div>
            <div className="flex items-center">
              <Users className="h-6 w-6 text-nil-orange mr-2" />
              <span className="text-lg font-semibold">Community Focused</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AthleteSpotlight;
