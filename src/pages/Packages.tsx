import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ContactForm } from "@/components/ContactForm";

const ContactDialog = ({ label, description, children }: { label: string; description: string; children: React.ReactNode }) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{label}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <ContactForm />
    </DialogContent>
  </Dialog>
);

const PackagesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">

        {/* ── SECTION HEADER ── */}
        <section className="bg-nil-navy pt-28 pb-20">
          <div className="container-custom">
            <div className="text-center mt-10">
              <p className="text-nil-orange text-xs font-semibold uppercase tracking-widest mb-4">ÑIL Hispanic · Brand Packages</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-100">
                Reach the Market<br />
                <span className="heading-gradient-light">They Trust.</span>
              </h1>
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
                Organized Hispanic college student-athletes across 100+ universities in 22 states. Authentic content. Measurable campaigns. Built for brands that need real penetration — not just impressions.
              </p>
            </div>
          </div>
        </section>

        {/* ── CHISPA PILOT BANNER ── */}
        <section className="py-12 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="bg-orange-50 border border-orange-200 border-l-4 border-l-nil-orange rounded-lg p-8 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-8 items-center relative overflow-hidden">
              {/* Watermark */}
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl font-black text-nil-orange/5 pointer-events-none select-none hidden md:block">CHISPA</span>

              {/* Left */}
              <div>
                <span className="inline-block bg-nil-orange text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded mb-3">Pilot · Entry Point</span>
                <h2 className="text-4xl font-black uppercase tracking-wide text-nil-navy mb-1">Chispa</h2>
                <p className="text-gray-500 text-sm font-light">Low-risk proof of concept. One market. Real athletes. Real results.</p>
              </div>

              {/* Middle — specs */}
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                {[
                  ["HSAs", "5 athletes"],
                  ["Market", "1 city / DMA"],
                  ["Content", "1 reel each"],
                  ["Onsite", "4 hrs / HSA"],
                  ["Duration", "3–4 weeks"],
                  ["Includes", "IS™ · Analytics · Upgrade path"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-nil-navy">{val}</p>
                  </div>
                ))}
              </div>

              {/* Right — price + CTA */}
              <div className="flex flex-col items-start md:items-end gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Total investment</p>
                  <p className="text-5xl font-black text-nil-orange leading-none">$5,000</p>
                </div>
                <ContactDialog label="Start with a Pilot" description="Tell us about your brand and we'll get your Chispa pilot started.">
                  <Button className="bg-nil-orange text-white hover:bg-nil-orange/90 font-semibold uppercase tracking-wide text-xs px-6 py-3 h-auto rounded whitespace-nowrap">
                    Start with a Pilot
                  </Button>
                </ContactDialog>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3 CANONICAL PACKAGES ── */}
        <section className="pb-0 pt-4 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">Campaign Packages</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">

              {/* 01 ENTRADA */}
              <div className="bg-white border border-gray-200 border-l-[3px] border-l-gray-300 rounded flex flex-col overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-1 bg-gray-300" />
                <div className="p-7 flex flex-col flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">01 · Market Entry</p>
                  <h3 className="text-4xl font-black uppercase tracking-wide text-nil-navy mb-1">Entrada</h3>
                  <p className="text-sm font-light text-gray-500 mb-5 pb-5 border-b border-gray-100">Single-market validation. Proven before you scale.</p>
                  <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Total investment</p>
                    <p className="text-5xl font-black text-nil-navy leading-none">$15,000</p>
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-gray-100 rounded overflow-hidden mb-5">
                    {[
                      ["HSAs", "10 athletes"],
                      ["Market", "1 city / DMA"],
                      ["Content", "2 posts / reels ea"],
                      ["Onsite", "4 hrs / HSA"],
                      ["Duration", "4–6 weeks"],
                      ["Analytics", "Post-campaign"],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-white px-3 py-2.5">
                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">{k}</p>
                        <p className="text-sm font-semibold text-nil-navy">{v}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Included</p>
                  <ul className="flex-1 space-y-2 mb-6">
                    {[
                      "HSA sourcing, vetting & contracting",
                      "Campaign brief + content guidelines",
                      "Posting coordination & compliance",
                      "Influencer-Staffer™ onsite deployment",
                      "Post-campaign performance report",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600 border-b border-gray-50 pb-2 last:border-0">
                        <span className="text-nil-orange font-bold mt-0.5 flex-shrink-0">+</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <ContactDialog label="Get Started — Entrada" description="Let's get your single-market campaign started.">
                    <Button variant="outline" className="w-full uppercase tracking-widest text-xs font-semibold border-gray-200 text-gray-500 hover:border-nil-navy hover:text-nil-navy h-11">
                      Get Started
                    </Button>
                  </ContactDialog>
                </div>
              </div>

              {/* 02 CAMPO — featured */}
              <div className="bg-white border border-l-[3px] border-nil-orange rounded flex flex-col overflow-hidden shadow-lg shadow-nil-orange/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-1 bg-nil-orange" />
                <div className="p-7 flex flex-col flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-nil-orange mb-2">02 · Multi-Market  ★ Most Popular</p>
                  <h3 className="text-4xl font-black uppercase tracking-wide text-nil-orange mb-1">Campo</h3>
                  <p className="text-sm font-light text-gray-500 mb-5 pb-5 border-b border-gray-100">Sustained, multi-city presence. Built to move product.</p>
                  <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Total investment</p>
                    <p className="text-5xl font-black text-nil-orange leading-none">$54,000</p>
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-gray-100 rounded overflow-hidden mb-5">
                    {[
                      ["HSAs", "15 / market"],
                      ["Markets", "3 cities / DMAs"],
                      ["Content", "3 posts / reels ea"],
                      ["Onsite", "8 hrs / HSA"],
                      ["Duration", "8–10 weeks"],
                      ["Analytics", "Full + mid-opt"],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-white px-3 py-2.5">
                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">{k}</p>
                        <p className="text-sm font-semibold text-nil-navy">{v}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Included</p>
                  <ul className="flex-1 space-y-2 mb-6">
                    {[
                      "Everything in Entrada",
                      "Multi-DMA HSA coordination",
                      "Dedicated campaign manager",
                      "Brand integration briefing session",
                      "Mid-campaign optimization check",
                      "Reach, engagement & sentiment report",
                      "Influencer-Staffer™ across all 3 markets",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600 border-b border-gray-50 pb-2 last:border-0">
                        <span className="text-nil-orange font-bold mt-0.5 flex-shrink-0">+</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <ContactDialog label="Get Started — Campo" description="Let's build your multi-market campaign.">
                    <Button className="w-full bg-nil-orange text-white hover:bg-nil-orange/90 uppercase tracking-widest text-xs font-semibold h-11">
                      Get Started
                    </Button>
                  </ContactDialog>
                </div>
              </div>

              {/* 03 NACIÓN */}
              <div className="bg-white border border-gray-200 border-l-[3px] border-l-nil-navy rounded flex flex-col overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-1 bg-nil-navy" />
                <div className="p-7 flex flex-col flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">03 · National</p>
                  <h3 className="text-4xl font-black uppercase tracking-wide text-nil-navy mb-1">Nación</h3>
                  <p className="text-sm font-light text-gray-500 mb-5 pb-5 border-b border-gray-100">National footprint. Season-long brand integration.</p>
                  <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Starting at</p>
                    <p className="text-5xl font-black text-nil-navy leading-none">$150,000</p>
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-gray-100 rounded overflow-hidden mb-5">
                    {[
                      ["HSAs", "50+ athletes"],
                      ["Markets", "5–8 cities / DMAs"],
                      ["Content", "4+ posts / reels ea"],
                      ["Onsite", "12+ hrs / HSA"],
                      ["Duration", "Quarter / Season"],
                      ["Analytics", "Weekly + data intel"],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-white px-3 py-2.5">
                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">{k}</p>
                        <p className="text-sm font-semibold text-nil-navy">{v}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Included</p>
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
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600 border-b border-gray-50 pb-2 last:border-0">
                        <span className="text-nil-orange font-bold mt-0.5 flex-shrink-0">+</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <ContactDialog label="Request a Proposal — Nación" description="Let's scope your national campaign.">
                    <Button variant="outline" className="w-full uppercase tracking-widest text-xs font-semibold border-gray-200 text-gray-500 hover:border-nil-navy hover:text-nil-navy h-11">
                      Request a Proposal
                    </Button>
                  </ContactDialog>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── HECHO A MEDIDA STRIP ── */}
        <section className="bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image pb-16">
          <div className="container-custom">
            <div className="bg-nil-navy rounded mt-4 p-10 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-10 items-center relative overflow-hidden">
              {/* Watermark */}
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl font-black text-nil-orange/5 pointer-events-none select-none hidden lg:block whitespace-nowrap">HECHO A MEDIDA</span>

              {/* Left */}
              <div>
                <span className="inline-block bg-nil-orange/20 border border-nil-orange/30 text-nil-orange text-xs font-bold uppercase tracking-widest px-3 py-1 rounded mb-3">Customized</span>
                <h2 className="text-4xl font-black uppercase tracking-wide text-nil-orange mb-3">Hecho a Medida</h2>
                <p className="text-gray-400 text-sm font-light leading-relaxed max-w-sm">
                  Not every brand fits a standard package. Define your market, athlete count, content mix, and activation hours — we scope it, price it, and execute it.
                </p>
              </div>

              {/* Middle — config */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/25 mb-4">What You Configure</p>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    "HSA count — 5 minimum per market",
                    "Markets / DMAs — 1 city or national",
                    "Content: posts, reels, stories, bilingual",
                    "Sport, gender, or school targeting",
                    "Onsite: retail, events, sampling, grassroots",
                    "World Cup / Liga MX / tentpole alignment",
                    "Latina cohort or flag football integration",
                    "One-time activation or multi-wave campaign",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-white/60 font-light leading-snug">
                      <span className="text-nil-orange mt-0.5 flex-shrink-0">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — floor + CTA */}
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/25 mb-1">Minimum engagement</p>
                  <p className="text-3xl font-black text-nil-orange leading-none">$5,000</p>
                </div>
                <ContactDialog label="Build Your Package" description="Tell us your goals and we'll scope a custom campaign for your brand.">
                  <Button className="bg-nil-orange text-white hover:bg-nil-orange/90 uppercase tracking-widest text-xs font-semibold px-6 py-3 h-auto rounded whitespace-nowrap">
                    Build Your Package
                  </Button>
                </ContactDialog>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTNOTE ── */}
        <section className="py-10 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image border-t border-gray-200">
          <div className="container-custom flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <p className="text-xs text-gray-400 font-light leading-relaxed max-w-2xl">
              <span className="text-gray-500 font-semibold">Influencer-Staffer™</span> is a proprietary ÑIL Hispanic model. HSAs are deployed onsite while simultaneously promoting to their own social networks — physical presence and digital amplification in one hire. All packages include NIL-compliant contracts, HSA compensation, campaign oversight, and post-campaign analytics.
            </p>
            <a href="https://nilhispanic.com" className="text-nil-orange font-bold text-lg uppercase tracking-widest hover:text-nil-navy transition-colors flex-shrink-0">
              NILHispanic.com
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default PackagesPage;
