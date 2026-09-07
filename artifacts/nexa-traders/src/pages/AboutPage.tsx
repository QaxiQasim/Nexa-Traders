import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Zap,
  Globe2,
  ShieldCheck,
  ArrowRight,
  ArrowDown,
  Layers,
  Cpu,
  BrainCircuit,
  Network,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Maximize2,
  X,
  Smartphone,
  Users,
  Check,
  TrendingUp,
  AlertCircle,
  FileCheck2,
  LockKeyhole,
  ExternalLink,
  Bot,
  Scale,
  Quote
} from 'lucide-react';

// Count-up Animated Number Component
function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: string; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (!isInView) return;
    const numericPart = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (isNaN(numericPart)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const duration = 1800; // ms
    const steps = 60;
    const increment = numericPart / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= numericPart) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(
          Math.floor(start).toLocaleString()
        );
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-mono">
      {prefix}{displayValue}{suffix}
    </span>
  );
}

// Clean Hero AI Arbitrage Visual Image Component
function HeroNetworkVisual() {
  return (
    <div className="relative w-full rounded-3xl border border-primary/30 bg-gradient-to-b from-[#0e1411]/95 via-[#090e0c]/95 to-[#060807]/98 p-2 sm:p-3 backdrop-blur-2xl shadow-[0_0_70px_rgba(232,185,73,0.25)] font-mono select-none overflow-hidden group">
      {/* Specular Top Line Accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent z-10" />
      
      {/* Soft Ambient Radial Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/20 blur-[90px] rounded-full pointer-events-none" />

      {/* Image Container Frame */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 aspect-[16/11] flex items-center justify-center">
        <img
          src="/ai_arbitrage_hero_graphic.png"
          alt="Nexa Traders AI Crypto Arbitrage Technology Network"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Subtle Inner Shadow & Gradient Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090a]/80 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

const TIMELINE_STEPS = [
  {
    year: '2023',
    title: 'R&D & Core AI Engine',
    badge: 'Foundation',
    description: 'Development of proprietary multi-exchange AI market-scanning algorithms targeting order-book latency and cross-venue spread detection.'
  },
  {
    year: '2025',
    title: 'Official Platform Launch (15 Jun)',
    badge: 'Live Launch',
    description: 'Nexa Traders officially deployed its institutional-grade execution infrastructure and automated liquidity routing engine for real-time arbitrage.'
  },
  {
    year: '2026',
    title: 'Platform Scaling',
    badge: 'Beta Platform',
    description: 'Expansion to 18+ global exchanges, 1100+ cryptocurrencies, and 1500+ trading pairs with sub-10ms AI routing response speed.'
  },
  {
    year: '2027',
    title: 'Global Infrastructure',
    badge: 'V1 Full Launch',
    description: 'Deployment of decentralized AI liquidity nodes and zero-knowledge arbitrage settlement protocols for institutional market participants.'
  }
];

export function AboutPage() {
  const [, setLocation] = useLocation();
  const [lightboxImg, setLightboxImg] = useState<{ src: string; title: string; desc: string } | null>(null);
  const [activeTimelineStep, setActiveTimelineStep] = useState(1);

  // Scroll smooth helper
  const scrollToJourney = () => {
    document.getElementById('our-story')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-foreground font-sans selection:bg-primary selection:text-primary-foreground">

      {/* 🚀 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#0b0e0d] via-[#0d110f] to-[#08090a] pt-24 pb-20 lg:pt-32 lg:pb-28">
        {/* Ambient Radial Spotlight */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(232,185,73,0.30)_0%,rgba(16,185,129,0.08)_50%,transparent_80%)] blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e8b9490a_1px,transparent_1px),linear-gradient(to_bottom,#e8b9490a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-50 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center">
            {/* Left Hero Content */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>


              {/* Main Heading */}
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
                Intelligence Built for the Next Era of Crypto Trading.
              </h1>

              {/* Supporting Text */}
              <p className="mt-6 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                Nexa Traders is an AI-powered crypto arbitrage trading technology platform designed to identify market inefficiencies across multiple cryptocurrency exchanges and intelligently route opportunities in real time.
              </p>

              {/* CTAs */}
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setLocation('/packages')}
                  className="rounded-full bg-gradient-to-r from-primary via-[#f5c542] to-primary px-8 py-3.5 font-mono text-xs font-black uppercase tracking-wider text-primary-foreground shadow-[0_0_35px_rgba(232,185,73,0.45)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(232,185,73,0.65)] flex items-center gap-2"
                >
                  Explore Nexa <ArrowRight size={15} />
                </button>
                <button
                  onClick={scrollToJourney}
                  className="rounded-full border border-white/20 bg-white/[0.05] px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:bg-white/10 hover:border-primary/50 transition-all flex items-center gap-1.5"
                >
                  View Our Journey ↓
                </button>
              </div>
            </motion.div>

            {/* Right Hero Visual */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <HeroNetworkVisual />
            </motion.div>
          </div>
        </div>
      </section>


      {/* 📜 3. OUR STORY */}
      <section id="our-story" className="relative overflow-hidden py-20 lg:py-28 font-sans border-b border-white/10">
        {/* Background Ambient Spotlights */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[140px] pointer-events-none rounded-full" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8">
          {/* Outer Glass Card Frame */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] via-[#0b0e0c]/90 to-[#08090a] p-6 sm:p-10 lg:p-12 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              {/* Left Side */}
              <div>
                <span className="font-mono text-xs font-bold text-primary uppercase tracking-widest block mb-3">
                  OUR ORIGINS
                </span>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
                  From an Idea to an Intelligent <span className="text-primary">Trading Infrastructure</span>
                </h2>

                {/* Minimalist Institutional Quote Box */}
                <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-5 backdrop-blur-xl relative overflow-hidden">
                  <div className="flex items-start gap-3.5">
                    <div className="rounded-lg border border-primary/30 bg-primary/10 p-2 text-primary shrink-0 mt-0.5">
                      <Quote size={18} />
                    </div>
                    <p className="font-mono text-xs sm:text-sm font-semibold text-primary leading-relaxed italic">
                      “Markets move fast. Intelligence needs to move faster.”
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side Story & Stepper Timeline */}
              <div className="space-y-6">
                <div className="space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <p className="border-l border-primary/40 pl-3.5">
                    Nexa Traders began developing its AI arbitrage trading technology in 2023, targeting one of crypto markets' core challenges: fragmented liquidity and rapidly changing prices across exchanges.
                  </p>
                  <p className="border-l border-white/20 pl-3.5">
                    Officially launched on <strong className="text-foreground font-medium">15 June 2025</strong>, Nexa Traders deployed an automated execution infrastructure capable of monitoring markets, identifying potential arbitrage opportunities, and routing capital in real time.
                  </p>
                </div>

                {/* Stepper Evolution Timeline */}
                <div className="pt-6 border-t border-white/10 font-sans">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs uppercase tracking-widest text-foreground font-bold flex items-center gap-2">
                      <Activity size={14} className="text-primary" /> EVOLUTION TIMELINE
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">Select milestone</span>
                  </div>

                  {/* Connected Stepper */}
                  <div className="relative px-2">
                    {/* Background Progress Bar Line */}
                    <div className="absolute top-4 left-6 right-6 h-[2px] bg-white/10" />
                    <div
                      className="absolute top-4 left-6 h-[2px] bg-primary transition-all duration-500"
                      style={{ width: `${(activeTimelineStep / (TIMELINE_STEPS.length - 1)) * 84}%` }}
                    />

                    <div className="grid grid-cols-4 gap-1 relative z-10 text-center">
                      {TIMELINE_STEPS.map((step, idx) => {
                        const isActive = activeTimelineStep === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveTimelineStep(idx)}
                            className="group flex flex-col items-center cursor-pointer focus:outline-none"
                          >
                            {/* Circle Node */}
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                              isActive
                                ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(232,185,73,0.4)] scale-110'
                                : 'border-white/20 bg-[#08090a] text-muted-foreground group-hover:border-white/40 group-hover:text-foreground'
                            }`}>
                              <span className="font-mono text-xs font-bold">{idx + 1}</span>
                            </div>

                            {/* Year */}
                            <span className={`mt-2 font-mono text-xs font-bold tracking-tight transition-colors ${
                              isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                            }`}>
                              {step.year}
                            </span>

                            <span className="text-[10px] text-muted-foreground/80 font-medium truncate max-w-[70px] hidden sm:block">
                              {step.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clean Detail Inspector Card */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTimelineStep}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4.5 backdrop-blur-xl"
                    >
                      <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary">
                            {TIMELINE_STEPS[activeTimelineStep].year}
                          </span>
                          <span className="text-white/20">•</span>
                          <span className="font-sans text-xs font-semibold text-foreground">
                            {TIMELINE_STEPS[activeTimelineStep].title}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-white/15 bg-white/5 text-foreground font-medium">
                          {TIMELINE_STEPS[activeTimelineStep].badge}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {TIMELINE_STEPS[activeTimelineStep].description}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 🧠 4. WHAT IS AI CRYPTO ARBITRAGE? */}
      <section className="relative overflow-hidden py-24 lg:py-32 bg-[#0a0d0c] border-b border-white/10 font-sans">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">EDUCATIONAL OVERVIEW</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
              What Is AI Arbitrage Trading?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Crypto assets can trade at slightly different prices across different exchanges at the same moment. AI arbitrage technology continuously analyzes these markets, compares prices and liquidity, identifies potential price discrepancies and determines whether an opportunity meets predefined trading conditions.
            </p>
          </div>

          {/* 3 Step Process Breakdown */}
          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto font-sans">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl hover:border-primary/40 transition-colors">
              <span className="font-mono text-xs text-primary font-bold block mb-2">01 — Detect</span>
              <h3 className="font-bold text-foreground mb-2">Market Scanning</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Monitor markets continuously and identify real-time price differences across exchanges.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl hover:border-primary/40 transition-colors">
              <span className="font-mono text-xs text-primary font-bold block mb-2">02 — Analyze</span>
              <h3 className="font-bold text-foreground mb-2">Liquidity Analysis</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Evaluate orderbook liquidity, latency, fees, and predefined risk boundaries.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl hover:border-primary/40 transition-colors">
              <span className="font-mono text-xs text-primary font-bold block mb-2">03 — Route</span>
              <h3 className="font-bold text-foreground mb-2">Smart Capital Routing</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Determine potential execution routes based on predefined strategies and account parameters.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* 📊 5. NEXA BY THE NUMBERS */}
      <section className="relative overflow-hidden py-24 lg:py-32 font-sans border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">PLATFORM TELEMETRY</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
              Nexa By The Numbers
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#141b18]/80 to-[#0a0e0c]/90 p-8 backdrop-blur-xl shadow-2xl hover:border-primary/50 transition-all">
              <p className="text-4xl sm:text-5xl font-black text-primary tracking-tight font-mono">
                <AnimatedNumber value="18" suffix="+" />
              </p>
              <h3 className="mt-4 text-base font-bold text-foreground">Crypto Exchanges Integrated</h3>
              <p className="mt-1 text-xs text-muted-foreground">Direct low-latency API connections to top liquidity venues.</p>
            </div>

            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#141b18]/80 to-[#0a0e0c]/90 p-8 backdrop-blur-xl shadow-2xl hover:border-emerald-500/50 transition-all">
              <p className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight font-mono">
                <AnimatedNumber value="1,100" suffix="+" />
              </p>
              <h3 className="mt-4 text-base font-bold text-foreground">Cryptocurrencies</h3>
              <p className="mt-1 text-xs text-muted-foreground">Supported digital assets scanned across markets.</p>
            </div>

            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#141b18]/80 to-[#0a0e0c]/90 p-8 backdrop-blur-xl shadow-2xl hover:border-primary/50 transition-all">
              <p className="text-4xl sm:text-5xl font-black text-primary tracking-tight font-mono">
                <AnimatedNumber value="1,500" suffix="+" />
              </p>
              <h3 className="mt-4 text-base font-bold text-foreground">Crypto Trading Pairs</h3>
              <p className="mt-1 text-xs text-muted-foreground">Active market pairs evaluated in real time.</p>
            </div>

            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#141b18]/80 to-[#0a0e0c]/90 p-8 backdrop-blur-xl shadow-2xl hover:border-amber-500/50 transition-all">
              <p className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight font-mono">
                <AnimatedNumber value="42" suffix="ms" />
              </p>
              <h3 className="mt-4 text-base font-bold text-foreground">Decision Latency</h3>
              <p className="mt-1 text-xs text-muted-foreground">Reported decision speed under operating conditions.</p>
            </div>

            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#141b18]/80 to-[#0a0e0c]/90 p-8 backdrop-blur-xl shadow-2xl hover:border-emerald-500/50 transition-all">
              <p className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight font-mono">
                <AnimatedNumber value="1.5" prefix="$" suffix="M+" />
              </p>
              <h3 className="mt-4 text-base font-bold text-foreground">Capital Routed</h3>
              <p className="mt-1 text-xs text-muted-foreground">Volume processed through AI arbitrage routes.</p>
            </div>

            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#141b18]/80 to-[#0a0e0c]/90 p-8 backdrop-blur-xl shadow-2xl hover:border-primary/50 transition-all">
              <p className="text-4xl sm:text-5xl font-black text-primary tracking-tight font-mono">
                <AnimatedNumber value="10,000" suffix="+" />
              </p>
              <h3 className="mt-4 text-base font-bold text-foreground">Platform Users</h3>
              <p className="mt-1 text-xs text-muted-foreground">Global user community on Nexa Traders.</p>
            </div>
          </div>
        </div>
      </section>


      {/* ⚡ 6. OUR TECHNOLOGY */}
      <section className="relative overflow-hidden py-24 lg:py-32 bg-[#090d0b] border-b border-white/10 font-sans">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">CORE INFRASTRUCTURE</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
              Built Around Speed, Intelligence & Connectivity
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-black/50 p-7 backdrop-blur-xl flex flex-col justify-between hover:border-primary/50 transition-all">
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/40 bg-primary/10 text-primary">
                  <Network size={22} />
                </div>
                <h3 className="mt-6 text-lg font-bold text-foreground">Multi-Exchange Intelligence</h3>
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  Connect and analyze market information across 18+ integrated crypto exchanges.
                </p>
              </div>
              <span className="mt-8 font-mono text-[10px] text-primary uppercase font-bold">01 / ARCHITECTURE</span>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/50 p-7 backdrop-blur-xl flex flex-col justify-between hover:border-emerald-500/50 transition-all">
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                  <BrainCircuit size={22} />
                </div>
                <h3 className="mt-6 text-lg font-bold text-foreground">AI-Powered Decision Engine</h3>
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  Process market information and evaluate potential arbitrage opportunities using intelligent algorithms.
                </p>
              </div>
              <span className="mt-8 font-mono text-[10px] text-emerald-400 uppercase font-bold">02 / ALGORITHM</span>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/50 p-7 backdrop-blur-xl flex flex-col justify-between hover:border-amber-500/50 transition-all">
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-400">
                  <Zap size={22} />
                </div>
                <h3 className="mt-6 text-lg font-bold text-foreground">Ultra-Low Decision Latency</h3>
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  Designed for rapid market analysis with reported decision latency of approximately 42ms under operating conditions.
                </p>
              </div>
              <span className="mt-8 font-mono text-[10px] text-amber-400 uppercase font-bold">03 / LATENCY</span>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/50 p-7 backdrop-blur-xl flex flex-col justify-between hover:border-primary/50 transition-all">
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/40 bg-primary/10 text-primary">
                  <Cpu size={22} />
                </div>
                <h3 className="mt-6 text-lg font-bold text-foreground">Intelligent Capital Routing</h3>
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  Infrastructure designed to route capital across supported markets and exchanges according to predefined trading logic.
                </p>
              </div>
              <span className="mt-8 font-mono text-[10px] text-primary uppercase font-bold">04 / ROUTING</span>
            </div>
          </div>
        </div>
      </section>


      {/* 🌍 7. OUR GLOBAL PRESENCE */}
      <section className="relative overflow-hidden py-24 lg:py-32 font-sans border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">GLOBAL INITIATIVE</span>
              <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
                Built Globally. Designed for Digital Markets.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Nexa Traders is a Panama-based company focused on AI-powered crypto trading technology.
              </p>

              <div className="mt-8 space-y-4 font-mono text-sm">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="text-2xl">🇵🇦</span>
                  <div>
                    <strong className="text-foreground block">Panama</strong>
                    <span className="text-xs text-muted-foreground">Primary Corporate Incorporation</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="text-2xl">🇸🇰</span>
                  <div>
                    <strong className="text-foreground block">Slovakia</strong>
                    <span className="text-xs text-muted-foreground">European Operations & Technical Hub</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stylized World Map Graphic */}
            <div className="rounded-3xl border border-primary/30 bg-gradient-to-b from-[#0e1411] to-[#070908] p-8 text-center relative overflow-hidden shadow-2xl min-h-[320px] flex flex-col justify-between">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-3xl pointer-events-none rounded-full" />
              <Globe2 size={64} className="mx-auto text-primary animate-spin-slow mb-4 opacity-80" />
              <div>
                <strong className="text-lg font-bold text-foreground block font-mono">GLOBAL LIQUIDITY MATRIX</strong>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Cross-border technical infrastructure connecting servers across European and Latin American data hubs.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-[10px] font-mono text-emerald-400 uppercase">
                ● 2 REGISTERED JURISDICTIONS ACTIVE
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 🗓️ 8. COMPANY MILESTONES */}
      <section className="relative overflow-hidden py-24 lg:py-32 bg-[#090d0b] border-b border-white/10 font-sans">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">HISTORICAL MILESTONES</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
              Company Milestones
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 font-sans">
            <div className="rounded-3xl border border-white/10 bg-black/60 p-6 flex flex-col justify-between hover:border-primary/50 transition-all">
              <div>
                <span className="font-mono text-sm text-primary font-black block">2023</span>
                <h3 className="mt-3 text-base font-bold text-foreground">AI Arbitrage Research Begins</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Development and exploration of AI-driven crypto arbitrage technology begins.
                </p>
              </div>
              <span className="mt-6 text-[10px] font-mono text-muted-foreground uppercase">FOUNDATION</span>
            </div>

            <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-6 flex flex-col justify-between hover:border-emerald-500 transition-all">
              <div>
                <span className="font-mono text-sm text-emerald-400 font-black block">15 JUN 2025</span>
                <h3 className="mt-3 text-base font-bold text-foreground">Nexa Traders Launch</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Nexa Traders officially launches as a crypto trading technology platform.
                </p>
              </div>
              <span className="mt-6 text-[10px] font-mono text-emerald-400 uppercase">OFFICIAL LAUNCH</span>
            </div>

            <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-6 flex flex-col justify-between hover:border-amber-500 transition-all">
              <div>
                <span className="font-mono text-sm text-amber-400 font-black block">2026</span>
                <h3 className="mt-3 text-base font-bold text-foreground">Beta Platform</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Expansion of exchange connectivity, crypto coverage, trading pairs and AI infrastructure.
                </p>
              </div>
              <span className="mt-6 text-[10px] font-mono text-amber-400 uppercase">BETA EXPANSION</span>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/60 p-6 flex flex-col justify-between hover:border-primary/50 transition-all">
              <div>
                <span className="font-mono text-sm text-primary font-black block">10K+ USERS</span>
                <h3 className="mt-3 text-base font-bold text-foreground">Growing User Base</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  The platform reaches more than 10,000 active users globally.
                </p>
              </div>
              <span className="mt-6 text-[10px] font-mono text-primary uppercase">MILESTONE</span>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/60 p-6 flex flex-col justify-between hover:border-primary/50 transition-all">
              <div>
                <span className="font-mono text-sm text-foreground font-black block">01 JAN 2027</span>
                <h3 className="mt-3 text-base font-bold text-foreground">Full Platform Version</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  The planned final version of Nexa Traders launches with expanded platform capabilities.
                </p>
              </div>
              <span className="mt-6 text-[10px] font-mono text-muted-foreground uppercase">TARGET GOAL</span>
            </div>
          </div>
        </div>
      </section>


      {/* 🗺️ 9. ROADMAP */}
      <section className="relative overflow-hidden py-24 lg:py-32 font-sans border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">FUTURE OUTLOOK</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
              The Road Ahead
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              We're building beyond today's trading infrastructure.
            </p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Phase 1 */}
            <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-6 sm:p-8 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
              <div>
                <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider block">PHASE 01</span>
                <h3 className="text-xl font-bold text-foreground mt-1">AI Arbitrage Infrastructure</h3>
                <p className="text-xs text-muted-foreground mt-2">Multi-exchange connectivity, AI market analysis, Arbitrage infrastructure, Capital routing.</p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-500/20 border border-emerald-500/50 px-4 py-1.5 font-mono text-xs font-bold text-emerald-400">
                ● Live / Beta
              </span>
            </div>

            {/* Phase 2 */}
            <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-6 sm:p-8 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
              <div>
                <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider block">PHASE 02</span>
                <h3 className="text-xl font-bold text-foreground mt-1">Platform Expansion</h3>
                <p className="text-xs text-muted-foreground mt-2">Enhanced trading infrastructure, Improved user experience, Expanded market coverage.</p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-500/20 border border-amber-500/50 px-4 py-1.5 font-mono text-xs font-bold text-amber-400">
                In Development
              </span>
            </div>

            {/* Phase 3 */}
            <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-6 sm:p-8 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
              <div>
                <span className="font-mono text-xs text-primary font-bold uppercase tracking-wider block">PHASE 03</span>
                <h3 className="text-xl font-bold text-foreground mt-1">Spot Marketplace</h3>
                <p className="text-xs text-muted-foreground mt-2">A dedicated spot marketplace designed to bring supported digital assets into the Nexa Traders ecosystem.</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 font-mono text-xs font-bold text-muted-foreground">
                Upcoming
              </span>
            </div>

            {/* Phase 4 */}
            <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-6 sm:p-8 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
              <div>
                <span className="font-mono text-xs text-primary font-bold uppercase tracking-wider block">PHASE 04</span>
                <h3 className="text-xl font-bold text-foreground mt-1">AI Perpetual Futures</h3>
                <p className="text-xs text-muted-foreground mt-2">AI-powered perpetual futures infrastructure designed for advanced digital asset trading.</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 font-mono text-xs font-bold text-muted-foreground">
                Upcoming
              </span>
            </div>

            {/* Phase 5 */}
            <div className="rounded-3xl border border-primary/50 bg-gradient-to-r from-primary/20 to-primary/10 p-6 sm:p-8 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center shadow-[0_0_30px_rgba(232,185,73,0.2)]">
              <div>
                <span className="font-mono text-xs text-primary font-bold uppercase tracking-wider block">PHASE 05</span>
                <h3 className="text-xl font-black text-foreground mt-1">Full Nexa Traders Platform</h3>
                <p className="text-xs text-muted-foreground mt-2">The planned full version of the Nexa Traders platform with expanded products and global capabilities.</p>
              </div>
              <span className="shrink-0 rounded-full bg-primary text-primary-foreground font-mono text-xs font-black px-4 py-1.5">
                Target: 01 January 2027
              </span>
            </div>
          </div>
        </div>
      </section>


      {/* 🖼️ 10. ROADMAP SCREENSHOTS & GALLERY */}
      <section className="relative overflow-hidden py-24 lg:py-32 bg-[#090d0b] border-b border-white/10 font-sans">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">PREVIEW GALLERY</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
              A Glimpse Into What's Coming
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Sneak preview of our upcoming Spot Marketplace & AI Futures interface.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Gallery Card 1 */}
            <div
              onClick={() => setLightboxImg({
                src: '/spot-preview.jpg',
                title: 'Spot Marketplace Interface',
                desc: 'Dedicated digital asset spot trading engine inside Nexa ecosystem.'
              })}
              className="group relative rounded-3xl border border-white/15 bg-black/60 p-4 overflow-hidden cursor-pointer backdrop-blur-xl hover:border-primary/60 transition-all shadow-2xl"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#0d1210] flex items-center justify-center border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <div className="p-6 text-center z-20">
                  <Maximize2 size={24} className="mx-auto text-primary group-hover:scale-125 transition-transform mb-2" />
                  <span className="font-mono text-xs font-bold text-foreground">Click to Expand Preview</span>
                </div>
              </div>
              <div className="mt-4 p-2 font-mono">
                <strong className="text-foreground text-sm block">Spot Marketplace Interface</strong>
                <span className="text-[10px] text-primary">PHASE 03 DEVELOPER PREVIEW</span>
              </div>
            </div>

            {/* Gallery Card 2 */}
            <div
              onClick={() => setLightboxImg({
                src: '/futures-preview.jpg',
                title: 'AI Perpetual Futures Terminal',
                desc: 'AI-assisted margin risk control and perpetual trading terminal.'
              })}
              className="group relative rounded-3xl border border-white/15 bg-black/60 p-4 overflow-hidden cursor-pointer backdrop-blur-xl hover:border-emerald-500/60 transition-all shadow-2xl"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#0d1210] flex items-center justify-center border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <div className="p-6 text-center z-20">
                  <Maximize2 size={24} className="mx-auto text-emerald-400 group-hover:scale-125 transition-transform mb-2" />
                  <span className="font-mono text-xs font-bold text-foreground">Click to Expand Preview</span>
                </div>
              </div>
              <div className="mt-4 p-2 font-mono">
                <strong className="text-foreground text-sm block">AI Perpetual Futures Terminal</strong>
                <span className="text-[10px] text-emerald-400">PHASE 04 DEVELOPER PREVIEW</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 🚀 11. UPCOMING PRODUCTS */}
      <section className="relative overflow-hidden py-24 lg:py-32 font-sans border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">NEXT GENERATION PRODUCTS</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
              Upcoming Products
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Product 1 */}
            <div className="rounded-3xl border border-primary/40 bg-gradient-to-b from-[#131b17] to-[#0a0f0d] p-8 backdrop-blur-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div>
                <span className="font-mono text-xs text-primary font-bold block">01</span>
                <h3 className="text-2xl font-extrabold text-foreground mt-2">Spot Marketplace</h3>
                <span className="inline-block mt-2 rounded-full bg-primary/20 border border-primary/50 px-3 py-1 font-mono text-[10px] font-bold text-primary">
                  Coming Soon
                </span>
                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                  A dedicated marketplace experience designed for spot digital asset trading within the Nexa Traders ecosystem.
                </p>
              </div>

              <div className="mt-8">
                <button
                  disabled
                  className="w-full rounded-2xl border border-white/15 bg-white/[0.05] py-3.5 font-mono text-xs font-bold text-muted-foreground cursor-not-allowed opacity-80"
                >
                  Explore Coming Soon
                </button>
              </div>
            </div>

            {/* Product 2 */}
            <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-[#131b17] to-[#0a0f0d] p-8 backdrop-blur-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div>
                <span className="font-mono text-xs text-emerald-400 font-bold block">02</span>
                <h3 className="text-2xl font-extrabold text-foreground mt-2">AI Perpetual Futures</h3>
                <span className="inline-block mt-2 rounded-full bg-emerald-500/20 border border-emerald-500/50 px-3 py-1 font-mono text-[10px] font-bold text-emerald-400">
                  Coming Soon
                </span>
                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                  An advanced trading environment focused on AI-assisted perpetual futures infrastructure.
                </p>
              </div>

              <div className="mt-8">
                <button
                  disabled
                  className="w-full rounded-2xl border border-white/15 bg-white/[0.05] py-3.5 font-mono text-xs font-bold text-muted-foreground cursor-not-allowed opacity-80"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 📱 12. MOBILE APP */}
      <section className="relative overflow-hidden py-24 lg:py-32 bg-[#090d0b] border-b border-white/10 font-sans">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Smartphone size={36} className="mx-auto text-primary mb-3 animate-pulse" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
              Nexa Traders. Wherever You Trade.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              The Nexa Traders mobile experience is coming to Android and iOS.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto font-mono text-xs">
            {/* Android Card */}
            <div className="rounded-3xl border border-white/15 bg-black/60 p-8 text-center backdrop-blur-xl flex flex-col justify-between">
              <div>
                <span className="text-2xl font-bold text-foreground block">ANDROID</span>
                <span className="mt-2 block text-emerald-400 font-bold">Launching November 2026</span>
                <p className="mt-3 text-[11px] text-muted-foreground font-sans leading-relaxed">
                  Native Android app optimized for real-time notifications and mobile portfolio management.
                </p>
              </div>
              <button disabled className="mt-6 w-full rounded-2xl border border-white/15 bg-white/5 py-3.5 font-bold text-muted-foreground cursor-not-allowed">
                Android — Coming Soon
              </button>
            </div>

            {/* iOS Card */}
            <div className="rounded-3xl border border-white/15 bg-black/60 p-8 text-center backdrop-blur-xl flex flex-col justify-between">
              <div>
                <span className="text-2xl font-bold text-foreground block">iOS</span>
                <span className="mt-2 block text-primary font-bold">Launching February 2027</span>
                <p className="mt-3 text-[11px] text-muted-foreground font-sans leading-relaxed">
                  Sleek iOS application with biometric authentication and live push alerts.
                </p>
              </div>
              <button disabled className="mt-6 w-full rounded-2xl border border-white/15 bg-white/5 py-3.5 font-bold text-muted-foreground cursor-not-allowed">
                iOS — Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* 🤝 13. TRUST / COMMUNITY SECTION */}
      <section className="relative overflow-hidden py-24 lg:py-32 font-sans border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">GROWTH TELEMETRY</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            10,000+ Users and Growing
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Since launch, Nexa Traders has continued to expand its technology, exchange connectivity and global user community.
          </p>

          <div className="mt-12 text-6xl sm:text-7xl font-black text-primary font-mono tracking-tight">
            <AnimatedNumber value="10,000" suffix="+" />
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto font-mono text-xs">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <strong className="text-lg text-foreground block">18+</strong>
              <span className="text-[10px] text-muted-foreground">Exchanges</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <strong className="text-lg text-foreground block">1,100+</strong>
              <span className="text-[10px] text-muted-foreground">Assets</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <strong className="text-lg text-foreground block">1,500+</strong>
              <span className="text-[10px] text-muted-foreground">Pairs</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <strong className="text-lg text-emerald-400 block">$1.5M+</strong>
              <span className="text-[10px] text-muted-foreground">Capital Routed</span>
            </div>
          </div>
        </div>
      </section>


      {/* 👁️ 14. OUR VISION */}
      <section className="relative overflow-hidden py-24 lg:py-32 bg-[#090c0b] border-b border-white/10 font-sans">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">OUR MISSION</span>
          <h2 className="mt-6 text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-tight">
            Making Crypto Markets More Intelligent.
          </h2>
          <p className="mt-6 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Our vision is to build an intelligent trading infrastructure where advanced technology, real-time market intelligence and connected global liquidity work together to create a smarter digital asset trading experience.
          </p>
        </div>
      </section>


      {/* 🏁 15. FINAL CTA */}
      <section className="relative overflow-hidden py-28 lg:py-36 bg-gradient-to-b from-[#08090a] via-[#0e1411] to-[#060807] font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(232,185,73,0.20)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 text-center lg:px-8">
          <span className="font-mono text-xs font-black uppercase tracking-widest text-primary">
            ENTER THE FUTURE OF CRYPTO
          </span>
          <h2 className="mt-6 text-4xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-tight">
            The Next Era of Trading Is Being Built Now.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm text-muted-foreground sm:text-base leading-relaxed">
            Explore Nexa Traders and follow the evolution from AI arbitrage infrastructure to a broader digital asset trading ecosystem.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setLocation('/packages')}
              className="rounded-full bg-gradient-to-r from-primary via-[#f5c542] to-primary px-9 py-4 font-mono text-xs font-black uppercase tracking-wider text-primary-foreground shadow-[0_0_35px_rgba(232,185,73,0.45)] hover:scale-105 transition-all"
            >
              Explore Nexa Traders →
            </button>
            <button
              onClick={() => setLocation('/register')}
              className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-9 py-4 font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/20 backdrop-blur-md transition-all"
            >
              Join the Beta
            </button>
          </div>

          <div className="mt-10 inline-block rounded-full bg-white/[0.04] border border-white/10 px-5 py-2 font-mono text-xs text-muted-foreground">
            Full Version — <strong className="text-foreground">01 January 2027</strong>
          </div>
        </div>
      </section>


      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-2xl"
            onClick={() => setLightboxImg(null)}
          >
            <div className="relative max-w-3xl w-full rounded-3xl border border-primary/50 bg-[#0c100e] p-6 shadow-2xl font-mono text-xs">
              <button
                onClick={() => setLightboxImg(null)}
                className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/10 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
              <h3 className="text-lg font-bold text-foreground">{lightboxImg.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{lightboxImg.desc}</p>
              <div className="mt-4 aspect-video rounded-2xl border border-white/10 bg-black flex items-center justify-center p-8 text-center">
                <span className="text-muted-foreground">High-Resolution UI Developer Preview Frame</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default AboutPage;
