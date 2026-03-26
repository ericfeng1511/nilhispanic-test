const AthleteSpotlight = () => {
  const stats = [
    { value: "1,100+", label: "Latino & Latina College Student-Athletes" },
    { value: "2.1M+", label: "Combined Followers" },
    { value: "100+ / 22", label: "Universities | States" },
    { value: "57% / 43%", label: "Latino | Latina" },
  ];

  return (
    <section
      id="our-network"
      className="py-32 bg-nil-navy"
    >
      <div className="container-custom">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">OUR NETWORK</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="border border-white/15 rounded-lg p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-nil-orange/50"
            >
              <p className="text-4xl md:text-5xl font-bold text-nil-orange mb-3">{stat.value}</p>
              <p className="text-gray-300 text-lg">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
            Multi-sport representation across soccer, football, basketball, track, softball, baseball, and more.
          </p>
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
            Our student-athletes reach families, teammates, youth clubs, and local communities — creating multiplier effects that outperform traditional influencers.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AthleteSpotlight;
