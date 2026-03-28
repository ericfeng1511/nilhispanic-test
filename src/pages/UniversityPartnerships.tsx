import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ContactForm } from '@/components/ContactForm';
import { GraduationCap, Trophy, Users, Star, Shield, TrendingUp, Building, Search, Globe, CheckCircle } from 'lucide-react';

const UniversityPartnershipsPage = () => {

  const differentiators = [
    {
      icon: GraduationCap,
      title: "Exclusive HSA Identity",
      description: "Every NIL platform treats Hispanic athletes as a segment. We are organized entirely around Hispanic cultural identity as the product. That infrastructure took years to build and cannot be replicated.",
    },
    {
      icon: Trophy,
      title: "All Sports, All Divisions",
      description: "Football, basketball, soccer, volleyball, baseball, track, wrestling. The only structured HSA network spanning revenue and non-revenue sports across all divisions.",
    },
    {
      icon: Building,
      title: "Relationships with Top Brands",
      description: "CPG, financial services, automotive, apparel, QSR, and telecom — active brand relationships your HSAs can't access through any other NIL channel.",
    },
    {
      icon: Search,
      title: "A Permanent, Searchable HSA Asset",
      description: "Every HSA profile is a documented, reviewable asset. When brands target your school's Hispanic athletes across any sport, your program has infrastructure. Without us, it does not exist.",
    },
    {
      icon: Globe,
      title: "The Decade-Defining Event Window",
      description: "FIFA World Cup 2026, FIFA Women's World Cup 2027, LA28 Summer Olympics. Hispanics will drive 1 in 3 dollars of U.S. sports market growth through 2035.",
    },
    {
      icon: Star,
      title: "First-Mover Status",
      description: "Early partner schools receive preferred logo placement and a seat at the table as we build the conference-level partnership model. The window to be a first-mover is open — but it closes.",
    },
  ];

  const levels = [
    {
      number: "01",
      tag: "Free · Start This Week",
      title: "Network Partner",
      price: "No Cost",
      description: "We add your school to the ÑIL Hispanic network at no cost. Your logo appears in ÑIL Hispanic marketing materials as an Official Network Partner.",
      pitch: "Tell HSA recruits: 'We have a dedicated NIL platform for our Hispanic athletes, and national brands are already looking.' No program can say that without us.",
      includes: [
        "HSAs create a profile; we review and reach out when a brand campaign fits",
        "Official Network Partner designation",
        "Your logo on NILHispanic.com and our sales & marketing materials",
      ],
    },
    {
      number: "02",
      tag: "Paid Engagement",
      title: "Hispanic NIL Advisory",
      price: "Paid Engagement",
      priceSub: "tiered by HSA roster",
      description: "We work directly with your HSAs across all sports and your staff. Structured, school-specific advisory built around who these athletes are.",
      pitch: null,
      includes: [
        "1-on-1 HSA onboarding: NIL education, compliance walkthrough, family briefings",
        "Brand fit assessments by sport (revenue and non-revenue)",
        "Coach + compliance workshops on Hispanic cultural dynamics and NIL",
        "HSA community-building: networking, mentorship, career touchpoints",
      ],
    },
    {
      number: "03",
      tag: "Revenue Generating",
      title: "Co-Branded Campaign Partner",
      price: "Revenue Flows to Your AD",
      description: "Your marks appear in brand campaigns creative alongside your HSAs. Revenue flows to your athletic department.",
      pitch: null,
      includes: [
        "University marks in brand campaign creative and materials",
        "School receives campaign activation fee per engagement",
        "Royalty on school-attributed NIL revenue (rate agreed in writing)",
        "ÑIL Hispanic manages all brand relationships, compliance, and activation",
      ],
    },
  ];

  const marketStats = [
    { value: "71M", label: "U.S. Hispanics", sub: "Largest minority, fastest-growing consumer group" },
    { value: "$4T", label: "Hispanic Market", sub: "5th largest economy if standalone" },
    { value: "72%", label: "Gen Z or Millennials", sub: "Of Hispanic sports fans" },
    { value: "63%", label: "Want Cultural Content", sub: "Of Hispanics seek content reflecting their identity" },
    { value: "$45B", label: "Sports Market Growth", sub: "Attributed to Hispanics through 2035" },
    { value: "+70%", label: "HSA Growth", sub: "In Hispanic student-athlete participation over the last decade" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">

        {/* HERO */}
        <HeroSection
          title={<>UNIVERSITY <span className="heading-gradient-light">PARTNERSHIP PROGRAM</span></>}
          subtitle="The only agency-platform connecting Hispanic college athletes to national brands across every sport — at no cost to your program."
          backgroundImageUrl="/images/athlete-test-img-15.jpg"
          backgroundPosition="right"
          className="pb-96"
        />

        {/* OVERVIEW STATS */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-6">YOUR HISPANIC STUDENT-ATHLETES ARE ACROSS THE ENTIRE PROGRAM</h2>
              <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                Football. Basketball. Soccer. Baseball. Track. Wrestling. Volleyball. We are the only structured NIL network built exclusively for Hispanic student-athletes across all sports and all divisions.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-16">
              {[
                { value: "100+", label: "Universities" },
                { value: "1,100+", label: "HSAs in Network" },
                { value: "22", label: "States Active" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white p-8 rounded-xl shadow-lg text-center border border-gray-100 hover:shadow-xl transition-shadow">
                  <p className="text-5xl font-bold text-nil-orange mb-2">{stat.value}</p>
                  <p className="text-nil-navy font-semibold text-lg">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <Trophy className="w-8 h-8 text-nil-orange mr-4" />
                  <h3 className="text-2xl font-semibold text-nil-navy">Revenue Sports</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Hispanic players are on your football and basketball rosters — athletes with direct cultural reach into the $4T Hispanic market.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Your revenue-sport sponsors have separate multicultural budgets not being activated through your program. We change that.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <Users className="w-8 h-8 text-nil-orange mr-4" />
                  <h3 className="text-2xl font-semibold text-nil-navy">Non-Revenue Sports — Our Deepest Lane</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  ~38,654 NCAA HSAs in 2024–25, up 62% over 10 years. The majority are in soccer, baseball, track, volleyball, and wrestling.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Revenue sharing directs 85–90% to football and basketball. Commercial NIL is these athletes' only earning path — no one built the infrastructure until now.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* WHY PROGRAMS SHOULD ACT */}
        <section className="relative py-16 md:py-24 bg-[url('/images/athlete-test-img-23.jpg')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/90 via-nil-navy/70 to-nil-orange/60 z-0"></div>
          <div className="relative z-10 container-custom text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">WHY PROGRAMS SHOULD ACT NOW</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-nil-navy/50 backdrop-blur-md p-8 rounded-xl shadow-xl border border-nil-orange/50">
                <div className="flex items-center mb-4">
                  <Shield className="w-8 h-8 text-nil-orange mr-4" />
                  <h3 className="text-xl font-semibold text-nil-orange">Your HSAs Are Watching</h3>
                </div>
                <p className="text-gray-200 leading-relaxed">
                  These athletes arrived on your campus as celebrated members of their communities. When your program has no NIL structure for them, they notice — and so do their families. That shapes your reputation with every Hispanic recruit and family you meet.
                </p>
              </div>
              <div className="bg-nil-navy/50 backdrop-blur-md p-8 rounded-xl shadow-xl border border-nil-orange/50">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-8 h-8 text-nil-orange mr-4" />
                  <h3 className="text-xl font-semibold text-nil-orange">Your Competitors Are Moving</h3>
                </div>
                <p className="text-gray-200 leading-relaxed">
                  Programs that move first will use structured HSA NIL support as a specific, verifiable recruiting tool. Programs that wait won't be able to. The window to be a first-mover is open, but it closes as more programs join.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* THREE LEVELS */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center mb-4">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-4">THREE LEVELS OF ENGAGEMENT</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-12">
                We run the program. You get the credit. No additional staff. No compliance burden. No budget required to start.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {levels.map((level) => (
                <div key={level.number} className={`rounded-lg shadow-lg flex flex-col overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ${level.number === '02' ? 'border border-nil-orange/40' : ''}`}>
                  <div className={`px-6 py-4 ${level.number === '02' ? 'bg-nil-orange' : 'bg-nil-navy'}`}>
                    <p className={`text-xs uppercase tracking-wide mb-1 ${level.number === '02' ? 'text-orange-100' : 'text-gray-400'}`}>{level.number} · {level.tag}</p>
                    <h3 className="text-2xl font-bold text-white">{level.title}</h3>
                    <p className={`text-sm font-semibold mt-1 ${level.number === '02' ? 'text-orange-100' : 'text-nil-orange'}`}>{level.price}</p>
                    {level.priceSub && <p className={`text-xs mt-0.5 ${level.number === '02' ? 'text-orange-200' : 'text-gray-400'}`}>{level.priceSub}</p>}
                  </div>
                  <div className={`p-6 flex flex-col flex-1 ${level.number === '02' ? 'bg-nil-navy' : 'bg-white'}`}>
                    <p className={`text-sm leading-relaxed mb-4 ${level.number === '02' ? 'text-gray-300' : 'text-gray-600'}`}>{level.description}</p>
                    {level.pitch && (
                      <p className={`text-sm italic leading-relaxed mb-4 p-3 rounded ${level.number === '02' ? 'bg-white/10 text-gray-200' : 'bg-nil-orange/10 text-nil-navy'}`}>{level.pitch}</p>
                    )}
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${level.number === '02' ? 'text-gray-400' : 'text-nil-dark-gray'}`}>Included</p>
                    <ul className="space-y-2 flex-1">
                      {level.includes.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="text-nil-orange mt-0.5 leading-none font-bold">•</span>
                          <span className={`text-sm ${level.number === '02' ? 'text-gray-300' : 'text-gray-600'}`}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT ÑIL HISPANIC DELIVERS */}
        <section className="relative py-16 md:py-24 bg-[url('/images/athlete-test-img-6.jpg')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/90 via-nil-navy/70 to-nil-orange/60 z-0"></div>
          <div className="relative z-10 container-custom text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient-light">WHAT ÑIL HISPANIC DELIVERS THAT NO ONE ELSE CAN</h2>
              <p className="text-gray-300 max-w-3xl mx-auto text-lg">
                No general NIL platform, agency, or agent has built what we have built exclusively for Hispanic student-athletes.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {differentiators.map((item, index) => (
                <div key={index} className="bg-nil-navy/50 backdrop-blur-md p-8 rounded-xl shadow-xl border border-nil-orange/50">
                  <div className="flex items-center mb-4">
                    <item.icon className="w-8 h-8 text-nil-orange mr-4 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-nil-orange">{item.title}</h3>
                  </div>
                  <p className="text-gray-200 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CORPORATE DEVELOPMENT OPPORTUNITY */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-nil-light-blue via-nil-orange/30 to-white bg-gradient-with-image">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-4">OPPORTUNITIES YOUR CORPORATE DEVELOPMENT TEAM CAN'T ACCESS ALONE</h2>
              <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
                New inventory to bring to existing partners while also unlocking Hispanic marketing budgets that haven't been accessible before. We're your entry point.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
              <div>
                <h3 className="text-2xl font-bold text-nil-navy mb-4">The Opportunity</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Your corporate sponsors budget their general athletics dollars to your program. We provide new inventory to bring to those same partners. Now your university can deliver Hispanic audience reach through your HSAs.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Most sports sponsors carry a separate multicultural marketing budget managed by a different team with different KPIs. We unlock that too. ÑIL Hispanic is the structured pathway into AD budget expansion.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-nil-navy mb-6">How We Work With Your Team</h3>
                <div className="space-y-4">
                  {[
                    "We map your existing brand sponsor relationships against our active brand pipeline to identify multicultural budget overlap.",
                    "We work with your corporate development team to reach the right budget owners inside those brands — the multicultural marketing leads in addition to the general sponsorship team you know.",
                    "We structure a co-branded HSA campaign against the multicultural budget. Your program earns an activation fee and royalty. Your HSAs earn NIL compensation.",
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-nil-orange text-white font-bold flex items-center justify-center text-sm">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-6 italic">
                  This is additive and does not replace or compete with your existing corporate sponsorship relationships. It opens a new budget line that wasn't accessible before.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MARKET STATS */}
        <section className="relative py-16 md:py-24 bg-[url('/images/athlete-test-img-23.jpg')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-orange/70 via-nil-navy/80 to-nil-navy/90 z-0"></div>
          <div className="relative z-10 container-custom text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient-light mb-4">THE MARKET YOUR HSAs UNLOCK</h2>
              <p className="text-gray-300 max-w-3xl mx-auto text-lg">Why brands need your Hispanic athletes — and why the schools that act now are the ones winning.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {marketStats.map((stat) => (
                <div key={stat.label} className="bg-nil-navy/50 backdrop-blur-md p-6 rounded-xl border border-nil-orange/50 text-center hover:border-nil-orange transition-colors">
                  <p className="text-4xl font-bold text-nil-orange mb-2">{stat.value}</p>
                  <p className="text-white font-semibold mb-1">{stat.label}</p>
                  <p className="text-gray-400 text-sm">{stat.sub}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-400 text-xs mt-8">Sources: Nielsen, McKinsey, NCAA 2025, Pew Research</p>
          </div>
        </section>

        {/* TWO ASKS / CTA */}
        <section className="relative py-16 md:py-24 bg-[url('/images/background-img-1.png')] bg-cover bg-center bg-no-repeat md:bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/85 via-nil-navy/50 to-nil-orange/45 z-0"></div>
          <div className="relative z-10 container-custom text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient-light mb-4">TWO THINGS WE'RE ASKING FOR TODAY</h2>
              <p className="text-gray-300 max-w-3xl mx-auto text-lg">
                Programs that visibly support their Hispanic student-athletes in NIL are winning. Programs that don't are sending a message — whether they intend to or not.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
              <div className="bg-nil-navy/50 backdrop-blur-md p-8 rounded-xl border border-nil-orange/50">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-nil-orange text-white font-bold flex items-center justify-center text-lg mr-4 flex-shrink-0">1</div>
                  <h3 className="text-xl font-semibold text-nil-orange">Encourage Your HSAs to Create a Free Profile</h3>
                </div>
                <p className="text-gray-200 leading-relaxed">
                  No university has a dedicated NIL platform for Hispanic student-athletes. We do. Direct your HSAs in every sport to NILHispanic.com. Free, takes minutes. Your coaches immediately gain a recruiting tool other programs can't offer without a partnership with us.
                </p>
              </div>
              <div className="bg-nil-navy/50 backdrop-blur-md p-8 rounded-xl border border-nil-orange/50">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-nil-orange text-white font-bold flex items-center justify-center text-lg mr-4 flex-shrink-0">2</div>
                  <h3 className="text-xl font-semibold text-nil-orange">Schedule a 30-Minute Discovery Conversation</h3>
                </div>
                <p className="text-gray-200 leading-relaxed">
                  Let's identify your HSA roster across all sports and map World Cup 2026 and LA28 opportunities. Brands are building multicultural rosters now — programs without HSA infrastructure will be locked out.
                </p>
              </div>
            </div>
            <div className="text-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="btn-primary hover:bg-nil-orange/90 transition-colors text-lg px-10 py-6">
                    Schedule a Discovery Call
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>University Partnership Inquiry</DialogTitle>
                    <DialogDescription>
                      Let's discuss how ÑIL Hispanic can support your Hispanic student-athletes and unlock new brand opportunities for your program.
                    </DialogDescription>
                  </DialogHeader>
                  <ContactForm />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default UniversityPartnershipsPage;
