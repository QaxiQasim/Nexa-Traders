import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Code2,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  Eye,
  Facebook,
  FileCheck2,
  Globe2,
  Instagram,
  Linkedin,
  LockKeyhole,
  Mail,
  Menu,
  MessageCircle,
  Network,
  Play,
  Radio,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  TrendingUp,
  Twitter,
  WalletCards,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useRoute } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { articles, categories, faqs, packages, type Article, type PackageTier } from '@/data/content';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

const reveal: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={reveal} transition={{ delay }} className={className}>{children}</motion.div>;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" data-testid="link-logo">
      <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] border border-primary/60 bg-primary text-primary-foreground shadow-[0_0_24px_rgba(232,185,73,.18)]">
        <span className="absolute h-16 w-px rotate-45 bg-primary-foreground/40" />
        <span className="relative font-mono text-xs font-bold">N</span>
      </span>
      {!compact && <span className="text-[15px] font-semibold tracking-[-0.04em] text-foreground">Nexa<span className="text-primary">Traders</span></span>}
    </Link>
  );
}

function ButtonLink({ href, children, variant = 'primary', className = '', onClick }: { href: string; children: ReactNode; variant?: 'primary' | 'outline' | 'ghost'; className?: string; onClick?: () => void }) {
  const styles = variant === 'primary'
    ? 'bg-primary text-primary-foreground hover:bg-[#f3cc68] shadow-[0_12px_32px_rgba(232,185,73,.13)]'
    : variant === 'outline'
      ? 'border border-card-border bg-card/60 text-foreground hover:border-primary/60 hover:bg-primary/5'
      : 'text-muted-foreground hover:bg-secondary hover:text-foreground';
  return <Link href={href} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${styles} ${className}`} data-testid={`link-${href.replace(/\W/g, '')}`}>{children}</Link>;
}

function SectionHeading({ eyebrow, title, copy, align = 'left' }: { eyebrow: string; title: string; copy?: string; align?: 'left' | 'center' }) {
  return (
    <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-primary"><span className="h-px w-7 bg-primary" />{eyebrow}</div>
      <h2 className="text-balance text-3xl font-semibold tracking-[-0.055em] text-foreground sm:text-5xl">{title}</h2>
      {copy && <p className="mt-5 text-base leading-7 text-muted-foreground">{copy}</p>}
    </div>
  );
}

function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const nav = [['/packages', 'Packages'], ['/about', 'Our edge'], ['/blog', 'Insights'], ['/contact', 'Contact']];
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {nav.map(([href, label]) => <Link key={href} href={href} className={`rounded-md px-3 py-2 text-sm transition-colors ${location === href || (href === '/blog' && location.startsWith('/blog/')) ? 'text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`} data-testid={`link-nav-${label.toLowerCase().replace(' ', '-')}`}>{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <ButtonLink href="/login" variant="ghost" className="px-3">Sign in</ButtonLink>
          <ButtonLink href="/register" className="px-4">Open an account <ArrowUpRight size={15} /></ButtonLink>
        </div>
        <button className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle navigation" data-testid="button-toggle-navigation">
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      <AnimatePresence>
        {open && <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border/70 bg-background px-5 pb-5 md:hidden">
          <div className="flex flex-col gap-1 pt-3">
            {nav.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" data-testid={`link-mobile-${label.toLowerCase().replace(' ', '-')}`}>{label}</Link>)}
            <div className="mt-2 flex gap-2 border-t border-border/60 pt-4"><ButtonLink href="/login" variant="outline" className="flex-1">Sign in</ButtonLink><ButtonLink href="/register" className="flex-1">Get started</ButtonLink></div>
          </div>
        </motion.nav>}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (email.trim()) setSubscribed(true); };
  return (
    <footer className="border-t border-border bg-[#0a0b0c]">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.2fr_.8fr_.8fr_1.5fr] lg:px-8">
        <div><Logo /><p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">Market intelligence for people who want their capital to think in probabilities.</p><div className="mt-6 flex gap-2"><a href="https://twitter.com" target="_blank" rel="noreferrer" className="rounded-md border border-border p-2 text-muted-foreground hover:border-primary/50 hover:text-primary" data-testid="link-social-twitter"><Twitter size={15} /></a><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="rounded-md border border-border p-2 text-muted-foreground hover:border-primary/50 hover:text-primary" data-testid="link-social-linkedin"><Linkedin size={15} /></a><a href="https://instagram.com" target="_blank" rel="noreferrer" className="rounded-md border border-border p-2 text-muted-foreground hover:border-primary/50 hover:text-primary" data-testid="link-social-instagram"><Instagram size={15} /></a></div></div>
        <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">Explore</p><div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground"><Link href="/about" className="hover:text-foreground" data-testid="link-footer-about">Our edge</Link><Link href="/packages" className="hover:text-foreground" data-testid="link-footer-packages">Packages</Link><Link href="/blog" className="hover:text-foreground" data-testid="link-footer-blog">Insights</Link><Link href="/contact" className="hover:text-foreground" data-testid="link-footer-contact">Support</Link></div></div>
        <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">Legal</p><div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground"><Link href="/privacy" className="hover:text-foreground" data-testid="link-footer-privacy">Privacy policy</Link><a href="mailto:legal@nexatraders.com" className="hover:text-foreground" data-testid="link-footer-legal">Legal desk</a><a href="mailto:hello@nexatraders.com" className="hover:text-foreground" data-testid="link-footer-email">hello@nexatraders.com</a></div></div>
        <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">Signal letter</p><p className="mt-4 text-sm leading-6 text-muted-foreground">One considered market note each week. No noise, no referral bait.</p>{subscribed ? <div className="mt-5 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm text-accent"><Check size={16} />You’re on the list.</div> : <form onSubmit={submit} className="mt-5 flex gap-2"><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@domain.com" className="min-w-0 flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary" aria-label="Email address" data-testid="input-footer-email" /><button type="submit" className="rounded-lg bg-primary px-3 text-primary-foreground hover:bg-[#f3cc68]" aria-label="Subscribe" data-testid="button-footer-subscribe"><Send size={16} /></button></form>}</div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-border/70 px-5 py-5 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© 2024 NexaTraders. Built for the signal, not the spectacle.</span><span className="font-mono">Not financial advice. Digital assets carry risk.</span></div>
    </footer>
  );
}

