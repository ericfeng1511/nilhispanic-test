import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PackagesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">

        {/* ── HERO ── */}
        <section className="bg-nil-navy pt-28 pb-20">
          <div className="container-custom">
            <div className="md:w-1/2 mt-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-100">
                STRUCTURED <span className="heading-gradient-light">HISPANIC</span> REACH.
              </h1>
              <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-xl">
                200–500 Hispanic college student-athletes organized across major U.S. markets. Authentic content. Proven cultural trust. Built for brands that need real penetration — not impressions.
              </p>
              <Link to="/for-brands">
                <Button size="lg" className="btn-primary hover:bg-nil-orange/90 transition-colors text-lg px-10 py-6">
                  Schedule a Call
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── RATE MODEL ── */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient">THE MODEL</h2>
              <p className="text-nil-dark-gray max-w-2xl mx-auto text-lg">
                Two simple rates. One transparent fee structure. Total brand cost is always 2× HSA compensation — no hidden markups, no talent arbitrage.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: "Content Rate", value: "$250", sub: "per post or reel / per HSA" },
                { label: "Onsite Rate", sub2: "Influencer-Staffer™", value: "$50", sub: "per hour / per HSA" },
                { label: "Fee Structure", value: "50 / 50", sub: "50% HSA pay · 50% ÑILH fee" },
                { label: "Transparency", value: "2×", sub: "Total brand cost equals 2× HSA compensation. Always." },
              ].map((item) => (
                <div key={item.label} className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <p className="text-sm font-semibold text-nil-dark-gray uppercase tracking-wide mb-1">{item.label}</p>
                  {item.sub2 && <p className="text-xs text-nil-orange mb-3">{item.sub2}</p>}
                  <p className="text-4xl font-bold text-nil-orange my-3">{item.value}</p>
                  <p className="text-gray-600 text-sm">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CHISPA PILOT ── */}
        <section className="py-16 md:py-24 bg-nil-navy">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">ENTRY POINT</h2>
              <p className="text-gray-300 max-w-xl mx-auto text-lg">Start small. Prove the model. Scale with confidence.</p>
            </div>
            <div className="max-w-3xl mx-auto border border-white/15 rounded-lg p-8 hover:border-nil-orange/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-nil-orange text-white text-xs font-semibold px-3 py-1 rounded uppercase tracking-wide">Pilot Program</span>
              </div>
              <h3 className="text-4xl font-bold text-white mb-1">CHISPA</h3>
              <p className="text-gray-400 text-base mb-8">Low-risk proof of concept. One market. Real athletes. Real results.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {[
                  { value: "5 HSAs", label: "Single market" },
                  { value: "1 Reel Each", label: "+ 4 hrs onsite" },
                  { value: "3–4 Weeks", label: "Campaign window" },
                  { value: "Post-Pilot", label: "Analytics + upgrade path" },
                ].map((s) => (
                  <div key={s.value} className="text-center">
                    <p className="text-nil-orange font-bold text-lg">{s.value}</p>
                    <p className="text-gray-400 text-sm mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-5xl font-bold text-white leading-none">$5,000</p>
                  <p className="text-gray-400 text-sm mt-1">Total Investment · Minimum Floor</p>
                  <p className="text-gray-500 text-xs mt-3 leading-relaxed">
                    5 × $250 (reel) = $1,250 &nbsp;·&nbsp; 5 × 4 × $50 (onsite) = $1,000<br />
                    HSA Total: $2,500 → 2× = <span className="text-nil-orange">$5,000</span>
                  </p>
                </div>
                <Link to="/for-brands">
                  <Button size="lg" className="btn-primary hover:bg-nil-orange/90 transition-colors text-lg px-10 py-6 whitespace-nowrap">
                    Start with a Pilot →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3 CANONICAL PACKAGES ── */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient">CANONICAL PACKAGES</h2>
              <p className="text-nil-dark-gray max-w-2xl mx-auto text-lg">Three structured options from single-market entry to national season-long integration.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

              {/* 01 ENTRADA */}
              <div className="bg-white rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden">
                <div className="bg-nil-navy px-6 py-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">01 / Market Entry</p>
                  <h3 className="text-3xl font-bold text-white">ENTRADA</h3>
                  <p className="text-gray-400 text-sm mt-1">Single-market validation. Proven before you scale.</p>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-6">
                    <p className="text-5xl font-bold text-nil-navy leading-none">$15,000</p>
                    <p className="text-gray-400 text-xs uppercase tracking-wide mt-1">Total Investment</p>
                  </div>
                  <div className="divide-y divide-gray-100 mb-6">
                    {[
                      ["HSAs", "10 athletes"],
                      ["Markets", "1 city / DMA"],
                      ["Content", "2 posts or reels each"],
                      ["Onsite", "4 hrs / HSA"],
                      ["Duration", "4–6 weeks"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2.5">
                        <span className="text-gray-500 text-sm">{k}</span>
                        <span className="text-nil-navy text-sm font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-nil-dark-gray uppercase tracking-wide mb-3">Included</p>
                  <ul className="flex-1 space-y-2 mb-6">
                    {[
                      "HSA sourcing, vetting & contracting",
                      "Campaign brief + content guidelines",
                      "Posting coordination & compliance review",
                      "Post-campaign performance report",
                      "Influencer-Staffer™ onsite deployment",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="text-nil-orange mt-0.5 leading-none font-bold">•</span>
                        <span className="text-gray-600 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-gray-50 rounded p-3 text-xs text-gray-500 leading-relaxed mb-6">
                    10 × 2 reels × $250 = $5,000<br />
                    10 × 4 hrs × $50 = $2,000<br />
                    HSA: $7,500 → 2× = <span className="text-nil-orange font-semibold">$15,000</span>
                  </div>
                  <div className="flex flex-col gap-2 mt-auto">
                    <Link to="/for-brands"><Button className="btn-primary w-full">Schedule a 20-Min Call</Button></Link>
                    <Link to="/for-brands"><Button variant="outline" className="btn-secondary w-full">Download One-Pager</Button></Link>
                  </div>
                </div>
              </div>

              {/* 02 CAMPO — featured */}
              <div className="bg-nil-navy rounded-lg shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden border border-nil-orange/40">
                <div className="bg-nil-orange px-6 py-4">
                  <p className="text-orange-100 text-xs uppercase tracking-wide mb-1">02 / Multi-Market · Most Popular</p>
                  <h3 className="text-3xl font-bold text-white">CAMPO</h3>
                  <p className="text-orange-100 text-sm mt-1">Sustained, multi-city presence. Built to move product.</p>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-6">
                    <p className="text-5xl font-bold text-nil-orange leading-none">$54,000</p>
                    <p className="text-gray-400 text-xs uppercase tracking-wide mt-1">Total Investment</p>
                  </div>
                  <div className="divide-y divide-white/10 mb-6">
                    {[
                      ["HSAs", "15 / market"],
                      ["Markets", "3 cities / DMAs"],
                      ["Content", "3 posts or reels each"],
                      ["Onsite", "8 hrs / HSA"],
                      ["Duration", "8–10 weeks"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2.5">
                        <span className="text-gray-400 text-sm">{k}</span>
                        <span className="text-white text-sm font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Included</p>
                  <ul className="flex-1 space-y-2 mb-6">
                    {[
                      "Everything in Entrada",
                      "Multi-DMA HSA coordination",
                      "Dedicated campaign manager",
                      "Brand integration briefing session",
                      "Mid-campaign optimization check",
                      "Full analytics: reach, engagement, sentiment",
                      "Influencer-Staffer™ across all 3 markets",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="text-nil-orange mt-0.5 leading-none font-bold">•</span>
                        <span className="text-gray-300 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-black/30 rounded p-3 text-xs text-gray-400 leading-relaxed mb-6">
                    45 posts × $250 = $11,250<br />
                    15 × 8 hrs × $50 × 3 mkts = $18,000<br />
                    Blended total → <span className="text-nil-orange font-semibold">$54,000</span>
                  </div>
                  <div className="flex flex-col gap-2 mt-auto">
                    <Link to="/for-brands"><Button size="lg" className="btn-primary w-full hover:bg-nil-orange/90">Schedule a 20-Min Call</Button></Link>
                    <Link to="/for-brands"><Button variant="ghost" className="w-full text-gray-400 hover:text-white">Download One-Pager</Button></Link>
                  </div>
                </div>
              </div>

              {/* 03 NACIÓN */}
              <div className="bg-white rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden">
                <div className="bg-nil-navy px-6 py-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">03 / National</p>
                  <h3 className="text-3xl font-bold text-white">NACIÓN</h3>
                  <p className="text-gray-400 text-sm mt-1">National footprint. Season-long brand integration.</p>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-6">
                    <p className="text-5xl font-bold text-nil-navy leading-none">$150K<span className="text-2xl text-gray-400">+</span></p>
                    <p className="text-gray-400 text-xs uppercase tracking-wide mt-1">Total Investment · Custom Scoped</p>
                  </div>
                  <div className="divide-y divide-gray-100 mb-6">
                    {[
                      ["HSAs", "50+ athletes"],
                      ["Markets", "5–8 cities / DMAs"],
                      ["Content", "4+ posts or reels each"],
                      ["Onsite", "12+ hrs / HSA"],
                      ["Duration", "Quarter or full season"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2.5">
                        <span className="text-gray-500 text-sm">{k}</span>
                        <span className="text-nil-navy text-sm font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-nil-dark-gray uppercase tracking-wide mb-3">Included</p>
                  <ul className="flex-1 space-y-2 mb-6">
                    {[
                      "Everything in Campo",
                      "National HSA roster — sport, gender, school segmented",
                      "Co-branded editorial calendar",
                      "Dedicated account lead + weekly reporting",
                      "World Cup / tentpole event integration",
                      "Data intelligence: reach, purchase intent, cultural lift",
                      "Influencer-Staffer™ scaled nationally",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="text-nil-orange mt-0.5 leading-none font-bold">•</span>
                        <span className="text-gray-600 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-gray-50 rounded p-3 text-xs text-gray-500 leading-relaxed mb-6">
                    50 × 4 reels × $250 = $50,000<br />
                    50 × 12 hrs × $50 = $30,000<br />
                    HSA: $80,000 → 2× = <span className="text-nil-orange font-semibold">$160,000 baseline</span>
                  </div>
                  <div className="flex flex-col gap-2 mt-auto">
                    <Link to="/for-brands"><Button className="btn-primary w-full">Request a Proposal</Button></Link>
                    <Link to="/for-brands"><Button variant="outline" className="btn-secondary w-full">Schedule a Discovery Call</Button></Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── HECHO A MEDIDA ── */}
        <section className="py-16 md:py-24 bg-nil-navy">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">HECHO A MEDIDA</h2>
              <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                Your market. Your athlete count. Your content mix. Priced from the rate card up — no minimums guessed, no budget wasted.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              {/* Left — rates + CTA */}
              <div>
                <div className="border-l-4 border-nil-orange/60 bg-white/5 px-5 py-4 mb-8">
                  <p className="text-gray-300 text-sm leading-relaxed italic">
                    We publish our rates because we have nothing to hide. HSAs earn half. We earn half. The value is in the network we've built — not a margin we're protecting.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "Content", value: "$250", desc: "per post or reel / per HSA" },
                    { label: "Onsite (Influencer-Staffer™)", value: "$50", desc: "per hour / per HSA" },
                    { label: "HSA Pay", value: "50%", desc: "always direct to athletes" },
                    { label: "ÑILH Fee", value: "50%", desc: "platform, management & ops" },
                  ].map((cell) => (
                    <div key={cell.label} className="border border-white/15 rounded-lg p-5 hover:border-nil-orange/50 transition-all duration-300">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">{cell.label}</p>
                      <p className="text-3xl font-bold text-nil-orange leading-none mb-1">{cell.value}</p>
                      <p className="text-gray-400 text-xs">{cell.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-gray-300 text-sm mb-6 border border-nil-orange/30 rounded p-3 bg-nil-orange/5">
                  <span className="font-semibold text-nil-orange">Minimum engagement: $5,000</span> (Chispa Pilot). Below this threshold, operational quality cannot be guaranteed.
                </p>
                <Link to="/for-brands">
                  <Button size="lg" className="btn-primary hover:bg-nil-orange/90 transition-colors text-lg px-10 py-6">
                    Build Your Package →
                  </Button>
                </Link>
              </div>

              {/* Right — config list + example calc */}
              <div>
                <div className="border border-white/15 rounded-lg p-8 hover:border-nil-orange/50 transition-all duration-300 mb-8">
                  <h3 className="text-xl font-bold text-white mb-5">What You Configure</h3>
                  <ul className="space-y-3">
                    {[
                      "Number of HSAs (5 minimum per market)",
                      "Markets / DMAs — single city or national sweep",
                      "Content type: posts, reels, stories, bilingual",
                      "Sport, gender, or school targeting (HSI, HBCU)",
                      "Onsite hours: retail, events, sampling, grassroots",
                      "Timing: one-time activation or multi-wave",
                      "World Cup, Liga MX, or tentpole event alignment",
                      "Latina athlete cohort or flag football integration",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="text-nil-orange mt-0.5 leading-none font-bold">•</span>
                        <span className="text-gray-300 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border border-white/15 rounded-lg p-6">
                  <p className="text-nil-orange font-semibold text-sm uppercase tracking-wide mb-4">Example — 15 HSAs / 1 Market</p>
                  <div className="space-y-2 text-sm">
                    {[
                      ["15 HSA × 1 reel × $250", "$3,750"],
                      ["15 HSA × 4 hrs × $50", "$3,000"],
                      ["HSA Compensation Total", "$6,750"],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between text-gray-400">
                        <span>{label}</span><span>{val}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-white font-bold border-t border-white/10 pt-3 mt-2">
                      <span>Total Brand Investment (2×)</span><span className="text-nil-orange">$13,500</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── FOOTER NOTE + CONTACT ── */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h3 className="text-xl font-bold text-nil-navy mb-3">Influencer-Staffer™</h3>
                <p className="text-nil-dark-gray leading-relaxed mb-4">
                  A proprietary ÑIL Hispanic™ model. Unlike standard event staff, our HSAs are active social influencers within their community — deployed onsite while simultaneously promoting to their own networks. You get the physical presence and the digital amplification in one hire.
                </p>
                <h3 className="text-xl font-bold text-nil-navy mb-3">All Packages Include</h3>
                <ul className="space-y-2">
                  {[
                    "NIL-compliant contracts",
                    "HSA direct pay",
                    "Campaign oversight",
                    "Post-campaign reporting",
                    "No agency commissions on top — what you see is what you pay",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-nil-orange mt-0.5 leading-none font-bold">•</span>
                      <span className="text-nil-dark-gray text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-nil-navy rounded-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Start the Conversation</h3>
                <div className="space-y-4 mb-8">
                  <div>
                    <p className="text-nil-orange text-sm font-semibold mb-1">Website</p>
                    <a href="https://nilhispanic.com" className="text-white hover:text-nil-orange transition-colors">NILHispanic.com</a>
                  </div>
                  <div>
                    <p className="text-nil-orange text-sm font-semibold mb-1">Email</p>
                    <a href="mailto:anthony@nilhispanic.com" className="text-white hover:text-nil-orange transition-colors">anthony@nilhispanic.com</a>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-6">20-min calls via Calendly — no form, no wait.</p>
                <Link to="/for-brands">
                  <Button size="lg" className="btn-primary hover:bg-nil-orange/90 transition-colors w-full text-lg py-6">
                    Book a Meeting
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default PackagesPage;
