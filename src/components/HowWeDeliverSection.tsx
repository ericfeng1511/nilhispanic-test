const HowWeDeliverSection = () => {
  const metrics = [
    { value: "8–9×", label: "Non-Follower Discovery" },
    { value: "Top 5%", label: "Engagement Rates" },
  ];

  const features = [
    {
      heading: "Cultural Credibility",
      body: "Authentic trust that paid media cannot replicate — built by athletes already embedded in their communities.",
    },
    {
      heading: "Scalable Campaign Model",
      body: "Deploy with 5 or 500 athletes across markets without adding operational complexity.",
    },
  ];

  return (
    <section
      className="relative py-32 bg-cover bg-no-repeat md:bg-fixed"
      style={{ backgroundImage: "url('/images/homepage-background-img.jpg')", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/90 via-nil-navy/75 to-nil-navy/60 z-0" />
      {/* Fade from Our Network section above */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-nil-navy to-transparent pointer-events-none z-10" />
      <div className="relative z-10 container-custom">

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold heading-gradient-light">
            HOW WE DELIVER PERFORMANCE
          </h2>
        </div>

        {/* Subtext */}
        <p className="text-gray-400 text-lg md:text-xl leading-relaxed text-center max-w-2xl mx-auto mb-16">
          Hispanic student-athletes are primarily micro- and nano-creators aggregated to deliver
          macro-level impact at micro-level cost.
        </p>

        {/* Metric stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto mb-10">
          {metrics.map((item, i) => (
            <div
              key={i}
              className="border border-white/15 rounded-lg p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-nil-orange/50"
            >
              <p className="text-4xl md:text-5xl font-bold text-nil-orange mb-3">{item.value}</p>
              <p className="text-gray-300 text-lg">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {features.map((item, i) => (
            <div
              key={i}
              className="border border-white/15 border-l-nil-orange border-l-4 rounded-lg p-8 transition-all duration-300 hover:-translate-y-2 hover:border-nil-orange/50"
            >
              <p className="text-white font-bold text-xl mb-2">{item.heading}</p>
              <p className="text-gray-400 text-base leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowWeDeliverSection;