function LiveChart({ compact = false }: { compact?: boolean }) {
  const base = [34, 38, 36, 43, 41, 47, 45, 52, 50, 57, 55, 60, 58, 67, 63, 70, 68, 75, 71, 78, 82, 79, 86, 89];
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setTick((v) => v + 1), 2400); return () => window.clearInterval(id); }, []);
  const points = base.map((value, i) => `${(i / (base.length - 1)) * 100},${100 - value - (((tick + i) % 4) === 0 ? 1 : 0)}`).join(' ');
  return <div className={`relative ${compact ? 'h-28' : 'h-64'}`} data-testid="chart-live-exchange">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
      <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#e8b949" stopOpacity=".24" /><stop offset="1" stopColor="#e8b949" stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,100 ${points} 100,100`} fill="url(#chartFill)" />
      <polyline points={points} fill="none" stroke="#e8b949" strokeWidth="1.4" vectorEffect="non-scaling-stroke" className="chart-draw" />
      <line x1="0" y1="72" x2="100" y2="72" stroke="rgba(255,255,255,.12)" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
    </svg>
    {!compact && <><span className="absolute left-0 top-[26%] font-mono text-[10px] text-muted-foreground">$68.4K</span><span className="absolute bottom-[4%] left-0 font-mono text-[10px] text-muted-foreground">$64.0K</span><span className="absolute right-0 top-[8%] font-mono text-[10px] text-primary">$71,842.09</span></>}
  </div>;
}

function ExchangeTicker() {
  const rows = [['BTC / USDT', '$71,842.09', '+2.84%', 'Binance → Kraken'], ['ETH / USDT', '$3,842.17', '+1.72%', 'OKX → Coinbase'], ['SOL / USDC', '$184.63', '+4.18%', 'Bybit → Kraken']];
  return <div className="overflow-hidden border-y border-border/70 bg-[#0b0d0e]"><div className="animate-ticker flex min-w-max">{[...rows, ...rows].map(([pair, price, change, route], index) => <div key={`${pair}-${index}`} className="flex items-center gap-5 border-r border-border/70 px-6 py-3 font-mono text-[11px]"><span className="text-foreground">{pair}</span><span className="text-muted-foreground">{price}</span><span className="text-accent">{change}</span><span className="text-muted-foreground/60">{route}</span></div>)}</div></div>;
}

