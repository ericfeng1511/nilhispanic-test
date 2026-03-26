const brands = [
  {
    name: "NFL",
    campaign: null,
    summary:
      "Activated HSAs for Latino Youth Honors and Latinos in Sports events. Mobilized Hispanic communities for Mexico–U.S. flag football game. Executed targeted NFL Experience ticket campaigns.",
  },
  {
    name: "Lowe's",
    campaign: '"Move Like Messi"',
    summary:
      "30+ bilingual HSAs. 10 activations. 3 states. Multi-weekend execution with hands-on family engagement.",
  },
  {
    name: "Chevron",
    campaign: "Soccer Academy",
    summary:
      "Integrated Latina college soccer HSAs as coaches and role models. Community impact + brand integration.",
  },
  {
    name: "Raising Cane's",
    campaign: null,
    summary:
      "Managed HSAs for NY/NJ store launch campaign. Delivered high-performing social content and local Hispanic reach.",
  },
];

const whyBullets = [
  "The only national-scale Hispanic college athlete network",
  "Built for multi-market activation",
  "Designed for brand and agency execution",
  "Proven across social and live experiential campaigns",
];

const OurWorkSection = () => {
  return (
    <section className="relative py-32 bg-nil-navy">
      {/* Fade from How We Deliver Performance section above */}
      <div className="absolute -top-24 inset-x-0 h-24 bg-gradient-to-b from-transparent to-nil-navy pointer-events-none z-10" />

      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left column — Our Work */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold heading-gradient-light mb-10">OUR WORK</h2>
            <div className="flex flex-col gap-6">
              {brands.map((brand, i) => (
                <div
                  key={i}
                  className="border border-white/15 rounded-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:border-nil-orange/50 flex flex-col gap-3"
                >
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-white font-bold text-xl leading-none">{brand.name}</span>
                    {brand.campaign && (
                      <span className="text-nil-orange text-sm font-medium">{brand.campaign}</span>
                    )}
                  </div>
                  <div className="w-8 h-px bg-nil-orange/60" />
                  <p className="text-gray-300 text-sm leading-relaxed">{brand.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — Why ÑIL Hispanic */}
          <div className="lg:sticky lg:top-32">
            <h2 className="text-3xl md:text-4xl font-bold heading-gradient-light mb-10">
              WHY ÑIL HISPANIC
            </h2>

            <ul className="flex flex-col gap-5 mb-12">
              {whyBullets.map((point, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="text-nil-orange text-lg mt-0.5 leading-none">•</span>
                  <span className="text-gray-300 text-lg leading-snug">{point}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 pt-8">
              <p className="text-2xl md:text-3xl font-bold text-white leading-tight">
                REAL ATHLETES.<br />
                <span className="heading-gradient-light">REAL IMPACT.</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default OurWorkSection;
