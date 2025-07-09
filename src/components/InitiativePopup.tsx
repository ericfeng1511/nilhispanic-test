import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Users, Home, Award, Handshake, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const POPUP_SEEN_KEY = 'hasSeenInitiativePopup';

interface Initiative {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  keyBenefits: string[];
  icon: React.ComponentType<any>;
  href: string;
  bgImage: string;
  ctaText: string;
  stats?: {
    label: string;
    value: string;
  }[];
}

const InitiativePopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const initiatives: Initiative[] = [
    {
      id: 'collective',
      title: 'The Collective',
      subtitle: 'Championing the success of Hispanic student-athletes nationwide',
      description: 'At ÑILH Collective, we are revolutionizing the landscape for Hispanic college student-athletes. As a national nonprofit, we are committed to raising funds and creating impactful programs that champion their success both on and off the field.',
      keyBenefits: [
        'Financial support to alleviate stress on families',
        'Networking opportunities with fellow student-athletes',
        'Personal and professional development workshops',
        'Community building and mentorship programs'
      ],
      icon: Users,
      href: '/initiatives/collective',
      bgImage: '/images/athlete-test-img-15.jpg',
      ctaText: 'Learn More & Get Involved',
      stats: [
        { label: '2025 Goal', value: '$1,000' },
        { label: '2030 Target', value: '$10,000+' },
        { label: 'Coverage', value: 'All Sports' }
      ]
    },
    {
      id: 'hola-houses',
      title: 'HOLA Houses',
      subtitle: 'The House of LatinX Athletes',
      description: 'A first-of-its-kind initiative to establish on-campus community spaces across U.S. universities specifically designed for Hispanic student-athletes. A cultural and social hub where athletes can relax, connect, and thrive.',
      keyBenefits: [
        'Deep Cultural Alignment with fastest-growing communities',
        'Long-Term Brand Loyalty from young, influential demographic',
        'Campus Visibility & Respect among students and faculty',
        'Genuine Social Impact through equity and representation'
      ],
      icon: Home,
      href: '/initiatives/hola-houses',
      bgImage: '/images/hola-houses.png',
      ctaText: 'Become a Founding Partner',
      stats: [
        { label: 'Launch Year', value: '2026' },
        { label: 'Target', value: 'Nationwide' },
        { label: 'Focus', value: 'Cultural Hubs' }
      ]
    },
    {
      id: 'soccer',
      title: 'ÑIL Soccer',
      subtitle: 'Position your brand as a champion of soccer\'s growth in the U.S.',
      description: 'Soccer is central to Hispanic culture, with 73% of U.S. Hispanics calling themselves soccer fans. With the 2026 World Cup and 2028 Olympics in the U.S., soccer interest will soar.',
      keyBenefits: [
        'Capitalize on Pre-World Cup hype cycle',
        'Connect with Hispanic market where soccer is central',
        'Support women\'s soccer emerging goldmine',
        'Amplify reach through authentic influencers'
      ],
      icon: Award,
      href: '/initiatives/soccer',
      bgImage: '/images/athlete-test-img-4.jpg',
      ctaText: 'Partner With Us',
      stats: [
        { label: 'Hispanic Fans', value: '73%' },
        { label: 'Grew Up Playing', value: '82%' },
        { label: 'Brand Loyalty', value: '84%' }
      ]
    },
    {
      id: 'influencer-staffers',
      title: 'Influencer Staffers',
      subtitle: 'Staff camps, clinics, or activations with Hispanic student athletes',
      description: 'Our Influencer-Staffers program connects you with Hispanic student-athletes who can both provide professional event support and promote to their followers. Get reliable staffing and authentic social media reach.',
      keyBenefits: [
        'Trusted Staffing from disciplined athletes',
        'Cultural Connection that resonates with Hispanic families',
        'Authentic Promotion via social platforms',
        'Powerful Role Models for youth audiences'
      ],
      icon: Handshake,
      href: '/initiatives/influencer-staffers',
      bgImage: '/images/athlete-test-img-14.jpg',
      ctaText: 'Hire Influencer-Staffers',
      stats: [
        { label: 'Target Age', value: '17-24' },
        { label: 'Services', value: '4 Types' },
        { label: 'Dual Value', value: 'Staff + Promo' }
      ]
    }
  ];

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem(POPUP_SEEN_KEY);
    if (!hasSeenPopup) {
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(POPUP_SEEN_KEY, 'true');
  };

  const handleNext = () => {
    setCurrentStep((prevStep) => (prevStep + 1) % initiatives.length);
  };

  const handlePrev = () => {
    setCurrentStep((prevStep) => (prevStep - 1 + initiatives.length) % initiatives.length);
  };

  if (!isVisible) {
    return null;
  }

  const currentInitiative = initiatives[currentStep];
  const Icon = currentInitiative.icon;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full p-2 transition-all duration-200 shadow-lg"
          aria-label="Close popup"
        >
          <X size={20} />
        </button>

        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${currentInitiative.bgImage}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/90 via-nil-navy/70 to-nil-orange/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[500px]">
            {/* Left Column - Main Content */}
            <div className="space-y-6">
              {/* Icon and Title */}
              <div className="flex items-center space-x-4">
                <div className="bg-nil-orange p-3 rounded-xl">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold">{currentInitiative.title}</h2>
                  <p className="text-nil-light-blue text-lg">{currentInitiative.subtitle}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-200 text-lg leading-relaxed">
                {currentInitiative.description}
              </p>

              {/* Key Benefits */}
              <div>
                <h3 className="text-xl font-semibold mb-3 text-nil-orange">Key Benefits:</h3>
                <ul className="space-y-2">
                  {currentInitiative.keyBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-nil-orange rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-200">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Link
                to={currentInitiative.href}
                onClick={handleClose}
                className="inline-flex items-center space-x-2 bg-nil-orange hover:bg-nil-orange/90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <span>{currentInitiative.ctaText}</span>
                <ExternalLink size={18} />
              </Link>
            </div>

            {/* Right Column - Stats */}
            {currentInitiative.stats && (
              <div className="lg:pl-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-semibold mb-4 text-center">Quick Stats</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {currentInitiative.stats.map((stat, index) => (
                      <div key={index} className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl md:text-3xl font-bold text-nil-orange mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-300">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/20">
            <button
              onClick={handlePrev}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200"
              aria-label="Previous initiative"
            >
              <ChevronLeft size={20} />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Dots Indicator */}
            <div className="flex space-x-2">
              {initiatives.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    currentStep === index 
                      ? 'bg-nil-orange scale-125' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to initiative ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200"
              aria-label="Next initiative"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Initiative Counter */}
          <div className="text-center mt-4">
            <span className="text-sm text-gray-300">
              {currentStep + 1} of {initiatives.length} Initiatives
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitiativePopup;