function ScanPanel() {
  const [scanning, setScanning] = useState(true);
  const [scans, setScans] = useState(1284);
  useEffect(() => { const id = window.setInterval(() => { setScans((v) => v + 1); setScanning(true); const stop = window.setTimeout(() => setScanning(false), 1200); return () => window.clearTimeout(stop); }, 3200); return () => window.clearInterval(id); }, []);
  return <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-[#0d1010] p-4 shadow-[0_0_90px_rgba(232,185,73,.08)] sm:p-5" data-testid="panel-live-scanner">
    <div className="absolute inset-0 grid-fade opacity-60" />
    <div className="relative">
      <div className="flex items-center justify-between border-b border-border/70 pb-4"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full bg-accent ${scanning ? 'animate-pulse-signal' : ''}`} /><span className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Engine / live scan</span></div><button className="font-mono text-[10px] text-primary hover:underline" onClick={() => setScanning(true)} data-testid="button-rescan">Rescan <RefreshCw size={11} className="ml-1 inline" /></button></div>
      <div className="mt-5 grid grid-cols-[1fr_auto] items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.15em] text-muted-foreground">Best current spread</p><p className="mt-2 text-4xl font-semibold tracking-[-.06em] text-foreground">2.84<span className="text-lg text-primary">%</span></p><p className="mt-1 flex items-center gap-1 text-xs text-accent"><ArrowUpRight size={13} />BTC / USDT</p></div><div className="rounded-lg border border-accent/25 bg-accent/5 px-3 py-2 text-right"><span className="block font-mono text-[9px] uppercase text-muted-foreground">Confidence</span><span className="font-mono text-sm text-accent">97.4%</span></div></div>
      <div className="mt-5"><LiveChart /></div>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/70 pt-4"><div><span className="block font-mono text-[9px] uppercase text-muted-foreground">Exchanges</span><span className="mt-1 block text-sm text-foreground">18 connected</span></div><div><span className="block font-mono text-[9px] uppercase text-muted-foreground">Scanned</span><span className="mt-1 block text-sm text-foreground">{scans.toLocaleString()} routes</span></div><div><span className="block font-mono text-[9px] uppercase text-muted-foreground">Latency</span><span className="mt-1 block text-sm text-foreground">42 ms</span></div></div>
    </div>
  </div>;
}

function Home() {
  const [activeFaq, setActiveFaq] = useState(0);
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyAddress = () => { navigator.clipboard?.writeText('0x7B...94AC'); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  const processSteps: { number: string; title: string; copy: string; icon: LucideIcon }[] = [
    { number: '01', title: 'Observe', copy: 'A live map of spreads, depth, fees, and venue health.', icon: Eye },
    { number: '02', title: 'Qualify', copy: 'A probability model filters noise and stress-tests each route.', icon: BrainCircuit },
    { number: '03', title: 'Execute', copy: 'When the edge clears the boundary, the engine moves with precision.', icon: Zap },
  ];
  return <div>
    <section className="relative overflow-hidden border-b border-border/70">
      <div className="absolute inset-0 grid-fade opacity-70" /><div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-28 lg:pt-24">
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.div variants={reveal} className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.16em] text-primary"><span className="h-1.5 w-1.5 animate-pulse-signal rounded-full bg-primary" />AI market intelligence / online</motion.div>
          <motion.h1 variants={reveal} className="max-w-3xl text-balance text-[3.55rem] font-semibold leading-[.95] tracking-[-.075em] text-foreground sm:text-7xl lg:text-[6.4rem]">Find the edge<br /><span className="text-primary">before the market</span><br />closes it.</motion.h1>
          <motion.p variants={reveal} className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">NexaTraders watches the world’s exchanges at machine speed, weighs the risk, and turns short-lived price differences into a strategy you can understand.</motion.p>
          <motion.div variants={reveal} className="mt-8 flex flex-wrap gap-3"><ButtonLink href="/packages">Explore packages <ArrowRight size={15} /></ButtonLink><ButtonLink href="/about" variant="outline"><Play size={14} /> See how it works</ButtonLink></motion.div>
          <motion.div variants={reveal} className="mt-10 flex items-center gap-3 text-xs text-muted-foreground"><div className="flex -space-x-2">{['MC', 'EV', 'JB'].map((initials, index) => <span key={initials} className="grid h-7 w-7 place-items-center rounded-full border-2 border-background bg-secondary font-mono text-[9px] text-primary">{initials}</span>)}</div><span><strong className="text-foreground">2,400+</strong> signal-led accounts</span><span className="h-3 w-px bg-border" /><span className="positive-text">● 99.98% uptime</span></motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: .96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .8, delay: .2 }} className="lg:pt-3"><ScanPanel /></motion.div>
      </div>
      <ExchangeTicker />
    </section>

    <main>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="grid gap-10 border-b border-border pb-16 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border"><Reveal className="sm:px-8 sm:first:pl-0"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Capital routed</p><p className="mt-3 text-4xl font-semibold tracking-[-.06em]">$84.7M</p><p className="mt-2 text-sm text-accent">↑ 18.6% this quarter</p></Reveal><Reveal className="sm:px-8" delay={.08}><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Decision latency</p><p className="mt-3 text-4xl font-semibold tracking-[-.06em]">42<span className="text-xl text-primary">ms</span></p><p className="mt-2 text-sm text-muted-foreground">from tick to signal</p></Reveal><Reveal className="sm:px-8 sm:pr-0" delay={.16}><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Markets mapped</p><p className="mt-3 text-4xl font-semibold tracking-[-.06em]">18</p><p className="mt-2 text-sm text-muted-foreground">venues / 24 hours a day</p></Reveal></div></section>

      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8 lg:pb-32"><div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]"><Reveal><SectionHeading eyebrow="The loop" title="A calmer way to move through a noisy market." copy="The system does the repetitive work. You keep the context, the controls, and the final say." /><div className="mt-8"><ButtonLink href="/about" variant="outline">Our operating principles <ArrowRight size={15} /></ButtonLink></div></Reveal><motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid gap-3">{processSteps.map(({ number, title, copy, icon: Icon }) => <motion.div key={number} variants={reveal} className="group flex gap-5 rounded-xl border border-border bg-card/60 p-5 hover-lift"><span className="font-mono text-xs text-primary">{number}</span><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary"><Icon size={19} /></span><div><h3 className="text-lg font-semibold tracking-[-.03em]">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{copy}</p></div><ArrowUpRight size={15} className="ml-auto shrink-0 text-muted-foreground/40 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" /></motion.div>)}</motion.div></div></section>

      <section className="border-y border-border bg-[#0c0f0f]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-28"><Reveal><SectionHeading eyebrow="The readout" title="See the market thinking in real time." copy="The dashboard is designed to answer the useful questions: what moved, what changed, and why did the engine choose this route?" /><div className="mt-8 flex gap-3"><span className="inline-flex items-center gap-2 rounded-md border border-accent/25 bg-accent/5 px-3 py-2 font-mono text-[10px] text-accent"><Radio size={13} /> live system telemetry</span></div></Reveal><Reveal delay={.12}><div className="rounded-2xl border border-border bg-card p-4 sm:p-6"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">BTC / USDT · spread monitor</p><p className="mt-2 text-2xl font-semibold">$71,842.09 <span className="font-mono text-xs text-accent">+2.84%</span></p></div><div className="flex items-center gap-1.5 font-mono text-[10px] text-accent"><span className="h-1.5 w-1.5 animate-pulse-signal rounded-full bg-accent" />Live</div></div><div className="mt-8"><LiveChart /></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-border bg-secondary/50 p-3"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Binance</span><span className="positive-text"><ArrowUpRight size={13} /></span></div><p className="mt-2 font-mono text-sm">$71,764.30</p></div><div className="rounded-lg border border-primary/30 bg-primary/5 p-3"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Route</span><span className="signal-text"><ArrowRight size={13} /></span></div><p className="mt-2 font-mono text-sm text-primary">+2.84% edge</p></div><div className="rounded-lg border border-border bg-secondary/50 p-3"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Kraken</span><span className="positive-text"><ArrowDownRight size={13} /></span></div><p className="mt-2 font-mono text-sm">$73,806.20</p></div></div></div></Reveal></div></section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><Reveal><SectionHeading eyebrow="Built underneath" title="Fast where it matters. Quiet where it should be." copy="The infrastructure is purpose-built for a market that changes between one refresh and the next." /></Reveal><div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-4"><Reveal delay={.04}><Feature icon={Network} title="18 venues" copy="One connected view across the exchanges that matter." /></Reveal><Reveal delay={.1}><Feature icon={Cpu} title="42ms decisions" copy="Low-latency scoring from raw tick to clear action." /></Reveal><Reveal delay={.16}><Feature icon={LockKeyhole} title="Bounded access" copy="Permissions and limits are part of every strategy." /></Reveal><Reveal delay={.22}><Feature icon={FileCheck2} title="Readable audit" copy="A reason attached to every meaningful decision." /></Reveal></div></section>

      <section className="border-y border-border bg-[#0c0f0f]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8 lg:py-28"><Reveal><div className="relative rounded-2xl border border-primary/20 bg-[#111513] p-6 sm:p-8"><div className="absolute right-5 top-5 rounded-full border border-primary/25 px-2 py-1 font-mono text-[9px] text-primary">VERIFIED ROUTE</div><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground"><LockKeyhole size={18} /></span><div><p className="font-mono text-[10px] uppercase text-muted-foreground">Settlement vault</p><p className="text-sm">Strategy reserve / 04</p></div></div><div className="my-8 h-px gold-rule opacity-50" /><div className="grid gap-5 sm:grid-cols-2"><div><p className="font-mono text-[10px] uppercase text-muted-foreground">Protected balance</p><p className="mt-2 text-2xl font-semibold">$2,048,391.44</p></div><div><p className="font-mono text-[10px] uppercase text-muted-foreground">Policy state</p><p className="mt-2 flex items-center gap-2 text-sm text-accent"><span className="h-2 w-2 rounded-full bg-accent" />All boundaries active</p></div></div><div className="mt-7 flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-3 py-2.5"><span className="font-mono text-[10px] text-muted-foreground">0x7B...94AC</span><button onClick={copyAddress} className="flex items-center gap-1 text-xs text-primary hover:underline" data-testid="button-copy-vault">{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Copied' : 'Copy'}</button></div></div></Reveal><Reveal delay={.12}><SectionHeading eyebrow="Security, not theatre" title="Your controls are part of the strategy." copy="We believe the most trustworthy automation is legible. Every package is built around clear permissions, visible boundaries, and a human-readable history." /><div className="mt-8 flex flex-wrap gap-3"><span className="rounded-md border border-border bg-card px-3 py-2 font-mono text-[10px] text-muted-foreground">encrypted transport</span><span className="rounded-md border border-border bg-card px-3 py-2 font-mono text-[10px] text-muted-foreground">segmented keys</span><span className="rounded-md border border-border bg-card px-3 py-2 font-mono text-[10px] text-muted-foreground">risk gates</span></div></Reveal></div></section>

      <section className="mx-auto max-w-4xl px-5 py-20 lg:py-28"><Reveal><SectionHeading eyebrow="Questions, answered" title="The short version." align="center" /></Reveal><div className="mt-10 divide-y divide-border border-y border-border">{faqs.map(([question, answer], index) => <Reveal key={question} delay={index * .04}><div><button onClick={() => setActiveFaq(activeFaq === index ? -1 : index)} className="flex w-full items-center justify-between gap-6 py-5 text-left" data-testid={`button-faq-${index}`}><span className="text-base font-medium">{question}</span><ChevronDown size={17} className={`shrink-0 text-muted-foreground transition-transform ${activeFaq === index ? 'rotate-180 text-primary' : ''}`} /></button><AnimatePresence initial={false}>{activeFaq === index && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="max-w-2xl pb-5 text-sm leading-6 text-muted-foreground">{answer}</p></motion.div>}</AnimatePresence></div></Reveal>)}</div><div className="mt-8 text-center"><ButtonLink href="/contact" variant="outline">Ask a different question <MessageCircle size={15} /></ButtonLink></div></section>

      <section id="newsletter" className="relative overflow-hidden border-t border-border"><div className="absolute inset-0 grid-fade opacity-60" /><div className="relative mx-auto max-w-3xl px-5 py-20 text-center lg:py-28"><Reveal><div className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary"><Bell size={19} /></div><h2 className="mt-6 text-3xl font-semibold tracking-[-.055em] sm:text-5xl">Keep your eye on the signal.</h2><p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground">A weekly note on market structure, execution, and what the data is actually saying.</p>{joined ? <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm text-accent"><Check size={16} />Signal letter confirmed. See you in the next issue.</div> : <form onSubmit={(e) => { e.preventDefault(); if (email) setJoined(true); }} className="mx-auto mt-8 flex max-w-md gap-2"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" className="min-w-0 flex-1 rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary" data-testid="input-home-email" /><button type="submit" className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-[#f3cc68]" data-testid="button-home-subscribe">Subscribe</button></form>}</Reveal></div></section>
    </main>
  </div>;
}

function Feature({ icon: Icon, title, copy }: { icon: typeof Globe2; title: string; copy: string }) {
  return <div className="hover-lift rounded-xl border border-border bg-card/60 p-5"><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon size={17} /></span><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></div>;
}

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <section className="relative overflow-hidden border-b border-border"><div className="absolute inset-0 grid-fade opacity-60" /><div className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 lg:px-8 lg:pb-24 lg:pt-24"><Reveal><SectionHeading eyebrow={eyebrow} title={title} copy={copy} /></Reveal></div></section>;
}

function PackageCard({ tier }: { tier: PackageTier }) {
  return <Reveal className={`${tier.featured ? 'lg:-translate-y-4' : ''}`}><div className={`relative flex h-full flex-col overflow-hidden rounded-xl border p-5 transition-all hover:-translate-y-1 ${tier.featured ? 'border-primary/60 bg-primary/[.055] shadow-[0_20px_70px_rgba(232,185,73,.09)]' : 'border-border bg-card/70 hover:border-primary/35'}`}>{tier.featured && <div className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.14em] text-primary-foreground">Most selected</div>}<div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Tier / {tier.name}</p><p className="mt-4 text-4xl font-semibold tracking-[-.07em]">{tier.amount}</p></div><span className={`grid h-9 w-9 place-items-center rounded-lg ${tier.featured ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'}`}><Sparkles size={17} /></span></div><div className="mt-8 space-y-3 border-t border-border/70 pt-5 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Target ROI</span><strong className="text-accent">{tier.roi}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Projected return</span><strong>{tier.returnAmount}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span>{tier.duration}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Daily projection</span><span>{tier.daily}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Max slots</span><span>{tier.slots} active</span></div></div><ButtonLink href="/register" variant={tier.featured ? 'primary' : 'outline'} className="mt-7 w-full">{tier.featured ? 'Choose Rise' : 'View this tier'} <ArrowRight size={14} /></ButtonLink></div></Reveal>;
}

function PackagesPage() {
  return <div><PageIntro eyebrow="Capital, with context" title="Choose the room your strategy needs." copy="Five clear package structures. One operating system that keeps the decision readable from the first dollar to the last." /><section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">{packages.map((tier) => <PackageCard key={tier.name} tier={tier} />)}</div><Reveal><div className="mt-10 flex flex-col gap-4 rounded-xl border border-border bg-card/50 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-accent" size={20} /><div><p className="font-medium">A note on the numbers</p><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">The projections above are package targets, not guarantees. Digital assets are volatile. Read the terms and speak with support before committing capital.</p></div></div><ButtonLink href="/contact" variant="outline" className="shrink-0">Talk to support <MessageCircle size={14} /></ButtonLink></div></Reveal></section><section className="border-t border-border bg-[#0c0f0f]"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><SectionHeading eyebrow="Every tier includes" title="The same intelligence underneath." /><div className="mt-10 grid gap-3 sm:grid-cols-3"><Feature icon={BarChart3} title="Live opportunity map" copy="Your strategy reads venue-level price and liquidity data continuously." /><Feature icon={LockKeyhole} title="Defined boundaries" copy="Risk controls are configured before the engine can act." /><Feature icon={Database} title="Decision history" copy="See the reason and route behind each meaningful system event." /></div></div></section></div>;
}

function AboutPage() {
  const [active, setActive] = useState('observe');
  const tabs: Record<string, { label: string; title: string; copy: string }> = { observe: { label: 'Observe', title: 'The market is not one market.', copy: 'NexaTraders starts with a wide lens: venue prices, book depth, latency, liquidity, fees, and the small frictions that make a route real or imaginary.' }, qualify: { label: 'Qualify', title: 'Signal is a quality filter.', copy: 'Our models rank opportunities by what survives contact with the market. A large headline spread is less useful than a smaller edge with clean execution.' }, execute: { label: 'Execute', title: 'Precision beats urgency.', copy: 'When an opportunity clears its risk boundary, the engine follows a defined route. When it does not, the most intelligent action is to wait.' } };
  return <div><PageIntro eyebrow="A different kind of crypto company" title="We built the part of the market that rewards patience." copy="NexaTraders is a market intelligence company for a volatile asset class. Our job is to turn fast-moving complexity into considered decisions." /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]"><Reveal><SectionHeading eyebrow="Our point of view" title="Automation should make you feel more informed, not less." copy="There is enough spectacle in crypto. We focus on the underlying mechanics: where prices separate, how long an edge can survive, and which risks are worth taking." /></Reveal><Reveal delay={.1}><div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-[#111513] p-7 sm:p-10"><div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" /><p className="relative font-mono text-[11px] uppercase tracking-[.18em] text-primary">The Nexa standard</p><p className="relative mt-8 max-w-xl text-3xl font-medium leading-tight tracking-[-.055em] sm:text-5xl">“If we cannot explain the edge, we do not take it.”</p><div className="relative mt-10 flex items-center gap-3 text-sm text-muted-foreground"><span className="grid h-8 w-8 place-items-center rounded-full border border-primary/40 bg-primary/10 font-mono text-xs text-primary">NT</span>Principle 01 / Clarity over noise</div></div></Reveal></div></section><section className="border-y border-border bg-[#0c0f0f]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.7fr_1.3fr] lg:px-8 lg:py-28"><Reveal><SectionHeading eyebrow="How we think" title="Three moves. No magic." copy="A good system does not hide its work. It gives every step a purpose." /></Reveal><Reveal delay={.12}><div><div className="flex flex-wrap gap-2 border-b border-border pb-3">{Object.entries(tabs).map(([key, tab]) => <button key={key} onClick={() => setActive(key)} className={`rounded-md px-3 py-2 font-mono text-[10px] uppercase tracking-[.16em] transition ${active === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`} data-testid={`button-about-${key}`}>{tab.label}</button>)}</div><AnimatePresence mode="wait"><motion.div key={active} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="pt-8"><p className="font-mono text-xs text-primary">0{Object.keys(tabs).indexOf(active) + 1} / 03</p><h3 className="mt-4 text-3xl font-semibold tracking-[-.05em]">{tabs[active].title}</h3><p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{tabs[active].copy}</p></motion.div></AnimatePresence></div></Reveal></div></section><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="grid gap-3 sm:grid-cols-3"><Reveal><div className="border-l border-primary pl-5"><p className="font-mono text-3xl text-primary">2019</p><p className="mt-2 text-sm text-muted-foreground">The first route tested across two venues.</p></div></Reveal><Reveal delay={.08}><div className="border-l border-accent pl-5"><p className="font-mono text-3xl text-accent">18</p><p className="mt-2 text-sm text-muted-foreground">Markets now mapped by the engine.</p></div></Reveal><Reveal delay={.16}><div className="border-l border-primary pl-5"><p className="font-mono text-3xl text-primary">24/7</p><p className="mt-2 text-sm text-muted-foreground">Monitoring built for a market without a closing bell.</p></div></Reveal></div></section></div>;
}

function BlogCard({ article }: { article: Article }) {
  return <Link href={`/blog/${article.slug}`} className="group flex h-full flex-col rounded-xl border border-border bg-card/60 p-5 hover-lift" data-testid={`link-article-${article.slug}`}><div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[.15em]"><span className="text-primary">{article.category}</span><span className="text-muted-foreground">{article.readTime}</span></div><div className="mt-12 flex-1"><h2 className="text-xl font-semibold leading-tight tracking-[-.045em] group-hover:text-primary">{article.title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{article.excerpt}</p></div><div className="mt-8 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground"><span>{article.date}</span><ArrowUpRight size={15} className="text-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div></Link>;
}

function BlogPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const filtered = useMemo(() => articles.filter((article) => (category === 'All' || article.category === category) && `${article.title} ${article.excerpt}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  return <div><PageIntro eyebrow="Signal / journal" title="Ideas for the space between the ticks." copy="Market structure, risk, and the practical side of automated arbitrage — written for people who like to understand the mechanism." /><section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20"><div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-md px-3 py-2 text-xs transition ${category === item ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`} data-testid={`button-category-${item.toLowerCase().replace(/\W/g, '-')}`}>{item}</button>)}</div><div className="relative w-full lg:w-64"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the journal" className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" data-testid="input-blog-search" /></div></div>{filtered.length ? <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filtered.map((article, index) => <Reveal key={article.slug} delay={index * .06}><BlogCard article={article} /></Reveal>)}</div> : <div className="mt-8 rounded-xl border border-dashed border-border bg-card/40 py-20 text-center"><BookOpen className="mx-auto text-muted-foreground" size={25} /><p className="mt-4 font-medium">No notes found</p><p className="mt-1 text-sm text-muted-foreground">Try a different phrase or clear the category.</p><button onClick={() => { setQuery(''); setCategory('All'); }} className="mt-5 text-sm text-primary hover:underline" data-testid="button-clear-blog-filters">Clear filters</button></div>}</section></div>;
}

function ArticlePage() {
  const [, params] = useRoute('/blog/:slug');
  const article = articles.find((item) => item.slug === params?.slug);
  if (!article) return <NotFound />;
  return <div><section className="border-b border-border"><div className="mx-auto max-w-3xl px-5 pb-14 pt-14 lg:pb-20 lg:pt-20"><Link href="/blog" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.18em] text-primary hover:underline" data-testid="link-back-blog"><ArrowDownRight size={13} className="rotate-45" />Back to insights</Link><p className="mt-12 font-mono text-[10px] uppercase tracking-[.18em] text-primary">{article.category} / {article.readTime}</p><h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.02] tracking-[-.065em] sm:text-6xl">{article.title}</h1><p className="mt-6 text-lg leading-8 text-muted-foreground">{article.excerpt}</p><div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground"><span className="grid h-8 w-8 place-items-center rounded-full border border-primary/40 bg-primary/10 font-mono text-[10px] text-primary">{article.author.split(' ').map((name) => name[0]).join('')}</span>{article.author}<span className="h-3 w-px bg-border" />{article.date}</div></div></section><article className="mx-auto max-w-3xl px-5 py-14 lg:py-20"><div className="mb-10 h-px gold-rule opacity-50" />{article.body.map((paragraph, index) => <Reveal key={paragraph} delay={index * .06}><p className="mb-7 text-lg leading-9 text-foreground/85">{paragraph}</p></Reveal>)}<div className="mt-14 rounded-xl border border-border bg-card p-6"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-primary">Keep reading</p><p className="mt-2 text-sm text-muted-foreground">New notes on market structure and system design land in the signal letter.</p><ButtonLink href="/#newsletter" variant="outline" className="mt-4">Join the letter <ArrowRight size={14} /></ButtonLink></div></article></div>;
}

function ContactPage() {
  const [sent, setSent] = useState(false);
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  return <div><PageIntro eyebrow="Human support / 09:00–18:00 UTC" title="Bring us the question behind the question." copy="Whether you are comparing packages or trying to understand a signal, our support team will give you a straight answer." /><section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[.7fr_1.3fr] lg:px-8 lg:py-24"><Reveal><div><SectionHeading eyebrow="Reach the desk" title="No scripts. No pressure." copy="Tell us what you are trying to solve. We usually respond within one business day." /><div className="mt-9 space-y-4"><a href="mailto:support@nexatraders.com" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary" data-testid="link-contact-email"><Mail size={17} className="text-primary" />support@nexatraders.com</a><a href="mailto:compliance@nexatraders.com" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary" data-testid="link-contact-compliance"><ShieldCheck size={17} className="text-primary" />compliance@nexatraders.com</a><div className="flex items-center gap-3 text-sm text-muted-foreground"><Clock3 size={17} className="text-primary" />Mon–Fri / 09:00–18:00 UTC</div></div></div></Reveal><Reveal delay={.1}><div className="rounded-xl border border-border bg-card/70 p-5 sm:p-7">{sent ? <div className="flex min-h-[360px] flex-col items-center justify-center text-center"><span className="grid h-12 w-12 place-items-center rounded-full border border-accent/30 bg-accent/10 text-accent"><Check size={22} /></span><h2 className="mt-6 text-2xl font-semibold tracking-[-.04em]">Message received.</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">A member of the NexaTraders desk will be in touch within one business day.</p><button onClick={() => setSent(false)} className="mt-6 text-sm text-primary hover:underline" data-testid="button-send-another">Send another message</button></div> : <form onSubmit={submit} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm"><span className="mb-2 block text-muted-foreground">Name</span><input required className="w-full rounded-lg border border-border bg-secondary px-3 py-3 outline-none focus:border-primary" data-testid="input-contact-name" /></label><label className="text-sm"><span className="mb-2 block text-muted-foreground">Email</span><input required type="email" className="w-full rounded-lg border border-border bg-secondary px-3 py-3 outline-none focus:border-primary" data-testid="input-contact-email" /></label></div><label className="block text-sm"><span className="mb-2 block text-muted-foreground">What can we help with?</span><select className="w-full rounded-lg border border-border bg-secondary px-3 py-3 outline-none focus:border-primary" data-testid="select-contact-topic"><option>Understanding a package</option><option>Account question</option><option>Security and compliance</option><option>Something else</option></select></label><label className="block text-sm"><span className="mb-2 block text-muted-foreground">Message</span><textarea required rows={6} placeholder="A little context helps us give a useful answer." className="w-full resize-none rounded-lg border border-border bg-secondary px-3 py-3 outline-none focus:border-primary" data-testid="textarea-contact-message" /></label><button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-[#f3cc68]" data-testid="button-submit-contact">Send to the desk <Send size={15} /></button></form>}</div></Reveal></section></div>;
}

function PrivacyPage() {
  const sections = [['01', 'What we collect', 'When you contact us, we may collect the details you choose to share, such as your name, email address, and message. We also receive basic technical information needed to keep this website reliable, such as browser type and approximate usage events.'], ['02', 'How we use it', 'We use information to respond to support requests, improve the website, send the signal letter when you opt in, and maintain security. We do not sell personal information.'], ['03', 'Retention and access', 'We keep information only for as long as it serves the purpose it was collected for or as required by law. You can ask us what information we hold about you, request correction, or request deletion by writing to privacy@nexatraders.com.'], ['04', 'Cookies and analytics', 'NexaTraders may use essential cookies and privacy-conscious analytics to understand site performance. Your browser can be configured to limit or remove cookies, although some site functions may change.'], ['05', 'Third-party services', 'Some site functions rely on carefully selected providers for hosting, email delivery, and analytics. Those providers process information under their own security and privacy commitments.'], ['06', 'Changes to this policy', 'We may update this policy as the website or applicable requirements change. The effective date at the top of this page will always reflect the latest version.']]; 
  return <div><PageIntro eyebrow="Legal / plain language" title="Privacy policy" copy="We keep this readable because privacy notices should help you make decisions, not hide them." /><section className="mx-auto max-w-4xl px-5 py-14 lg:px-8 lg:py-20"><div className="mb-12 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5 font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground"><span>Effective date / May 28, 2024</span><span>Version 1.4</span></div><div className="space-y-10">{sections.map(([number, title, copy]) => <Reveal key={number}><section className="grid gap-4 sm:grid-cols-[72px_1fr]"><span className="font-mono text-sm text-primary">{number}</span><div><h2 className="text-xl font-semibold tracking-[-.03em]">{title}</h2><p className="mt-3 text-base leading-8 text-muted-foreground">{copy}</p></div></section></Reveal>)}</div><div className="mt-14 rounded-xl border border-border bg-card p-5 text-sm leading-6 text-muted-foreground">Questions about this policy? Contact <a href="mailto:privacy@nexatraders.com" className="text-primary hover:underline" data-testid="link-privacy-email">privacy@nexatraders.com</a>.</div></section></div>;
}

function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const isRegister = mode === 'register';
  return <div className="relative flex min-h-[calc(100dvh-72px)] items-center justify-center overflow-hidden px-5 py-16"><div className="absolute inset-0 grid-fade opacity-60" /><div className="relative w-full max-w-md"><div className="mb-8 text-center"><Logo compact /><h1 className="mt-8 text-3xl font-semibold tracking-[-.05em]">{isRegister ? 'Make room for better decisions.' : 'Welcome back to the signal.'}</h1><p className="mt-3 text-sm text-muted-foreground">{isRegister ? 'Create your NexaTraders access in under a minute.' : 'Sign in to continue to your NexaTraders workspace.'}</p></div><div className="rounded-xl border border-border bg-card/85 p-6 shadow-2xl backdrop-blur sm:p-8">{submitted ? <div className="py-8 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary"><Check size={20} /></span><h2 className="mt-5 text-xl font-semibold">This is a preview.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Authentication is not connected in this experience. Your form was captured client-side, but no account was created.</p><button onClick={() => setSubmitted(false)} className="mt-6 text-sm text-primary hover:underline" data-testid="button-auth-reset">Back to form</button></div> : <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">{isRegister && <label className="block text-sm"><span className="mb-2 block text-muted-foreground">Full name</span><input required className="w-full rounded-lg border border-border bg-secondary px-3 py-3 outline-none focus:border-primary" data-testid="input-auth-name" /></label>}<label className="block text-sm"><span className="mb-2 block text-muted-foreground">Email</span><input required type="email" className="w-full rounded-lg border border-border bg-secondary px-3 py-3 outline-none focus:border-primary" data-testid="input-auth-email" /></label><label className="block text-sm"><span className="mb-2 block text-muted-foreground">Password</span><input required type="password" minLength={6} className="w-full rounded-lg border border-border bg-secondary px-3 py-3 outline-none focus:border-primary" data-testid="input-auth-password" /></label><button type="submit" className="mt-2 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-[#f3cc68]" data-testid={`button-auth-${mode}`}>{isRegister ? 'Create preview access' : 'Sign in'} <ArrowRight size={15} className="ml-1 inline" /></button></form>}<div className="mt-6 border-t border-border pt-5 text-center text-xs text-muted-foreground">{isRegister ? 'Already have access? ' : 'New to NexaTraders? '}<button onClick={() => setLocation(isRegister ? '/login' : '/register')} className="text-primary hover:underline" data-testid="button-auth-switch">{isRegister ? 'Sign in' : 'Create an account'}</button></div></div><p className="mt-6 text-center text-[11px] text-muted-foreground">By continuing, you acknowledge our <Link href="/privacy" className="text-primary hover:underline" data-testid="link-auth-privacy">privacy policy</Link>.</p></div></div>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch><Route path="/" component={Home} /><Route path="/packages" component={PackagesPage} /><Route path="/about" component={AboutPage} /><Route path="/blog" component={BlogPage} /><Route path="/blog/:slug" component={ArticlePage} /><Route path="/privacy" component={PrivacyPage} /><Route path="/contact" component={ContactPage} /><Route path="/login">{() => <AuthPage mode="login" />}</Route><Route path="/register">{() => <AuthPage mode="register" />}</Route><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Navbar /><Router /><Footer /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;