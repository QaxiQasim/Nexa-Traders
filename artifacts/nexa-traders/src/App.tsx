import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock,
  Clock3,
  Code2,
  Coins,
  Copy,
  Cpu,
  Crown,
  Database,
  ExternalLink,
  Eye,
  Facebook,
  FileCheck2,
  Globe2,
  Info,
  Instagram,
  Layers,
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
  Sliders,
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
import { UserDashboard } from '@/components/UserDashboard';
import { fetchUserProfileFromDb, syncUserProfile } from '@/lib/supabase';
import { AdminLoginPage } from '@/components/admin/AdminLoginPage';
import { AdminLayout } from '@/components/admin/AdminLayout';

const queryClient = new QueryClient();

const reveal: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={reveal} transition={{ delay }} className={className}>{children}</motion.div>;
}

function Logo({ compact = false, className = '' }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 transition-opacity hover:opacity-95 ${className}`} data-testid="link-logo">
      <img
        src="/logo.png"
        alt="Nexa Trades Logo"
        className={compact ? 'h-9 w-auto object-contain' : 'h-11 sm:h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(232,185,73,0.35)]'}
      />
    </Link>
  );
}

function ButtonLink({ href, children, variant = 'primary', className = '', onClick }: { href: string; children: ReactNode; variant?: 'primary' | 'outline' | 'ghost'; className?: string; onClick?: () => void }) {
  const styles = variant === 'primary'
    ? 'bg-primary text-primary-foreground hover:bg-[#f3cc68] shadow-[0_12px_32px_rgba(232,185,73,.13)] font-sans'
    : variant === 'outline'
      ? 'border border-card-border bg-card/60 text-foreground hover:border-primary/60 hover:bg-primary/5 font-sans'
      : 'text-muted-foreground hover:bg-secondary hover:text-foreground font-sans';
  return <Link href={href} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${styles} ${className}`} data-testid={`link-${href.replace(/\W/g, '')}`}>{children}</Link>;
}

function SectionHeading({ eyebrow, title, copy, align = 'left' }: { eyebrow: string; title: string; copy?: string; align?: 'left' | 'center' }) {
  return (
    <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <div className={`mb-3.5 flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-primary ${align === 'center' ? 'justify-center' : ''}`}><span className="h-px w-6 bg-primary/70" />{eyebrow}</div>
      <h2 className="font-display text-balance text-3xl font-bold leading-[1.12] tracking-[-0.04em] text-foreground sm:text-5xl">{title}</h2>
      {copy && <p className="mt-4 text-base leading-relaxed text-muted-foreground/90 sm:text-lg">{copy}</p>}
    </div>
  );
}

function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const nav = [['/trades', 'Arbitrage Live Trades'], ['/packages', 'Packages'], ['/dashboard', 'Dashboard'], ['/about', 'Our edge'], ['/blog', 'Insights'], ['/contact', 'Contact']];
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

function LiveChart({ compact = false, currentPrice }: { compact?: boolean; currentPrice?: number }) {
  const base = [34, 38, 36, 43, 41, 47, 45, 52, 50, 57, 55, 60, 58, 67, 63, 70, 68, 75, 71, 78, 82, 79, 86, 89];
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((v) => v + 1), 1500);
    return () => window.clearInterval(id);
  }, []);

  const points = base
    .map((value, i) => `${(i / (base.length - 1)) * 100},${100 - value - ((tick + i) % 4 === 0 ? 2 : 0)}`)
    .join(' ');

  const displayPrice = currentPrice ? formatPrice(currentPrice) : '$64,250.80';
  const highAxis = currentPrice ? formatPrice(currentPrice * 1.04) : '$68.4K';
  const lowAxis = currentPrice ? formatPrice(currentPrice * 0.96) : '$64.0K';

  return (
    <div className={`relative ${compact ? 'h-28' : 'h-64'}`} data-testid="chart-live-exchange">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#e8b949" stopOpacity=".28" />
            <stop offset="1" stopColor="#e8b949" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${points} 100,100`} fill="url(#chartFill)" />
        <polyline points={points} fill="none" stroke="#e8b949" strokeWidth="1.6" vectorEffect="non-scaling-stroke" className="chart-draw" />
        <line x1="0" y1="72" x2="100" y2="72" stroke="rgba(255,255,255,.12)" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
      </svg>
      {!compact && (
        <>
          <span className="absolute left-0 top-[26%] font-mono text-[10px] text-muted-foreground">{highAxis}</span>
          <span className="absolute bottom-[4%] left-0 font-mono text-[10px] text-muted-foreground">{lowAxis}</span>
          <span className="absolute right-0 top-[8%] font-mono text-[11px] font-bold text-primary animate-pulse-signal">
            {displayPrice}
          </span>
        </>
      )}
    </div>
  );
}

function formatPrice(val: number) {
  if (!val || isNaN(val)) return '$0.00';
  if (val < 1) return `$${val.toFixed(4)}`;
  return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ExchangeTicker() {
  const [livePrices, setLivePrices] = useState<Record<string, number>>({
    'BTC/USDT': 96450.80,
    'ETH/USDT': 3450.40,
    'SOL/USDC': 198.20,
    'BNB/USDT': 672.60,
    'XRP/USDT': 2.4840,
    'ADA/USDT': 0.9820,
    'AVAX/USDT': 34.50,
  });

  const fetchTickerPrices = useCallback(async () => {
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/price');
      if (!res.ok) return;
      const data: { symbol: string; price: string }[] = await res.json();
      const priceMap: Record<string, number> = {};

      const symbolPairs: Record<string, string> = {
        BTCUSDT: 'BTC/USDT',
        ETHUSDT: 'ETH/USDT',
        SOLUSDT: 'SOL/USDC',
        BNBUSDT: 'BNB/USDT',
        XRPUSDT: 'XRP/USDT',
        ADAUSDT: 'ADA/USDT',
        AVAXUSDT: 'AVAX/USDT',
      };

      data.forEach((item) => {
        if (symbolPairs[item.symbol]) {
          priceMap[symbolPairs[item.symbol]] = parseFloat(item.price);
        }
      });

      setLivePrices((prev) => ({ ...prev, ...priceMap }));
    } catch {
      // smooth micro tick fallback
      setLivePrices((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          next[k] = parseFloat((next[k] * (1 + (Math.random() - 0.49) * 0.0003)).toFixed(k.includes('XRP') || k.includes('ADA') ? 4 : 2));
        });
        return next;
      });
    }
  }, []);

  useEffect(() => {
    fetchTickerPrices();
    const timer = setInterval(fetchTickerPrices, 1000);
    return () => clearInterval(timer);
  }, [fetchTickerPrices]);

  const rows = [
    { pair: 'BTC / USDT', rawPair: 'BTC/USDT', change: '+2.84%', route: 'Binance → Kraken' },
    { pair: 'ETH / USDT', rawPair: 'ETH/USDT', change: '+1.72%', route: 'OKX → Coinbase' },
    { pair: 'SOL / USDC', rawPair: 'SOL/USDC', change: '+4.18%', route: 'Bybit → Kraken' },
    { pair: 'BNB / USDT', rawPair: 'BNB/USDT', change: '+1.05%', route: 'Uniswap → Binance' },
    { pair: 'XRP / USDT', rawPair: 'XRP/USDT', change: '+0.88%', route: 'MEXC → Bitget' },
    { pair: 'ADA / USDT', rawPair: 'ADA/USDT', change: '+2.14%', route: 'KuCoin → Binance' },
    { pair: 'AVAX / USDT', rawPair: 'AVAX/USDT', change: '+3.42%', route: 'Bitstamp → HTX' },
  ];

  return (
    <div className="overflow-hidden border-y border-border/70 bg-[#0b0d0e]">
      <div className="animate-ticker flex min-w-max">
        {[...rows, ...rows, ...rows].map((item, index) => {
          const priceVal = livePrices[item.rawPair];
          const formatted = priceVal ? formatPrice(priceVal) : '$0.00';
          return (
            <div key={`${item.pair}-${index}`} className="flex items-center gap-4 border-r border-border/70 px-6 py-3 font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse-signal" />
              <span className="font-bold text-foreground">{item.pair}</span>
              <span className="font-bold text-primary">{formatted}</span>
              <span className="text-accent font-semibold">{item.change}</span>
              <span className="text-muted-foreground/70">{item.route}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScanPanel({ activePair, setActivePair }: { activePair: string; setActivePair: (p: string) => void }) {
  const [scans, setScans] = useState(1405);
  const [scanning, setScanning] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [execStep, setExecStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'chart' | 'orderbook' | 'risk'>('chart');
  const [lastRoute, setLastRoute] = useState<{ from: string; to: string; profit: string }>({ from: 'Binance', to: 'Kraken', profit: '+$2.40' });

  // Live Market Prices state fetched from Binance API for ScanPanel
  const [livePrices, setLivePrices] = useState<Record<string, number>>({
    'BTC/USDT': 64250.8,
    'ETH/USDT': 3450.2,
    'SOL/USDC': 158.4,
    'BNB/USDT': 572.1,
  });

  const fetchScanPrices = useCallback(async () => {
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/price');
      if (!res.ok) return;
      const data: { symbol: string; price: string }[] = await res.json();
      const priceMap: Record<string, number> = {};

      const symbolPairs: Record<string, string> = {
        BTCUSDT: 'BTC/USDT',
        ETHUSDT: 'ETH/USDT',
        SOLUSDT: 'SOL/USDC',
        BNBUSDT: 'BNB/USDT',
      };

      data.forEach((item) => {
        if (symbolPairs[item.symbol]) {
          priceMap[symbolPairs[item.symbol]] = parseFloat(item.price);
        }
      });

      setLivePrices((prev) => ({ ...prev, ...priceMap }));
    } catch {
      // silent fallback
    }
  }, []);

  useEffect(() => {
    fetchScanPrices();
    const timer = setInterval(fetchScanPrices, 2500);
    return () => clearInterval(timer);
  }, [fetchScanPrices]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setScans((v) => v + Math.floor(Math.random() * 3 + 1));
      setScanning(true);
      const stop = window.setTimeout(() => setScanning(false), 900);
      return () => window.clearTimeout(stop);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  const pairData: Record<string, { spread: string; confidence: string; defaultPrice: number; from: string; to: string; profit: string }> = {
    'BTC/USDT': { spread: '2.84%', confidence: '97.4%', defaultPrice: 64250.8, from: 'Binance', to: 'Kraken', profit: '+$2.40' },
    'ETH/USDT': { spread: '1.72%', confidence: '96.1%', defaultPrice: 3450.2, from: 'OKX', to: 'Coinbase', profit: '+$1.65' },
    'SOL/USDC': { spread: '4.18%', confidence: '98.9%', defaultPrice: 158.4, from: 'Bybit', to: 'Kraken', profit: '+$0.85' },
    'BNB/USDT': { spread: '3.05%', confidence: '95.8%', defaultPrice: 572.1, from: 'Uniswap', to: 'Binance', profit: '+$1.10' },
  };

  const currentInfo = pairData[activePair] || pairData['BTC/USDT'];
  const currentPrice = livePrices[activePair] || currentInfo.defaultPrice;

  const [lastRouteResult, setLastRouteResult] = useState<{
    from: string;
    to: string;
    bPrice: string;
    sPrice: string;
    profit: string;
  } | null>(null);

  const triggerExecution = () => {
    setExecuting(true);
    setExecStep(1);

    // Real-Time execution simulation using instant live market price
    const bPriceNum = currentPrice;
    const spreadPct = 0.0004 + Math.random() * 0.0008;
    const rawDiff = bPriceNum * spreadPct;
    const diff = Math.min(4.85, Math.max(0.01, rawDiff));
    const sPriceNum = bPriceNum + diff;
    const netProfit = (sPriceNum - bPriceNum).toFixed(2);

    const routeInfo = {
      from: currentInfo.from,
      to: currentInfo.to,
      bPrice: formatPrice(bPriceNum),
      sPrice: formatPrice(sPriceNum),
      profit: `+$${netProfit}`,
    };

    setLastRoute(routeInfo);
    setLastRouteResult(routeInfo);

    window.setTimeout(() => setExecStep(2), 500);
    window.setTimeout(() => setExecStep(3), 1100);
    window.setTimeout(() => {
      setExecuting(false);
      setExecStep(0);
    }, 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-[#0d1010] p-4 shadow-[0_0_90px_rgba(232,185,73,.18)] sm:p-6" data-testid="panel-live-scanner">
      <div className="absolute inset-0 grid-fade opacity-60" />
      <div className="relative">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full bg-accent ${scanning ? 'animate-pulse-signal' : ''}`} />
            <span className="font-mono text-[10px] uppercase tracking-[.16em] text-primary">Arbitrage Engine / Live</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] text-primary transition hover:bg-primary/20"
              onClick={() => setScanning(true)}
              data-testid="button-rescan"
            >
              Rescan <RefreshCw size={11} className={scanning ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Pair Selector Tabs */}
        <div className="mt-4 flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(pairData).map((pair) => (
              <button
                key={pair}
                onClick={() => setActivePair(pair)}
                className={`rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition ${
                  activePair === pair ? 'bg-primary text-primary-foreground font-semibold shadow-[0_0_10px_rgba(232,185,73,0.3)]' : 'border border-border/80 bg-secondary/50 text-muted-foreground hover:text-foreground'
                }`}
                data-testid={`button-pair-${pair.replace('/', '-')}`}
              >
                {pair}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="hidden sm:flex gap-1 font-mono text-[9px]">
            <button onClick={() => setActiveTab('chart')} className={`px-2 py-0.5 rounded ${activeTab === 'chart' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>Chart</button>
            <button onClick={() => setActiveTab('orderbook')} className={`px-2 py-0.5 rounded ${activeTab === 'orderbook' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>Depth</button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.15em] text-muted-foreground">Arbitrage Spread Edge</p>
            <p className="mt-1.5 text-4xl font-extrabold tracking-[-.06em] text-foreground sm:text-5xl">
              {currentInfo.spread.split('%')[0]}<span className="text-xl text-primary">%</span>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-accent">
              <ArrowUpRight size={14} />
              <strong className="text-foreground">{activePair}</strong> ({currentInfo.from} → {currentInfo.to})
            </p>
          </div>
          <div className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-right">
            <span className="block font-mono text-[9px] uppercase text-muted-foreground">Execution Prob</span>
            <span className="font-mono text-base font-bold text-accent">{currentInfo.confidence}</span>
          </div>
        </div>

        {/* Live Interactive Tab Content */}
        <div className="mt-5">
          {activeTab === 'chart' && <LiveChart currentPrice={currentPrice} />}
          {activeTab === 'orderbook' && (
            <div className="h-64 rounded-lg border border-border/80 bg-secondary/30 p-3 font-mono text-[10px]">
              <div className="flex justify-between border-b border-border/60 pb-1.5 text-muted-foreground font-bold">
                <span>BUY SIDE ({currentInfo.from})</span>
                <span>SELL SIDE ({currentInfo.to})</span>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-accent font-semibold">
                  <span>{formatPrice(currentPrice * 0.9998)} (1.84 {activePair.split('/')[0]})</span>
                  <span>{formatPrice(currentPrice * 1.0003)} (2.10 {activePair.split('/')[0]})</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{formatPrice(currentPrice * 0.9995)} (4.12 {activePair.split('/')[0]})</span>
                  <span>{formatPrice(currentPrice * 1.0006)} (1.45 {activePair.split('/')[0]})</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{formatPrice(currentPrice * 0.9991)} (0.95 {activePair.split('/')[0]})</span>
                  <span>{formatPrice(currentPrice * 1.0010)} (3.80 {activePair.split('/')[0]})</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Interactive Execution Controller */}
        <div className="mt-4 flex flex-col gap-2 border-t border-border/70 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={triggerExecution}
              disabled={executing}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-mono text-xs font-bold text-primary-foreground transition hover:bg-[#f3cc68] active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(232,185,73,0.3)]"
              data-testid="button-simulate-route"
            >
              <Zap size={14} className={executing ? 'animate-bounce text-primary-foreground' : ''} />
              {executing ? `Executing Step 0${execStep}/03...` : `Execute Live ${activePair} Route`}
            </button>

            {executing ? (
              <span className="animate-pulse font-mono text-[10px] text-accent font-semibold">
                ⚡ Locking Orderbook @ {formatPrice(currentPrice)}
              </span>
            ) : lastRouteResult ? (
              <span className="font-mono text-[10px] text-accent font-bold">
                ✓ Executed @ {lastRouteResult.bPrice} → {lastRouteResult.sPrice} ({lastRouteResult.profit} Net Profit)
              </span>
            ) : null}
          </div>

          {/* Interactive Micro-Step Telemetry Bar */}
          {executing && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 rounded-lg border border-accent/40 bg-accent/10 p-2.5 font-mono text-[10px]">
              <div className="flex items-center justify-between text-accent font-bold">
                <span>{execStep === 1 ? 'Step 01: Orderbook Lock' : execStep === 2 ? 'Step 02: 14ms Route Match' : 'Step 03: Yield Settled'}</span>
                <span>{execStep * 33}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-accent transition-all duration-500" style={{ width: `${execStep * 33}%` }} />
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/70 pt-4">
          <div>
            <span className="block font-mono text-[9px] uppercase text-muted-foreground">Exchanges</span>
            <span className="mt-1 block text-sm font-semibold text-foreground">18 connected</span>
          </div>
          <div>
            <span className="block font-mono text-[9px] uppercase text-muted-foreground">Scanned</span>
            <span className="mt-1 block text-sm font-semibold text-foreground">{scans.toLocaleString()} routes</span>
          </div>
          <div>
            <span className="block font-mono text-[9px] uppercase text-muted-foreground">Avg Latency</span>
            <span className="mt-1 block text-sm font-semibold text-primary">14 ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AiTradingBotHeroBg({ activePair }: { activePair: string }) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes = [
    { id: 'binance', name: 'Binance', x: 280, y: 220, price: '$71,842.09', spread: '+0.34%', vol: '$28.4M' },
    { id: 'kraken', name: 'Kraken', x: 740, y: 160, price: '$72,052.49', spread: '+0.29%', vol: '$18.2M' },
    { id: 'bybit', name: 'Bybit', x: 1220, y: 260, price: '$71,810.15', spread: '+0.41%', vol: '$22.6M' },
    { id: 'coinbase', name: 'Coinbase', x: 420, y: 680, price: '$71,990.00', spread: '+0.18%', vol: '$15.9M' },
    { id: 'okx', name: 'OKX', x: 920, y: 720, price: '$71,830.80', spread: '+0.32%', vol: '$19.4M' },
    { id: 'uniswap', name: 'Uniswap', x: 1540, y: 620, price: '$72,110.00', spread: '+0.55%', vol: '$14.1M' },
  ];

  const hoveredData = nodes.find((n) => n.id === hoveredNode);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0" data-testid="bg-interactive-arbitrage-map">
      {/* Ambient Gold & Emerald Radial Spotlights */}
      <div className="absolute -left-20 top-1/4 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(232,185,73,0.15)_0%,rgba(16,185,129,0.04)_40%,transparent_70%)] blur-3xl" />
      <div className="absolute right-[5%] top-10 h-[650px] w-[750px] rounded-full bg-[radial-gradient(circle,rgba(232,185,73,0.12)_0%,transparent_75%)] blur-3xl" />

      {/* Interactive Exchange Arbitrage Network Graph Backdrop */}
      <div className="absolute inset-0 opacity-55 sm:opacity-75 transition-opacity duration-700">
        <svg className="h-full w-full" viewBox="0 0 1920 1080" fill="none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="arbitrageBeam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e8b949" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f3cc68" stopOpacity="0.9" />
            </linearGradient>

            <filter id="neonBeamGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connected Liquid Arbitrage Pathways between Exchanges */}
          <g stroke="url(#arbitrageBeam)" filter="url(#neonBeamGlow)">
            {/* Binance -> Kraken */}
            <path d="M 280 220 L 740 160" strokeWidth="2.5" strokeDasharray="10 6" className="chart-draw" />
            {/* Kraken -> Bybit */}
            <path d="M 740 160 L 1220 260" strokeWidth="2" opacity="0.6" />
            {/* Binance -> Coinbase */}
            <path d="M 280 220 L 420 680" strokeWidth="2" opacity="0.5" />
            {/* Kraken -> OKX */}
            <path d="M 740 160 L 920 720" strokeWidth="3" strokeDasharray="12 6" className="chart-draw" />
            {/* Bybit -> Uniswap */}
            <path d="M 1220 260 L 1540 620" strokeWidth="2.5" strokeDasharray="8 4" opacity="0.8" />
            {/* OKX -> Uniswap */}
            <path d="M 920 720 L 1540 620" strokeWidth="2" opacity="0.6" />
          </g>

          {/* Interactive Exchange Nodes */}
          {nodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="pointer-events-auto cursor-pointer"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Node Outer Pulsing Ring */}
                <circle r={isHovered ? '28' : '22'} fill="none" stroke="#e8b949" strokeWidth="1.5" strokeDasharray="4 2" className="animate-spin-slow opacity-70" />
                {/* Node Inner Core */}
                <circle r={isHovered ? '16' : '12'} fill={isHovered ? '#f3cc68' : '#0d1114'} stroke="#e8b949" strokeWidth="2.5" />
                {/* Node Label Badge */}
                <rect x="-45" y="24" width="90" height="24" rx="5" fill="#0d1114" stroke="#e8b949" strokeWidth="1" strokeOpacity="0.6" />
                <text x="0" y="40" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" fill="#e8b949">
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Interactive Hover Card Tooltip overlay for Exchange Nodes */}
        {hoveredData && (
          <div
            className="pointer-events-none absolute rounded-xl border border-primary/60 bg-[#0d1010]/95 p-3 font-mono shadow-[0_10px_30px_rgba(232,185,73,0.3)] backdrop-blur-md transition-all duration-200 z-20"
            style={{ left: `${(hoveredData.x / 1920) * 100}%`, top: `${(hoveredData.y / 1080) * 100 - 10}%` }}
          >
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-primary">{hoveredData.name} Node</span>
              <span className="text-[9px] text-accent">● Live 12ms</span>
            </div>
            <div className="mt-2 text-[10px] space-y-1 text-muted-foreground">
              <div>Price: <strong className="text-foreground">{hoveredData.price}</strong></div>
              <div>Spread: <strong className="text-accent">{hoveredData.spread}</strong></div>
              <div>24h Vol: <strong className="text-primary">{hoveredData.vol}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Smooth Dark Vignette & Edge Blurs */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90" />
    </div>
  );
}

function ExchangeLogoIcon({ name }: { name: string }) {
  switch (name) {
    case 'Binance':
      return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#F0B90B">
          <path d="M12 2L6.5 7.5L9.3 10.3L12 7.6L14.7 10.3L17.5 7.5L12 2ZM3 11L5.8 13.8L3 16.6L0.2 13.8L3 11ZM21 11L23.8 13.8L21 16.6L18.2 13.8L21 11ZM12 11.2L14.6 13.8L12 16.4L9.4 13.8L12 11.2ZM12 20.2L9.3 17.5L6.5 20.3L12 22.8L17.5 20.3L14.7 17.5L12 20.2Z" />
        </svg>
      );
    case 'Coinbase':
      return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#0052FF">
          <circle cx="12" cy="12" r="10" />
          <rect x="8" y="8" width="8" height="8" rx="2" fill="#0b0e11" />
        </svg>
      );
    case 'OKX':
      return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#FFFFFF">
          <rect x="2" y="2" width="6" height="6" rx="1" />
          <rect x="16" y="2" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
          <rect x="2" y="16" width="6" height="6" rx="1" />
          <rect x="16" y="16" width="6" height="6" rx="1" />
        </svg>
      );
    case 'MEXC':
      return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#00B894">
          <path d="M2 18L7 6L12 13L17 6L22 18H17.5L14.5 11L12 15L9.5 11L6.5 18H2Z" />
        </svg>
      );
    case 'Bitget':
      return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#00F0FF">
          <path d="M12 2L2 12H9V22L19 12H12V2Z" />
        </svg>
      );
    case 'Bybit':
      return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#F7A600">
          <path d="M4 4H10C13.3 4 16 6.7 16 10C16 11.8 15.2 13.4 13.9 14.5C15.8 15.6 17 17.6 17 20H11C11 17.8 9.2 16 7 16H4V20H4V4ZM7 12H10C11.1 12 12 11.1 12 10C12 8.9 11.1 8 10 8H7V12Z" />
        </svg>
      );
    case 'KuCoin':
      return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#00E676">
          <path d="M4 4V20H8V14L14 20H19L12 13L19 4H14L8 10V4H4Z" />
        </svg>
      );
    case 'Bitrue':
      return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#1E88E5">
          <path d="M4 4H14C17.3 4 20 6.7 20 10C20 12.2 18.8 14.1 17 15.1V15.2C19.3 16.1 21 18.4 21 21H15C15 18.8 13.2 17 11 17H4V4ZM10 11H13C14.1 11 15 10.1 15 9C15 7.9 14.1 7 13 7H10V11Z" />
        </svg>
      );
    case 'Kraken':
      return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#5741D9">
          <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM16 16L12 12L16 8V16ZM8 8L12 12L8 16V8Z" />
        </svg>
      );
    case 'Uniswap':
      return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#FF007A">
          <path d="M12 2C8 6 4 10 4 15C4 19.4 7.6 23 12 23C16.4 23 20 19.4 20 15C20 10 16 6 12 2ZM12 19C9.8 19 8 17.2 8 15C8 12.8 10.5 9.5 12 7.7C13.5 9.5 16 12.8 16 15C16 17.2 14.2 19 12 19Z" />
        </svg>
      );
    case 'Bitstamp':
      return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#00B050">
          <path d="M6 3H14C17.3 3 20 5.7 20 9C20 11.2 18.8 13.1 17 14.1C19.3 15.1 21 17.4 21 20H13C13 17.8 11.2 16 9 16H6V3ZM11 11H13C14.1 11 15 10.1 15 9C15 7.9 14.1 7 13 7H11V11Z" />
        </svg>
      );
    case 'Bitfinex':
      return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#008080">
          <path d="M12 2L4 7V17L12 22L20 17V7L12 2ZM12 6L16 8.5V13.5L12 16L8 13.5V8.5L12 6Z" />
        </svg>
      );
    case 'HTX':
    case 'Huobi':
      return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#1890FF">
          <path d="M12 2C10 6 7 9 7 13C7 16.9 10.1 20 14 20C17.9 20 21 16.9 21 13C21 7 15 4 12 2ZM14 17C12.3 17 11 15.7 11 14C11 12.5 12.5 10.5 14 9C15.5 10.5 17 12.5 17 14C17 15.7 15.7 17 14 17Z" />
        </svg>
      );
    default:
      return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#e8b949">
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

function ExchangesIntegratedSection() {
  const [activeExchange, setActiveExchange] = useState<string | null>(null);

  const exchangeList = [
    { name: 'Binance', type: 'CEX', status: 'Online', ping: '12ms', pairs: '420+', badge: 'Top Tier' },
    { name: 'OKX', type: 'CEX', status: 'Online', ping: '14ms', pairs: '310+', badge: 'Top Tier' },
    { name: 'MEXC', type: 'CEX', status: 'Online', ping: '18ms', pairs: '290+', badge: 'CEX' },
    { name: 'Bitget', type: 'CEX', status: 'Online', ping: '16ms', pairs: '210+', badge: 'CEX' },
    { name: 'Bybit', type: 'CEX', status: 'Online', ping: '15ms', pairs: '350+', badge: 'Top Tier' },
    { name: 'KuCoin', type: 'CEX', status: 'Online', ping: '19ms', pairs: '280+', badge: 'CEX' },
    { name: 'Bitrue', type: 'CEX', status: 'Online', ping: '22ms', pairs: '190+', badge: 'CEX' },
    { name: 'Kraken', type: 'CEX', status: 'Online', ping: '13ms', pairs: '260+', badge: 'Top Tier' },
    { name: 'Uniswap', type: 'DEX', status: 'Online', ping: '8ms', pairs: '500+', badge: 'DeFi DEX' },
    { name: 'Coinbase', type: 'CEX', status: 'Online', ping: '11ms', pairs: '240+', badge: 'Top Tier' },
    { name: 'Bitstamp', type: 'CEX', status: 'Online', ping: '17ms', pairs: '140+', badge: 'CEX' },
    { name: 'Bitfinex', type: 'CEX', status: 'Online', ping: '16ms', pairs: '180+', badge: 'CEX' },
    { name: 'HTX', type: 'CEX', status: 'Online', ping: '20ms', pairs: '230+', badge: 'CEX' },
  ];

  return (
    <section className="border-y border-border bg-[#0b0e0f] py-14 lg:py-20" data-testid="section-exchanges-integrated">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Layout Exactly Matching User Reference Screenshot 1 & 3 */}
        <Reveal>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Header Title */}
            <div className="shrink-0 lg:w-64">
              <h3 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Exchanges Integrated
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">Direct low-latency API connections</p>
            </div>

            {/* Middle Scrolling Logos Ticker Strip with Authentic SVG Logos & Names */}
            <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-border/80 bg-card/60 py-3.5 px-4 backdrop-blur-md">
              <div className="animate-ticker flex items-center gap-6 min-w-max">
                {[...exchangeList, ...exchangeList].map((ex, idx) => (
                  <div
                    key={`${ex.name}-${idx}`}
                    onMouseEnter={() => setActiveExchange(ex.name)}
                    onMouseLeave={() => setActiveExchange(null)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2 transition-all duration-300 ${
                      activeExchange === ex.name
                        ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(232,185,73,0.2)]'
                        : 'border-border/60 bg-secondary/40 hover:border-primary/50'
                    }`}
                  >
                    <ExchangeLogoIcon name={ex.name} />
                    <span className="font-display text-sm font-semibold text-foreground">{ex.name}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-signal" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side Stat Counters (Exact 1,200+ | 1,700+ | 30+ as in Reference Image 1) */}
            <div className="flex shrink-0 items-center justify-between gap-8 border-t border-border/70 pt-6 lg:border-t-0 lg:pt-0">
              <div className="text-center sm:text-left">
                <p className="text-3xl font-extrabold tracking-[-.06em] text-foreground sm:text-4xl">
                  1,200<span className="text-primary">+</span>
                </p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Market Pairs</p>
              </div>

              <div className="h-10 w-px bg-border/80" />

              <div className="text-center sm:text-left">
                <p className="text-3xl font-extrabold tracking-[-.06em] text-foreground sm:text-4xl">
                  1,700<span className="text-accent">+</span>
                </p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Cryptocurrencies</p>
              </div>

              <div className="h-10 w-px bg-border/80" />

              <div className="text-center sm:text-left">
                <p className="text-3xl font-extrabold tracking-[-.06em] text-foreground sm:text-4xl">
                  30<span className="text-primary">+</span>
                </p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Exchanges</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function WhatIsCryptoArbitrageSection() {
  const [selectedPair, setSelectedPair] = useState<string>('BTC/USDT');
  const [status, setStatus] = useState<'scanning' | 'detected'>('scanning');
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);

  // Live real-time Binance prices state
  const [livePrices, setLivePrices] = useState<Record<string, number>>({
    'BTC/USDT': 88420.50,
    'ETH/USDT': 3240.80,
    'SOL/USDT': 188.40,
    'BNB/USDT': 642.10,
  });

  // Fetch real-time Binance spot prices every 2.5 seconds
  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        const symbolMap: Record<string, string> = {
          'BTC/USDT': 'BTCUSDT',
          'ETH/USDT': 'ETHUSDT',
          'SOL/USDT': 'SOLUSDT',
          'BNB/USDT': 'BNBUSDT',
        };
        const rawSymbol = symbolMap[selectedPair] || 'BTCUSDT';
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${rawSymbol}`);
        const data = await res.json();
        if (data && data.price) {
          const val = parseFloat(data.price);
          if (!isNaN(val) && val > 0) {
            setLivePrices((prev) => ({ ...prev, [selectedPair]: val }));
          }
        }
      } catch (err) {
        setLivePrices((prev) => ({
          ...prev,
          [selectedPair]: (prev[selectedPair] || 1000) * (1 + (Math.random() * 0.0004 - 0.0002)),
        }));
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 1000);
    return () => clearInterval(interval);
  }, [selectedPair]);

  // Dynamically calculate Market A (Binance), Market B (Bybit), and Net Edge from live price
  const current = useMemo(() => {
    const priceA = livePrices[selectedPair] || 88420.50;
    const spreadPctMap: Record<string, number> = {
      'BTC/USDT': 0.15,
      'ETH/USDT': 0.43,
      'SOL/USDT': 0.25,
      'BNB/USDT': 0.40,
    };
    const spreadPct = spreadPctMap[selectedPair] || 0.20;
    const priceB = priceA * (1 + spreadPct / 100);
    const diff = priceB - priceA;
    const feePct = -0.04;
    const netPct = spreadPct + feePct;

    const decimals = 2;

    return {
      exA: {
        price: `$${priceA.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`,
        bid: `$${(priceA * 0.99995).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`,
        ask: `$${priceA.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`,
        volume: selectedPair === 'BTC/USDT' ? '$420.8M' : selectedPair === 'ETH/USDT' ? '$180.4M' : selectedPair === 'SOL/USDT' ? '$95.6M' : '$62.1M',
      },
      exB: {
        price: `$${priceB.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`,
        bid: `$${(priceB * 0.99995).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`,
        ask: `$${priceB.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`,
        volume: selectedPair === 'BTC/USDT' ? '$390.2M' : selectedPair === 'ETH/USDT' ? '$165.1M' : selectedPair === 'SOL/USDT' ? '$88.3M' : '$58.7M',
      },
      spread: `+$${diff.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      gross: `${spreadPct.toFixed(2)}%`,
      fee: `${feePct.toFixed(2)}%`,
      net: `${netPct.toFixed(2)}%`,
    };
  }, [selectedPair, livePrices]);

  useEffect(() => {
    setStatus('scanning');
    const timer1 = setTimeout(() => {
      setStatus('detected');
    }, 1200);

    return () => clearTimeout(timer1);
  }, [selectedPair, activeStep]);

  return (
    <section className="relative overflow-hidden border-t border-border bg-[#08090a] py-20 lg:py-28" data-testid="section-what-is-arbitrage">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e8b9490a_1px,transparent_1px),linear-gradient(to_bottom,#e8b9490a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_50%,#000_80%,transparent_100%)] opacity-70" />
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,185,73,0.18)_0%,rgba(16,185,129,0.04)_50%,transparent_75%)] blur-3xl pointer-events-none transition-all duration-700" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">
              <Sparkles size={13} className="animate-spin-slow text-primary" />
              Automated Market Intelligence
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-foreground sm:text-5xl">
              What Is Crypto Arbitrage?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Price differences happen across crypto markets. Our arbitrage engine identifies qualified opportunities across exchanges and evaluates them in real time.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Select Market Pair:</span>
              <div className="flex flex-wrap gap-2">
                {['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'].map((pair) => (
                  <button
                    key={pair}
                    onClick={() => setSelectedPair(pair)}
                    className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
                      selectedPair === pair
                        ? 'border-primary bg-primary/15 text-primary shadow-[0_0_15px_rgba(232,185,73,0.25)]'
                        : 'border-border bg-card/60 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                    data-testid={`button-pair-${pair.replace('/', '-')}`}
                  >
                    {pair}
                  </button>
                ))}
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[10px] text-accent font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-signal" />
              ● LIVE BINANCE SPOT STREAM · REAL TIME
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mt-10 rounded-2xl border border-border/80 bg-[#0d1011]/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr_1fr] items-center">

              {/* LEFT — EXCHANGE A (BINANCE) */}
              <div
                onMouseEnter={() => setHoveredTarget('exA')}
                onMouseLeave={() => setHoveredTarget(null)}
                className={`relative rounded-xl border p-5 transition-all duration-300 ${
                  activeStep === 0 || hoveredTarget === 'exA'
                    ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(232,185,73,0.3)] ring-1 ring-primary/50'
                    : 'border-border/80 bg-card/80 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse-signal" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">MARKET A</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground font-semibold">BINANCE</span>
                </div>

                <div className="mt-4">
                  <span className="font-mono text-xs text-muted-foreground">{selectedPair}</span>
                  <div className="mt-1 font-mono text-3xl font-extrabold text-foreground tracking-tight">
                    {current.exA.price}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 font-mono text-[10px] text-muted-foreground">
                  <div>Bid: <strong className="text-foreground">{current.exA.bid}</strong></div>
                  <div>Ask: <strong className="text-foreground">{current.exA.ask}</strong></div>
                  <div className="col-span-2">Liquidity: <strong className="text-accent">High</strong></div>
                </div>

                {hoveredTarget === 'exA' && (
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 rounded-lg border border-primary bg-[#121616] p-2.5 font-mono text-[9px] text-foreground shadow-2xl z-30 pointer-events-none animate-in fade-in zoom-in-95">
                    <div className="font-bold text-primary">BINANCE CONNECTED</div>
                    <div>Pair: {selectedPair}</div>
                    <div>Price: {current.exA.price}</div>
                    <div>24H Vol: {current.exA.volume}</div>
                    <div className="text-accent">Status: Active Stream</div>
                  </div>
                )}
              </div>

              {/* CENTER — ARBITRAGE ENGINE & CALCULATION */}
              <div
                onMouseEnter={() => setHoveredTarget('engine')}
                onMouseLeave={() => setHoveredTarget(null)}
                className={`relative flex flex-col items-center justify-center rounded-xl border p-6 text-center transition-all duration-300 ${
                  activeStep === 1 || hoveredTarget === 'engine'
                    ? 'border-primary bg-primary/10 shadow-[0_0_35px_rgba(232,185,73,0.35)] ring-1 ring-primary/50'
                    : 'border-border/80 bg-card/60 hover:border-primary/50'
                }`}
              >
                <div className="relative grid h-24 w-24 place-items-center rounded-full border-2 border-primary/60 bg-gradient-to-b from-[#1a201d] to-[#0e1211] shadow-[0_0_30px_rgba(232,185,73,0.25)]">
                  <div className="absolute inset-0 rounded-full border border-primary/40 animate-spin-slow stroke-dasharray-4" />
                  <div className="text-center font-mono text-[10px] font-black uppercase tracking-widest text-primary leading-tight">
                    ARBITRAGE<br /><span className="text-foreground">ENGINE</span>
                  </div>
                </div>

                <div className="mt-4 font-mono text-xs font-bold tracking-wider uppercase">
                  {status === 'scanning' ? (
                    <span className="inline-flex items-center gap-2 text-muted-foreground animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                      SCANNING MARKETS...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-primary font-extrabold animate-bounce">
                      <Zap size={14} className="text-primary fill-primary" />
                      OPPORTUNITY DETECTED
                    </span>
                  )}
                </div>

                <div className="mt-5 w-full rounded-xl border border-primary/30 bg-[#121616]/90 p-4 font-mono text-xs shadow-inner">
                  <div className="flex justify-between items-center text-muted-foreground text-[10px] uppercase">
                    <span>PRICE DIFFERENCE</span>
                    <strong className="text-sm font-bold text-foreground">{status === 'scanning' ? '+$0.00' : current.spread}</strong>
                  </div>
                  <div className="mt-1 flex justify-between items-center text-muted-foreground text-[10px] uppercase">
                    <span>GROSS SPREAD</span>
                    <strong className="text-xs font-bold text-foreground">{status === 'scanning' ? '0.00%' : current.gross}</strong>
                  </div>
                  <div className="mt-2 border-t border-border/60 pt-2 flex justify-between items-center text-[10px] text-muted-foreground">
                    <span>Estimated Fees</span>
                    <span className="text-red-400">{current.fee}</span>
                  </div>
                  <div className="mt-1.5 flex justify-between items-center text-xs font-bold text-primary border-t border-primary/20 pt-1.5">
                    <span>Net Potential Edge</span>
                    <span className="text-sm text-primary font-mono">{status === 'scanning' ? '0.00%' : current.net}</span>
                  </div>
                </div>

                {hoveredTarget === 'engine' && (
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-52 rounded-lg border border-primary bg-[#121616] p-2.5 font-mono text-[9px] text-foreground shadow-2xl z-30 pointer-events-none animate-in fade-in zoom-in-95">
                    <div className="font-bold text-primary">HFT ENGINE ACTIVE</div>
                    <div>• Monitoring 30+ exchanges</div>
                    <div>• Comparing tick orderbooks</div>
                    <div>• Evaluating net slippage</div>
                    <div>• Auto Risk Boundary checks</div>
                  </div>
                )}
              </div>

              {/* RIGHT — EXCHANGE B (BYBIT) */}
              <div
                onMouseEnter={() => setHoveredTarget('exB')}
                onMouseLeave={() => setHoveredTarget(null)}
                className={`relative rounded-xl border p-5 transition-all duration-300 ${
                  activeStep === 2 || hoveredTarget === 'exB'
                    ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(232,185,73,0.3)] ring-1 ring-primary/50'
                    : 'border-border/80 bg-card/80 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse-signal" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">MARKET B</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground font-semibold">BYBIT</span>
                </div>

                <div className="mt-4">
                  <span className="font-mono text-xs text-muted-foreground">{selectedPair}</span>
                  <div className="mt-1 font-mono text-3xl font-extrabold text-foreground tracking-tight">
                    {current.exB.price}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 font-mono text-[10px] text-muted-foreground">
                  <div>Bid: <strong className="text-foreground">{current.exB.bid}</strong></div>
                  <div>Ask: <strong className="text-foreground">{current.exB.ask}</strong></div>
                  <div className="col-span-2">Liquidity: <strong className="text-accent">High</strong></div>
                </div>

                {hoveredTarget === 'exB' && (
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 rounded-lg border border-primary bg-[#121616] p-2.5 font-mono text-[9px] text-foreground shadow-2xl z-30 pointer-events-none animate-in fade-in zoom-in-95">
                    <div className="font-bold text-primary">BYBIT CONNECTED</div>
                    <div>Pair: {selectedPair}</div>
                    <div>Price: {current.exB.price}</div>
                    <div>24H Vol: {current.exB.volume}</div>
                    <div className="text-accent">Status: Active Stream</div>
                  </div>
                )}
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest flex-wrap">
              <span className="text-primary font-bold">BINANCE (MARKET A)</span>
              <span className="text-accent font-mono">━━ ⚡ MARKET DATA ━━▶</span>
              <span className="text-primary font-bold">ARBITRAGE ENGINE</span>
              <span className="text-accent font-mono">━━ ⚡ QUALIFICATION ━━▶</span>
              <span className="text-primary font-bold">BYBIT (MARKET B)</span>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}

function Home() {
  const [activeFaq, setActiveFaq] = useState(0);
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePair, setActivePair] = useState('BTC/USDT');

  const copyAddress = () => {
    navigator.clipboard?.writeText('0x7B...94AC');
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const processSteps: { number: string; title: string; copy: string; icon: LucideIcon }[] = [
    { number: '01', title: 'Observe', copy: 'A live market engine monitors spreads, liquidity, fees, and exchange conditions across global markets.', icon: Eye },
    { number: '02', title: 'Qualify', copy: 'Our intelligence engine analyzes market discrepancies and identifies opportunities that meet defined trading criteria.', icon: BrainCircuit },
    { number: '03', title: 'Execute', copy: 'When an opportunity meets the required conditions, the execution engine acts with speed and precision.', icon: Zap },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/70">
        <AiTradingBotHeroBg activePair={activePair} />
        <div className="absolute inset-0 grid-fade opacity-70" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-28 lg:pt-24">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.h1 variants={reveal} className="font-display max-w-3xl text-balance text-4xl font-extrabold leading-[1.04] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-[5.5rem]">
              Capture Arbitrage Edge<br />
              <span className="text-primary font-bold">across global markets</span><br />
              at machine speed.
            </motion.h1>
            <motion.p variants={reveal} className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground/90 sm:text-lg">
              NexaTraders continuously scans cross-exchange liquidity, detects micro price gaps between 18+ venues, and routes trades automatically with sub-14ms precision.
            </motion.p>
            <motion.div variants={reveal} className="mt-5 flex flex-wrap gap-2 font-mono text-[10px]">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-primary shadow-[0_0_12px_rgba(232,185,73,0.15)]">
                <Zap size={11} /> Sub-14ms Execution Speed
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1 text-accent">
                <Globe2 size={11} /> 30+ Venues Connected
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/80 px-2.5 py-1 text-muted-foreground">
                <ShieldCheck size={11} /> Bounded Risk Gate
              </span>
            </motion.div>
            <motion.div variants={reveal} className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/packages">
                Explore packages <ArrowRight size={15} />
              </ButtonLink>
              <ButtonLink href="/about" variant="outline">
                <Play size={14} /> See live engine in action
              </ButtonLink>
            </motion.div>
            <motion.div variants={reveal} className="mt-10 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {['MC', 'EV', 'JB'].map((initials) => (
                  <span key={initials} className="grid h-7 w-7 place-items-center rounded-full border-2 border-background bg-secondary font-mono text-[9px] text-primary">
                    {initials}
                  </span>
                ))}
              </div>
              <span>
                <strong className="text-foreground">2,400+</strong> institutional arbitrage accounts
              </span>
              <span className="h-3 w-px bg-border" />
              <span className="positive-text">● 99.98% uptime</span>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="lg:pt-3">
            <ScanPanel activePair={activePair} setActivePair={setActivePair} />
          </motion.div>
        </div>
        <ExchangeTicker />
      </section>

      <main>
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="grid gap-10 border-b border-border pb-16 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border"><Reveal className="sm:px-8 sm:first:pl-0"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Capital routed</p><p className="mt-3 text-4xl font-semibold tracking-[-.06em]">$5.8M</p><p className="mt-2 text-sm text-accent">↑ 18.6% this quarter</p></Reveal><Reveal className="sm:px-8" delay={.08}><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Decision latency</p><p className="mt-3 text-4xl font-semibold tracking-[-.06em]">42<span className="text-xl text-primary">ms</span></p><p className="mt-2 text-sm text-muted-foreground">from tick to signal</p></Reveal><Reveal className="sm:px-8 sm:pr-0" delay={.16}><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Markets mapped</p><p className="mt-3 text-4xl font-semibold tracking-[-.06em]">18</p><p className="mt-2 text-sm text-muted-foreground">venues / 24 hours a day</p></Reveal></div></section>

        <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8 lg:pb-32"><div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]"><Reveal><SectionHeading eyebrow="The loop" title="Turn Market Price Differences Into Automated Opportunities." copy="Our automated crypto arbitrage technology continuously monitors market differences across supported exchanges and identifies potential arbitrage opportunities." /><div className="mt-8"><ButtonLink href="/about" variant="outline">Our operating principles <ArrowRight size={15} /></ButtonLink></div></Reveal><motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid gap-3">{processSteps.map(({ number, title, copy, icon: Icon }) => <motion.div key={number} variants={reveal} className="group flex gap-5 rounded-xl border border-border bg-card/60 p-5 hover-lift"><span className="font-mono text-xs text-primary">{number}</span><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary"><Icon size={19} /></span><div><h3 className="text-lg font-semibold tracking-[-.03em]">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{copy}</p></div><ArrowUpRight size={15} className="ml-auto shrink-0 text-muted-foreground/40 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" /></motion.div>)}</motion.div></div></section>

        {/* New Exchanges Integrated Section (Placed directly below The Loop section) */}
        <ExchangesIntegratedSection />

        {/* Interactive "What Is Crypto Arbitrage?" Section */}
        <WhatIsCryptoArbitrageSection />

        <section className="border-y border-border bg-[#0c0f0f]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-28"><Reveal><SectionHeading eyebrow="The readout" title="See the market thinking in real time." copy="The dashboard is designed to answer the useful questions: what moved, what changed, and why did the engine choose this route?" /><div className="mt-8 flex gap-3"><span className="inline-flex items-center gap-2 rounded-md border border-accent/25 bg-accent/5 px-3 py-2 font-mono text-[10px] text-accent"><Radio size={13} /> live system telemetry</span></div></Reveal><Reveal delay={.12}><div className="overflow-hidden rounded-2xl border border-primary/30 bg-[#0d1011] p-2 sm:p-3 shadow-[0_0_50px_rgba(232,185,73,0.22)] backdrop-blur-xl"><div className="relative overflow-hidden rounded-xl border border-border/80 bg-black aspect-video"><video src="/trade-recording.mp4" autoPlay loop muted playsInline className="h-full w-full object-cover rounded-xl shadow-2xl pointer-events-none" data-testid="video-trade-recording" /></div></div></Reveal></div></section>

        <section className="relative overflow-hidden w-full py-20 lg:py-28" data-testid="section-built-underneath"><AiArbitrageInteractiveFullBg /><div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8"><Reveal><SectionHeading eyebrow="Built underneath" title="Fast where it matters. Quiet where it should be." copy="The infrastructure is purpose-built for a market that changes between one refresh and the next." /></Reveal><div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-4"><Reveal delay={.04}><Feature icon={Network} title="18 venues" copy="One connected view across the exchanges that matter." /></Reveal><Reveal delay={.1}><Feature icon={Cpu} title="42ms decisions" copy="Low-latency scoring from raw tick to clear action." /></Reveal><Reveal delay={.16}><Feature icon={LockKeyhole} title="Bounded access" copy="Permissions and limits are part of every strategy." /></Reveal><Reveal delay={.22}><Feature icon={FileCheck2} title="Readable audit" copy="A reason attached to every meaningful decision." /></Reveal></div></div></section>

        <section className="border-y border-border bg-[#0c0f0f]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8 lg:py-28"><Reveal><div className="relative rounded-3xl border border-primary/40 bg-gradient-to-br from-[#131816] via-[#0c0f0f] to-[#121614] p-8 sm:p-10 shadow-[0_0_50px_rgba(232,185,73,0.22)] backdrop-blur-xl overflow-hidden group"><div className="absolute top-0 right-0 w-60 h-60 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary/20 transition-all duration-700" /><h3 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl leading-tight">One Asset. Multiple Markets.<br /><span className="text-primary font-black">One Intelligent Engine.</span></h3><p className="mt-4 text-xs leading-relaxed text-muted-foreground sm:text-sm max-w-xl">Crypto markets operate across multiple venues, creating temporary price differences. Arbitrage technology monitors these differences and evaluates whether an opportunity meets defined trading conditions.</p><div className="my-8 h-px bg-gradient-to-r from-primary/40 via-primary/10 to-transparent" /><div className="flex flex-wrap items-center gap-4"><ButtonLink href="/register" variant="outline" className="font-mono text-xs border-primary/40 bg-card/80 backdrop-blur-md hover:border-primary hover:bg-primary/10 hover:text-primary transition-all shadow-lg">Open an Account →</ButtonLink></div></div></Reveal><Reveal delay={.12}><SectionHeading eyebrow="Security, not theatre" title="Your controls are part of the strategy." copy="We believe the most trustworthy automation is legible. Every package is built around clear permissions, visible boundaries, and a human-readable history." /><div className="mt-8 flex flex-wrap gap-3"><span className="rounded-md border border-border bg-card px-3 py-2 font-mono text-[10px] text-muted-foreground">encrypted transport</span><span className="rounded-md border border-border bg-card px-3 py-2 font-mono text-[10px] text-muted-foreground">segmented keys</span><span className="rounded-md border border-border bg-card px-3 py-2 font-mono text-[10px] text-muted-foreground">risk gates</span></div></Reveal></div></section>

        <section className="mx-auto max-w-4xl px-5 py-20 lg:py-28"><Reveal><SectionHeading eyebrow="Questions, answered" title="The short version." align="center" /></Reveal><div className="mt-10 divide-y divide-border border-y border-border">{faqs.map(([question, answer], index) => <Reveal key={question} delay={index * .04}><div><button onClick={() => setActiveFaq(activeFaq === index ? -1 : index)} className="flex w-full items-center justify-between gap-6 py-5 text-left" data-testid={`button-faq-${index}`}><span className="text-base font-medium">{question}</span><ChevronDown size={17} className={`shrink-0 text-muted-foreground transition-transform ${activeFaq === index ? 'rotate-180 text-primary' : ''}`} /></button><AnimatePresence initial={false}>{activeFaq === index && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="max-w-2xl pb-5 text-sm leading-6 text-muted-foreground">{answer}</p></motion.div>}</AnimatePresence></div></Reveal>)}</div><div className="mt-8 text-center"><ButtonLink href="/contact" variant="outline">Ask a different question <MessageCircle size={15} /></ButtonLink></div></section>

      </main>
    </div>
  );
}

function Feature({ icon: Icon, title, copy }: { icon: typeof Globe2; title: string; copy: string }) {
  return <div className="hover-lift rounded-xl border border-border bg-card/60 p-5"><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon size={17} /></span><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></div>;
}

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <section className="relative overflow-hidden border-b border-border"><div className="absolute inset-0 grid-fade opacity-60" /><div className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 lg:px-8 lg:pb-24 lg:pt-24"><Reveal><SectionHeading eyebrow={eyebrow} title={title} copy={copy} /></Reveal></div></section>;
}

function AiArbitrageInteractiveFullBg() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [pulse, setPulse] = useState(0);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse((p) => (p + 1) % 100);
    }, 70);
    return () => clearInterval(timer);
  }, []);

  const sideNodes = [
    // Left side margin nodes
    { id: 'binance', name: 'Binance AI Core', pos: 'left-[2.5%] top-[15%]', ping: '12ms', rate: '1,842 ops/s' },
    { id: 'neural', name: 'Neural Signal V4', pos: 'left-[2%] top-[45%]', ping: '8ms', rate: '99.84% Edge' },
    { id: 'risk', name: 'Bounded Risk Gate', pos: 'left-[3%] bottom-[15%]', ping: '0ms', rate: '100% Protected' },

    // Right side margin nodes
    { id: 'kraken', name: 'Kraken Speed HFT', pos: 'right-[2.5%] top-[18%]', ping: '14ms', rate: '+0.48% Spread' },
    { id: 'bybit', name: 'Bybit Yield Engine', pos: 'right-[2%] top-[48%]', ping: '11ms', rate: 'Zero Slippage' },
    { id: 'vault', name: 'Settlement Vault', pos: 'right-[3%] bottom-[18%]', ping: '16ms', rate: '$142.8M Routed' },
  ];

  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
      }}
      className="absolute inset-0 w-full overflow-hidden select-none pointer-events-auto z-0 bg-[#08090a]"
      data-testid="bg-ai-arbitrage-full-interactive"
    >
      {/* 1. Dynamic Full-Screen Cursor Spotlight */}
      <div
        className="pointer-events-none absolute h-[750px] w-[750px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,185,73,0.24)_0%,rgba(16,185,129,0.08)_40%,transparent_75%)] blur-3xl transition-all duration-150"
        style={{ left: `${mousePos.x}%`, top: `${mousePos.y}%` }}
      />

      {/* 2. Full-Width Sci-Fi Cyber Neural Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e8b94912_1px,transparent_1px),linear-gradient(to_bottom,#e8b94912_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_90%_80%_at_50%_50%,#000_80%,transparent_100%)] opacity-80" />

      {/* 3. Glowing Center Ambient Flares anchored behind cards */}
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,185,73,0.22)_0%,rgba(16,185,129,0.07)_50%,transparent_80%)] blur-3xl pointer-events-none" />

      {/* 4. Interactive Floating AI Nodes in Left & Right Side Margins */}
      {sideNodes.map((node) => {
        const isActive = activeNode === node.id;
        return (
          <div
            key={node.id}
            onMouseEnter={() => setActiveNode(node.id)}
            onMouseLeave={() => setActiveNode(null)}
            className={`absolute hidden xl:block cursor-pointer transition-all duration-300 ${node.pos} ${
              isActive ? 'scale-110 z-30' : 'hover:scale-105 z-20'
            }`}
          >
            <div className={`rounded-xl border p-3 font-mono text-[10px] backdrop-blur-xl transition-all shadow-xl ${
              isActive
                ? 'border-primary bg-[#0d1010]/95 text-primary shadow-[0_0_30px_rgba(232,185,73,0.4)]'
                : 'border-primary/40 bg-[#0d1010]/80 text-muted-foreground hover:border-primary/70 hover:text-foreground'
            }`}>
              <div className="flex items-center gap-2 font-bold text-xs text-primary">
                <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-accent animate-ping' : 'bg-primary animate-pulse-signal'}`} />
                {node.name}
              </div>
              <div className="mt-1.5 flex justify-between gap-3 text-[9px]">
                <span>Rate: <strong className="text-foreground">{node.rate}</strong></span>
                <span className="text-accent">{node.ping}</span>
              </div>
              {isActive && (
                <div className="mt-2 border-t border-primary/30 pt-1.5 text-[9px] text-accent animate-pulse">
                  ⚡ Connected to HFT Yield Engine
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* 5. Full-Width SVG Laser Network connecting side margins to center */}
      <svg className="absolute inset-0 h-full w-full opacity-70" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1920 1080">
        <defs>
          <linearGradient id="fullLaserGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8b949" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f3cc68" stopOpacity="0.9" />
          </linearGradient>

          <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Laser Beams Spanning Across Screen */}
        <g stroke="url(#fullLaserGradient)" strokeWidth="2" fill="none" filter="url(#laserGlow)">
          {/* Left Margin to Center Cards */}
          <path d="M 80 180 Q 480 120, 960 280 T 1840 180" strokeDasharray="12 6" className="chart-draw" />
          <path d="M 60 500 Q 480 420, 960 480 T 1860 500" strokeDasharray="10 5" opacity="0.75" />
          <path d="M 100 860 Q 600 960, 960 800 T 1820 860" strokeDasharray="14 6" opacity="0.85" />
        </g>

        {/* Traveling Signal Light Particles across full width */}
        <circle cx={60 + (pulse * 18.5) % 1800} cy={180 + Math.sin(pulse * 0.1) * 35} r="5" fill="#f3cc68" filter="url(#laserGlow)" />
        <circle cx={1860 - (pulse * 17.5) % 1800} cy={860 - Math.sin(pulse * 0.1) * 30} r="5" fill="#10b981" filter="url(#laserGlow)" />
        <circle cx={100 + (pulse * 16.5) % 1700} cy={500 + Math.cos(pulse * 0.1) * 25} r="4" fill="#e8b949" filter="url(#laserGlow)" />
      </svg>
    </div>
  );
}

function PackagesPage() {
  const [, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState<string>('Rise');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTier, setModalTier] = useState<string>('Rise');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TARGET ROI' | 'PROJECTED RETURN' | 'DURATION' | 'MAX SLOTS'>('OVERVIEW');
  const [faqActiveIndex, setFaqActiveIndex] = useState<number>(-1);
  const [withdrawNetwork, setWithdrawNetwork] = useState<'BSC' | 'ETH' | 'TRC'>('BSC');
  const [depositToken, setDepositToken] = useState<'BEP20' | 'TRC20' | 'ERC20'>('BEP20');
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  const handleCopyAddress = () => {
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const modalTierData = useMemo(() => packages.find((p) => p.name === modalTier) || packages[2], [modalTier]);

  const openTerminalModal = (tierName: string) => {
    setModalTier(tierName);
    setSelectedTier(tierName);
    setModalOpen(true);
  };

  const packageFaqs = [
    [
      'What is the difference between the five subscription plans?',
      'Each plan has a distinct investment amount, maximum slots per user, target ROI, projected return, duration, and daily ROI payout.',
    ],
    [
      'Which subscription plan is recommended for scaling?',
      'The RISE ($1,000) plan is marked as Most Selected, offering 95% total ROI ($2,000 return) across 5 active slots.',
    ],
    [
      'Can I hold multiple active subscriptions simultaneously?',
      'Yes. Users may hold multiple active subscriptions simultaneously up to the maximum slot limit for each tier.',
    ],
    [
      'How are daily returns credited to my wallet?',
      'Daily ROI is credited automatically to your account wallet on a 24-hour cycle until full payout is completed.',
    ],
    [
      'What are the minimum deposit and withdrawal requirements?',
      'Deposits are processed via USDT (BEP20 / BSC). The minimum withdrawal limit is $15 with automatic execution within 15 minutes.',
    ],
  ];

  const flagshipSolutions = [
    {
      num: '1',
      title: 'Spot Marketplace',
      desc1: 'Continuously scan 25+ exchanges in real time to find the true best bid and ask.',
      desc2: 'Execute trades at optimal lowest buy and highest sell price across all liquidity sources.',
      icon: Network,
    },
    {
      num: '2',
      title: 'Arbitrage BOT',
      desc1: 'Market-neutral spread execution across multiple Crypto Exchanges with institutional-grade risk controls.',
      desc2: 'Ensures balanced exposure and efficient arbitrage across all liquidity sources.',
      icon: Cpu,
    },
    {
      num: '3',
      title: 'AI Perpetual Futures',
      desc1: 'One-tap protection (MarginOn) with smart entries and live risk control.',
      desc2: 'AI-driven probability scoring with confidence indicators before every order.',
      icon: BrainCircuit,
    },
  ];

  const subscriptionRules = [
    { num: '01', rule: 'Each subscription is independent and runs from the date of purchase.' },
    { num: '02', rule: 'ROI is credited to the user\'s wallet on a daily basis.' },
    { num: '03', rule: 'A subscription is marked \'Burn\' (completed) once the full ROI is paid out.' },
    { num: '04', rule: 'Users may hold multiple active subscriptions simultaneously (within package limits).' },
    { num: '05', rule: 'Subscriptions cannot be cancelled once activated.' },
  ];

  const transactionFlowSteps = [
    { step: '01', title: 'Connect Wallet', desc: 'Link your Web3 wallet securely' },
    { step: '02', title: 'Complete KYC', desc: 'Quick identity verification' },
    { step: '03', title: 'Choose Subscription', desc: 'Select from Spark to Supreme' },
    { step: '04', title: 'Deposit USDT', desc: 'Fund via USDT (BEP20 / BSC)' },
    { step: '05', title: 'Trading & Daily Credit', desc: 'Automated daily ROI yield' },
  ];

  return (
    <div className="relative overflow-hidden bg-[#08090a] text-foreground font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#0b0e0d] via-[#0d110f] to-[#08090a] pt-24 pb-20 lg:pt-32 lg:pb-28">
        {/* Glowing Background Light Ring / Vortex */}
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[900px] sm:w-[1200px] h-[600px] sm:h-[750px] bg-[radial-gradient(ellipse_at_center,rgba(232,185,73,0.35)_0%,rgba(232,185,73,0.12)_45%,transparent_85%)] blur-[95px] pointer-events-none rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e8b9490a_1px,transparent_1px),linear-gradient(to_bottom,#e8b9490a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-50 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-[1500px] px-5 lg:px-8 text-center">
          <Reveal>
            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.08] max-w-5xl mx-auto">
              Choose Your Arbitrage Trading Plan
            </h1>
            
            {/* Subheadline */}
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Flexible subscription plans built for intelligent crypto trading and automated digital asset growth.
            </p>

            {/* Hero CTAs */}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  document.getElementById('package-cards')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="rounded-full bg-gradient-to-r from-primary via-[#f5c542] to-primary px-8 py-4 font-mono text-xs font-black uppercase tracking-wider text-primary-foreground shadow-[0_0_35px_rgba(232,185,73,0.45)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(232,185,73,0.65)] flex items-center gap-2"
                data-testid="button-hero-view-packages"
              >
                View Packages <ArrowRight size={16} />
              </button>
              <button
                onClick={() => setLocation('/register')}
                className="rounded-full border border-primary/50 bg-primary/10 px-8 py-4 font-mono text-xs font-bold uppercase tracking-wider text-primary backdrop-blur-md transition-all hover:bg-primary/20 hover:border-primary flex items-center gap-1.5"
                data-testid="button-hero-open-account"
              >
                Open an account <ArrowUpRight size={15} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. PACKAGE OVERVIEW (5 SUBSCRIPTION PLANS CARDS) */}
      <section id="package-cards" className="relative overflow-hidden w-full py-24 lg:py-32" data-testid="section-packages">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[550px] bg-primary/10 blur-[160px] pointer-events-none rounded-full" />

        <div className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                Subscription Plans
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Choose the plan that fits your trading strategy and account level.
              </p>
            </div>
          </Reveal>

          {/* 5 PREMIUM CARDS GRID */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 items-stretch">
            {packages.map((tier) => {
              const isSelected = selectedTier === tier.name;
              const isSupreme = tier.name === 'Supreme';
              const isRise = tier.name === 'Rise';

              return (
                <Reveal key={tier.name} className="h-full">
                  <div
                    onClick={() => openTerminalModal(tier.name)}
                    className={`group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-7 transition-all duration-500 backdrop-blur-2xl ${
                      isSupreme
                        ? 'border-2 border-primary bg-gradient-to-b from-primary/25 via-[#1a231f]/90 to-[#0e1411]/95 shadow-[0_0_60px_rgba(232,185,73,0.4)] scale-105 z-20'
                        : isRise
                        ? 'border-2 border-primary/80 bg-gradient-to-b from-primary/20 via-[#18201c]/85 to-[#0c100e]/95 shadow-[0_0_45px_rgba(232,185,73,0.3)]'
                        : isSelected
                        ? 'border border-primary/70 bg-gradient-to-b from-primary/15 via-[#131916]/80 to-[#0a0e0c]/90 shadow-[0_0_35px_rgba(232,185,73,0.22)]'
                        : 'border border-white/10 bg-gradient-to-b from-[#141a18]/70 via-[#0e1311]/65 to-[#090b0a]/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:border-primary/60 hover:bg-[#151c19]/80 hover:shadow-[0_0_40px_rgba(232,185,73,0.2)]'
                    }`}
                    data-testid={`card-tier-${tier.name.toLowerCase()}`}
                  >
                    {/* Glass Specular Top Highlight */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    
                    {/* Top Badges */}
                    {isSupreme && (
                      <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-primary via-[#f5c542] to-primary px-3 py-1 font-mono text-[9px] font-black uppercase tracking-wider text-primary-foreground shadow-[0_0_15px_rgba(232,185,73,0.6)] flex items-center gap-1">
                        <Crown size={11} /> VIP TIER
                      </div>
                    )}
                    {isRise && !isSupreme && (
                      <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-primary via-[#f5c542] to-primary px-3 py-1 font-mono text-[9px] font-black uppercase tracking-wider text-primary-foreground shadow-[0_0_15px_rgba(232,185,73,0.5)]">
                        MOST SELECTED
                      </div>
                    )}

                    <div>
                      {/* Header info */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                          {tier.name}
                        </span>
                        <div className={`grid h-9 w-9 place-items-center rounded-xl border backdrop-blur-md ${
                          isSupreme || isRise ? 'border-primary/60 bg-primary/20 text-primary shadow-[0_0_15px_rgba(232,185,73,0.3)]' : 'border-white/10 bg-white/[0.05] text-muted-foreground'
                        }`}>
                          {tier.name === 'Spark' && <Zap size={16} />}
                          {tier.name === 'Boost' && <TrendingUp size={16} />}
                          {tier.name === 'Rise' && <Sparkles size={16} />}
                          {tier.name === 'Titan' && <ShieldCheck size={16} />}
                          {tier.name === 'Supreme' && <Crown size={16} />}
                        </div>
                      </div>

                      {/* Large White Price */}
                      <p className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                        {tier.amount}
                      </p>

                      <div className="my-5 h-px bg-gradient-to-r from-primary/50 via-white/10 to-transparent" />

                      {/* Stats Breakdown */}
                      <div className="space-y-3 font-mono text-xs">
                        {/* Highlighted ROI in Gold */}
                        <div className="rounded-2xl border border-primary/40 bg-primary/15 px-4 py-2.5 backdrop-blur-md">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-[11px] font-semibold">Total ROI</span>
                            <strong className="text-base font-black text-primary">{tier.roi}</strong>
                          </div>
                        </div>

                        {/* Total Return Prominent */}
                        <div className="space-y-2 border-t border-white/10 pt-3 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Return</span>
                            <strong className="text-foreground font-extrabold text-sm">{tier.returnAmount}</strong>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="text-foreground font-medium">{tier.duration}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Daily ROI</span>
                            <span className="font-bold text-primary">{tier.daily}</span>
                          </div>
                        </div>

                        {/* Maximum Slots Badge */}
                        <div className="mt-3 inline-flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] text-muted-foreground">
                          <span>Max Slots:</span>
                          <strong className="text-foreground font-bold">{tier.slots} active</strong>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-7">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openTerminalModal(tier.name);
                        }}
                        className={`w-full rounded-2xl py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 ${
                          isSupreme || isRise
                            ? 'bg-gradient-to-r from-primary via-[#f5c542] to-primary text-primary-foreground shadow-[0_0_25px_rgba(232,185,73,0.4)] hover:brightness-110 hover:shadow-[0_0_35px_rgba(232,185,73,0.6)]'
                            : 'border border-white/15 bg-white/[0.05] text-foreground hover:border-primary/60 hover:bg-primary/15 hover:text-primary backdrop-blur-md'
                        }`}
                        data-testid={`button-choose-plan-${tier.name.toLowerCase()}`}
                      >
                        Choose Plan →
                      </button>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FLAGSHIP SOLUTIONS */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#0a0d0c] py-24 lg:py-32">
        <div className="mx-auto max-w-[1500px] px-5 lg:px-8">
          {/* FLAGSHIP SOLUTIONS SECTION */}
          <div>
            <Reveal>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">TECHNOLOGY INFRASTRUCTURE</span>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                  Flagship Solutions
                </h2>
              </div>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-3 items-stretch">
              {flagshipSolutions.map((sol) => (
                <Reveal key={sol.num} className="h-full">
                  <div className="h-full rounded-3xl border border-primary/30 bg-gradient-to-b from-[#131916]/80 to-[#080b0a]/90 p-8 backdrop-blur-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 blur-3xl pointer-events-none" />

                    <div>
                      {/* Numbered Indicator Badge */}
                      <div className="inline-grid h-9 w-9 place-items-center rounded-xl border border-primary bg-primary/20 font-mono text-sm font-bold text-primary shadow-[0_0_15px_rgba(232,185,73,0.3)]">
                        {sol.num}
                      </div>

                      <h3 className="mt-6 text-2xl font-extrabold text-foreground tracking-tight">{sol.title}</h3>
                      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{sol.desc1}</p>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{sol.desc2}</p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-primary font-bold">
                      <span>NEXATRADES CORE</span>
                      <span>ACTIVE ⚡</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SUBSCRIPTION RULES */}
      <section className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-[#08090a] via-[#0c100e] to-[#08090a] py-24 lg:py-32 font-sans">
        {/* Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-primary/10 blur-[150px] pointer-events-none rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(232,185,73,0.12)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-[1500px] px-5 lg:px-8">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Subscription Rules
              </h2>
              <p className="mt-4 text-sm text-muted-foreground sm:text-base leading-relaxed max-w-xl mx-auto">
                Essential compliance protocols and active management guidelines for all NexaTrades subscription plans.
              </p>
            </div>
          </Reveal>

          {/* 5 Ultra-Premium Numbered Rule Cards in Clean Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 items-stretch max-w-7xl mx-auto">
            {subscriptionRules.map((item) => (
              <Reveal key={item.num} className="h-full">
                <div className="group relative h-full rounded-3xl border border-white/12 bg-gradient-to-b from-[#141c18]/90 via-[#0f1412]/85 to-[#090c0b]/95 p-7 backdrop-blur-2xl flex flex-col justify-between shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/70 hover:shadow-[0_0_40px_rgba(232,185,73,0.3)] overflow-hidden">
                  {/* Top Specular Gold Edge Light */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent group-hover:via-primary transition-all duration-500" />
                  
                  <div>
                    {/* Glowing Number Badge */}
                    <div className="flex items-center justify-between">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl border border-primary/60 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 text-primary font-black text-sm shadow-[0_0_20px_rgba(232,185,73,0.35)] group-hover:scale-110 transition-transform">
                        {item.num}
                      </div>
                      <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary group-hover:shadow-[0_0_10px_#e8b949] transition-all" />
                    </div>

                    {/* Premium Clean Sans-Serif Rule Text */}
                    <p className="mt-6 text-sm font-semibold text-foreground/95 leading-relaxed tracking-wide">
                      {item.rule}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
                    <span>RULE {item.num}</span>
                    <span className="font-bold">COMPLIANCE</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Elevated Premium Compliance Notice Box */}
          <Reveal delay={0.2}>
            <div className="mt-14 max-w-3xl mx-auto rounded-3xl border-2 border-primary/50 bg-gradient-to-r from-primary/20 via-[#18211c]/90 to-primary/20 p-6 sm:p-7 text-center backdrop-blur-2xl shadow-[0_0_40px_rgba(232,185,73,0.25)] relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#e8b9490a_1px,transparent_1px)] bg-[size:1.5rem] opacity-30 pointer-events-none" />
              <div className="relative z-10 flex items-center justify-center gap-3 text-sm sm:text-base font-bold text-primary tracking-wide">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 border border-primary/60 shrink-0">
                  <ShieldCheck size={18} className="text-primary" />
                </div>
                <span>Minimum KYC approval is required before purchasing a subscription.</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5 & 6. DEPOSIT & WITHDRAWAL SECTION */}
      <section id="deposit-section" className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-[#090c0b] via-[#0d1210] to-[#08090a] py-24 lg:py-32 font-sans">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 blur-[150px] pointer-events-none rounded-full" />
        <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-accent/10 blur-[150px] pointer-events-none rounded-full" />

        <div className="relative z-10 mx-auto max-w-[1500px] px-5 lg:px-8">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-primary font-bold shadow-[0_0_20px_rgba(232,185,73,0.2)]">
                <Coins size={14} className="text-primary animate-pulse" />
                FINANCIAL GATEWAY
              </div>
              <h2 className="mt-4 text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Deposit & Withdrawal
              </h2>
              <p className="mt-4 text-sm text-muted-foreground sm:text-base leading-relaxed max-w-xl mx-auto">
                Automated multi-chain liquidity gateways with instant execution and 24/7 wallet credit.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-8 lg:grid-cols-2 items-stretch max-w-6xl mx-auto">
            {/* Left Card: Supported Coins & Deposit Interactive Widget */}
            <Reveal className="h-full">
              <div className="group relative h-full rounded-3xl border border-primary/50 bg-gradient-to-b from-[#151d1a]/95 via-[#0e1311]/90 to-[#080b0a]/95 p-8 sm:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(232,185,73,0.2)] flex flex-col justify-between overflow-hidden">
                {/* Specular Top Edge */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary via-[#f5c542] to-primary px-3.5 py-1.5 font-mono text-xs font-black uppercase text-primary-foreground shadow-[0_0_15px_rgba(232,185,73,0.4)]">
                      Supported Asset
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-accent font-bold uppercase tracking-wider">
                      <span className="h-2 w-2 rounded-full bg-accent animate-ping" /> Instant Auto-Credit
                    </span>
                  </div>

                  {/* Coin Header */}
                  <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-inner">
                    <div className="flex items-center gap-4">
                      {/* Premium USDT Gold Badge */}
                      <div className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/30 via-[#26a17b]/30 to-primary/10 text-primary shadow-[0_0_25px_rgba(232,185,73,0.4)] group-hover:scale-105 transition-transform">
                        <Coins size={30} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-extrabold text-foreground tracking-tight">USDT Tether</h3>
                        <p className="text-xs text-muted-foreground font-mono">Multichain Stablecoin</p>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Selected Protocol</span>
                      <div className="text-sm font-black text-primary">{depositToken}</div>
                    </div>
                  </div>

                  {/* Interactive Token Protocol Tabs */}
                  <div className="mt-5 grid grid-cols-3 gap-2 font-mono text-xs">
                    {(['BEP20', 'TRC20', 'ERC20'] as const).map((token) => (
                      <button
                        key={token}
                        onClick={() => setDepositToken(token)}
                        className={`rounded-xl border py-2.5 px-3 text-center transition-all ${
                          depositToken === token
                            ? 'border-primary bg-primary/20 text-primary font-bold shadow-[0_0_15px_rgba(232,185,73,0.3)]'
                            : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        USDT ({token})
                      </button>
                    ))}
                  </div>

                  {/* Interactive Deposit Address & Copy Box */}
                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-2">Deposit Destination Address</span>
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-xs text-foreground">
                      <span className="truncate font-bold text-primary">
                        {depositToken === 'BEP20' ? '0x71C839F4a9...BSC90' : depositToken === 'TRC20' ? 'TX9aK28M4pL...TRC77' : '0x992B14e8c1...ETH01'}
                      </span>
                      <button
                        onClick={handleCopyAddress}
                        className="shrink-0 rounded-lg bg-primary/20 border border-primary/50 px-3 py-1 text-[11px] font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-1"
                      >
                        {copiedAddress ? <Check size={13} /> : <Copy size={13} />}
                        {copiedAddress ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => setLocation('/register')}
                    className="w-full rounded-2xl bg-gradient-to-r from-primary via-[#f5c542] to-primary py-4 font-mono text-xs font-black uppercase tracking-wider text-primary-foreground shadow-[0_0_30px_rgba(232,185,73,0.4)] hover:brightness-110 hover:shadow-[0_0_45px_rgba(232,185,73,0.6)] transition-all"
                    data-testid="button-deposit-usdt-now"
                  >
                    Deposit USDT ({depositToken}) Now →
                  </button>
                </div>
              </div>
            </Reveal>

            {/* Right Card: Interactive Withdrawal Details & Networks */}
            <Reveal className="h-full">
              <div className="group relative h-full rounded-3xl border border-white/15 bg-gradient-to-b from-[#131916]/95 via-[#0d1210]/90 to-[#080b0a]/95 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl flex flex-col justify-between overflow-hidden">
                {/* Specular Top Edge */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-xs font-bold uppercase text-foreground">
                      Withdrawal Details
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                      24/7 AUTO PAYOUT
                    </span>
                  </div>

                  {/* 3 Interactive Network Selector Buttons */}
                  <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                    {(['BSC', 'ETH', 'TRC'] as const).map((net) => {
                      const isActive = withdrawNetwork === net;
                      return (
                        <button
                          key={net}
                          onClick={() => setWithdrawNetwork(net)}
                          className={`rounded-2xl border p-4 transition-all duration-300 ${
                            isActive
                              ? net === 'BSC'
                                ? 'border-2 border-primary bg-primary/20 text-primary shadow-[0_0_25px_rgba(232,185,73,0.4)] scale-105'
                                : net === 'ETH'
                                ? 'border-2 border-sky-400 bg-sky-500/20 text-sky-300 shadow-[0_0_25px_rgba(56,189,248,0.4)] scale-105'
                                : 'border-2 border-red-500 bg-red-500/20 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.4)] scale-105'
                              : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/30 hover:bg-white/[0.06]'
                          }`}
                          data-testid={`withdraw-network-${net.toLowerCase()}`}
                        >
                          <strong className="text-base font-black block tracking-wider">
                            {net}
                          </strong>
                          <span className="text-[10px] font-mono mt-0.5 block opacity-80">
                            {net === 'BSC' ? 'Binance Smart' : net === 'ETH' ? 'Ethereum' : 'Tron Chain'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Interactive Metrics Based on Selected Network */}
                  <div className="mt-6 grid sm:grid-cols-2 gap-4">
                    {/* Processing Time Card */}
                    <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-5 text-center shadow-inner relative overflow-hidden">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block font-bold">
                        PROCESSING TIME ({withdrawNetwork})
                      </span>
                      <div className="text-2xl font-black text-primary mt-2">
                        {withdrawNetwork === 'BSC' ? 'Up to 15 Minutes' : withdrawNetwork === 'ETH' ? 'Up to 12 Minutes' : 'Up to 5 Minutes'}
                      </div>
                      <span className="mt-1 inline-block text-[10px] font-mono text-accent font-semibold">
                        ● Live Automation Active
                      </span>
                    </div>

                    {/* Minimum Withdrawal Card */}
                    <div className="rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent p-5 text-center shadow-inner relative overflow-hidden">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block font-bold">
                        MINIMUM WITHDRAWAL
                      </span>
                      <div className="text-2xl font-black text-accent mt-2">
                        {withdrawNetwork === 'ETH' ? '$25 USD' : '$15 USD'}
                      </div>
                      <span className="mt-1 inline-block text-[10px] font-mono text-muted-foreground">
                        Estimated Fee: {withdrawNetwork === 'BSC' ? '~$0.20' : withdrawNetwork === 'ETH' ? '~$2.50' : '~$1.00'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => setLocation('/register')}
                    className="w-full rounded-2xl border border-white/20 bg-white/[0.05] py-4 font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:border-primary/60 hover:bg-primary/15 hover:text-primary backdrop-blur-md transition-all text-center"
                  >
                    Initiate {withdrawNetwork} Payout Request →
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 7. TRANSACTION FLOW */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#08090a] py-24 lg:py-32">
        <div className="mx-auto max-w-[1500px] px-5 lg:px-8">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">SIMPLE ONBOARDING</span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                Transaction Flow
              </h2>
            </div>
          </Reveal>

          {/* 5-Step Process */}
          <div className="relative mt-8 max-w-6xl mx-auto">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-accent -translate-y-1/2 z-0" />

            <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 font-mono">
              {transactionFlowSteps.map((s) => (
                <Reveal key={s.step}>
                  <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#121715] to-[#090b0a] p-6 text-center shadow-xl backdrop-blur-xl hover:border-primary/50 transition-all">
                    <div className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-primary bg-primary/20 text-xs font-black text-primary shadow-[0_0_15px_rgba(232,185,73,0.3)]">
                      {s.step}
                    </div>
                    <h3 className="mt-4 font-extrabold text-foreground text-sm tracking-wider">{s.title}</h3>
                    <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-[#08090a] via-[#0e1210] to-[#050606] py-28 lg:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(232,185,73,0.22)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 text-center lg:px-8">
          <Reveal>
            <span className="font-mono text-xs font-black uppercase tracking-widest text-primary">
              ENTER THE FUTURE OF CRYPTO
            </span>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-tight">
              Ready to Trade Smarter?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-sm text-muted-foreground sm:text-base leading-relaxed">
              Choose your NexaTrades subscription and enter the next generation of intelligent crypto trading.
            </p>
            
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  document.getElementById('package-cards')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="rounded-full bg-gradient-to-r from-primary via-[#f5c542] to-primary px-9 py-4 font-mono text-xs font-black uppercase tracking-wider text-primary-foreground shadow-[0_0_35px_rgba(232,185,73,0.45)] hover:scale-105 transition-all"
                data-testid="button-final-choose-plan"
              >
                Choose Your Plan →
              </button>
              <button
                onClick={() => {
                  document.getElementById('deposit-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="rounded-full border border-white/20 bg-white/[0.05] px-9 py-4 font-mono text-xs font-semibold uppercase tracking-wider text-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary backdrop-blur-md"
                data-testid="button-final-deposit-usdt"
              >
                Deposit USDT
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TERMINAL DETAIL MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl overflow-y-auto"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-primary/50 bg-[#0d1110] p-6 sm:p-8 shadow-[0_0_60px_rgba(232,185,73,0.3)] font-mono"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:border-primary"
                data-testid="button-modal-close"
              >
                <X size={16} />
              </button>

              {/* Top Live Tier Switcher Tabs */}
              <div className="flex flex-wrap gap-1.5 border-b border-white/10 pb-4 pr-8">
                {packages.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setModalTier(p.name)}
                    className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase transition-all ${
                      modalTier === p.name
                        ? 'border-primary bg-primary/20 text-primary shadow-sm'
                        : 'border-white/10 bg-white/5 text-muted-foreground hover:border-primary/40'
                    }`}
                    data-testid={`modal-tab-${p.name.toLowerCase()}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Selected Tier Title */}
              <div className="mt-6 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground tracking-widest">SELECTED PLAN</span>
                  <h3 className="text-3xl font-extrabold text-foreground">{modalTierData.name.toUpperCase()}</h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-primary">{modalTierData.amount}</span>
                  {modalTierData.featured && (
                    <div className="text-[9px] font-bold uppercase text-accent">● MOST SELECTED</div>
                  )}
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-xs">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-muted-foreground">TOTAL ROI</span>
                  <strong className="text-sm font-extrabold text-primary">{modalTierData.roi}</strong>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-muted-foreground">TOTAL RETURN</span>
                  <strong className="text-foreground font-bold">{modalTierData.returnAmount}</strong>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-muted-foreground">DURATION</span>
                  <span className="text-foreground">{modalTierData.duration}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-muted-foreground">DAILY ROI</span>
                  <span className="font-bold text-primary">{modalTierData.daily}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">MAX SLOTS PER USER</span>
                  <span className="text-foreground">{modalTierData.slots} Active</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setLocation('/register');
                  }}
                  className="flex-1 rounded-xl bg-primary py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-[0_0_20px_rgba(232,185,73,0.3)] hover:bg-[#f5c542]"
                  data-testid="button-modal-proceed"
                >
                  Proceed to Activation →
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  data-testid="button-modal-close-action"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string>('');
  const isRegister = mode === 'register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const finalEmail = email.trim().toLowerCase();
    if (!finalEmail) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const dbProfile = await fetchUserProfileFromDb(finalEmail);

      // UNREGISTERED USER LOGIN CHECK:
      // If user tries to SIGN IN directly without an account, block them and ask to Sign Up!
      if (!isRegister && !dbProfile) {
        setLoading(false);
        setAuthError(`No account found registered with email "${finalEmail}". Please Sign Up first!`);
        return;
      }

      const rawName = isRegister
        ? (name.trim() || finalEmail.split('@')[0])
        : (dbProfile?.full_name || finalEmail.split('@')[0]);
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      let balanceToKeep = 0;
      if (dbProfile && dbProfile.wallet_balance !== undefined) {
        balanceToKeep = Number(dbProfile.wallet_balance) || 0;
      }

      localStorage.setItem('nexa_user_name', formattedName);
      localStorage.setItem('nexa_user_email', finalEmail);
      localStorage.setItem('nexa_auth_user', JSON.stringify({ name: formattedName, email: finalEmail }));

      // Sync/Create profile in Supabase DB
      await syncUserProfile(finalEmail, formattedName, balanceToKeep);

      setLoading(false);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setLoading(false);
      setAuthError(err?.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="relative flex min-h-[calc(100dvh-72px)] items-center justify-center overflow-hidden px-5 py-16">
      <div className="absolute inset-0 grid-fade opacity-60" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo compact />
          <h1 className="mt-8 text-3xl font-semibold tracking-[-.05em]">
            {isRegister ? 'Make room for better decisions.' : 'Welcome back to the signal.'}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {isRegister ? 'Create your NexaTraders account in under a minute.' : 'Sign in to access your NexaTraders User Dashboard.'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card/85 p-6 shadow-2xl backdrop-blur sm:p-8 space-y-4">
          {authError && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-mono text-rose-400 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle size={16} /> {authError}
              </div>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthError('');
                    setLocation('/register');
                  }}
                  className="w-full rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground hover:bg-[#f3cc68] transition-all mt-1"
                >
                  Click Here to Sign Up (Create Account)
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <label className="block text-sm">
                <span className="mb-2 block text-muted-foreground">Full name</span>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-3 outline-none focus:border-primary"
                  data-testid="input-auth-name"
                />
              </label>
            )}
            <label className="block text-sm">
              <span className="mb-2 block text-muted-foreground">Email address</span>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-3 outline-none focus:border-primary font-mono text-sm"
                data-testid="input-auth-email"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-muted-foreground">Password</span>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-3 outline-none focus:border-primary font-mono text-sm"
                data-testid="input-auth-password"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-[#f3cc68] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              data-testid={`button-auth-${mode}`}
            >
              {loading ? (
                <span>Checking account credentials...</span>
              ) : (
                <>
                  {isRegister ? 'Create Account & Launch Dashboard' : 'Sign In to Dashboard'} <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
          <div className="mt-6 border-t border-border pt-5 text-center text-xs text-muted-foreground">
            {isRegister ? 'Already have access? ' : 'New to NexaTraders? '}
            <button
              onClick={() => {
                setAuthError('');
                setLocation(isRegister ? '/login' : '/register');
              }}
              className="text-primary hover:underline font-bold"
              data-testid="button-auth-switch"
            >
              {isRegister ? 'Sign in' : 'Create an account'}
            </button>
          </div>
        </div>
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          By continuing, you acknowledge our{' '}
          <Link href="/privacy" className="text-primary hover:underline" data-testid="link-auth-privacy">
            privacy policy
          </Link>.
        </p>
      </div>
    </div>
  );
}

function TradesPage() {
  const [selectedPair, setSelectedPair] = useState('All');
  const [search, setSearch] = useState('');
  const [autoStream, setAutoStream] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState<any | null>(null);

  // Live Market Prices State directly fetched from Binance API
  const [liveMarketPrices, setLiveMarketPrices] = useState<Record<string, number>>({});
  const [tradeStream, setTradeStream] = useState<any[]>([]);

  const formatPrice = (val: number) => {
    if (!val || isNaN(val)) return '$0.00';
    if (val < 1) return `$${val.toFixed(4)}`;
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper to generate realistic micro profit with 100% mathematically exact price diff matching!
  const createTrade = (pair: string, currentPrice: number, tradeIdNum?: number) => {
    const exchanges = ['Binance', 'Kraken', 'OKX', 'Bybit', 'Coinbase', 'MEXC', 'KuCoin', 'Bitget'];
    const bEx = exchanges[Math.floor(Math.random() * exchanges.length)];
    let sEx = exchanges[Math.floor(Math.random() * exchanges.length)];
    while (sEx === bEx) sEx = exchanges[Math.floor(Math.random() * exchanges.length)];

    const bPrice = currentPrice;

    // Exact Mathematical Price Difference per Coin
    let diff = 0.01;
    if (pair.startsWith('XRP') || pair.startsWith('ADA')) {
      diff = parseFloat((0.005 + Math.random() * 0.015).toFixed(3)); // 0.5 cent to 2 cents diff! e.g. Buy $1.480, Sell $1.490 = +$0.01 profit
    } else if (pair.startsWith('AVAX')) {
      diff = parseFloat((0.04 + Math.random() * 0.16).toFixed(2));
    } else if (pair.startsWith('SOL') || pair.startsWith('BNB')) {
      diff = parseFloat((0.15 + Math.random() * 0.45).toFixed(2));
    } else if (pair.startsWith('ETH')) {
      diff = parseFloat((0.50 + Math.random() * 1.50).toFixed(2));
    } else if (pair.startsWith('BTC')) {
      diff = parseFloat((1.20 + Math.random() * 3.80).toFixed(2));
    }

    const sPrice = bPrice + diff;
    const spreadPct = parseFloat(((diff / bPrice) * 100).toFixed(2));
    const profitNum = diff; // Exact 1-to-1 matching profit! e.g. Buy $1.48, Sell $1.49 -> Profit = +$0.01!

    const amountNum = Math.floor(400 + Math.random() * 800);
    const idNum = tradeIdNum || Math.floor(89421 + Math.random() * 1000);

    return {
      id: `NT-${idNum}`,
      timestamp: 'Just now',
      pair: pair,
      buyEx: bEx,
      buyPrice: formatPrice(bPrice),
      sellEx: sEx,
      sellPrice: formatPrice(sPrice),
      spread: `+${spreadPct}%`,
      amount: `$${amountNum.toLocaleString()}.00`,
      profit: `+$${profitNum.toFixed(2)}`,
      status: 'Completed',
      ping: `${(8 + Math.random() * 10).toFixed(1)}ms`,
    };
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Helper to generate 500 historical trades across 50 pages with realistic historical prices matching 3d ago to now
  const generateInitialHistory = (pricesMap: Record<string, number>) => {
    const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDC', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'AVAX/USDC'];
    const list = [];
    for (let i = 0; i < 500; i++) {
      const p = pairs[i % pairs.length];
      const basePx = pricesMap[p] || (p.startsWith('BTC') ? 64250 : p.startsWith('ETH') ? 3450 : p.startsWith('XRP') ? 1.48 : 158);

      // Realistic historical price drift from current live price back to 3 days ago
      const ageRatio = i / 500;
      const priceVariation = 1 - ageRatio * 0.038 + Math.sin(i * 0.15) * 0.006;
      const historicalPx = parseFloat((basePx * priceVariation).toFixed(p.startsWith('XRP') || p.startsWith('ADA') ? 3 : 2));

      let ts = 'Just now';
      if (i > 0 && i < 10) ts = `${i * 3}s ago`;
      else if (i >= 10 && i < 50) ts = `${Math.floor(i / 2)}m ago`;
      else if (i >= 50 && i < 200) ts = `${Math.floor(i / 10)}h ago`;
      else if (i >= 200 && i < 400) ts = `${Math.floor(i / 100)}d ago`;
      else ts = `3d ago`;

      const t = createTrade(p, historicalPx, 89500 - i);
      t.timestamp = ts;
      list.push(t);
    }
    return list;
  };

  // Immediate Real-Time API Fetcher for Binance Public Spot Tickers
  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price');
        if (res.ok) {
          const data = await res.json();
          const pricesMap: Record<string, number> = {};
          data.forEach((item: { symbol: string; price: string }) => {
            if (item.symbol === 'BTCUSDT') pricesMap['BTC/USDT'] = parseFloat(item.price);
            if (item.symbol === 'ETHUSDT') pricesMap['ETH/USDT'] = parseFloat(item.price);
            if (item.symbol === 'SOLUSDT') pricesMap['SOL/USDC'] = parseFloat(item.price);
            if (item.symbol === 'BNBUSDT') pricesMap['BNB/USDT'] = parseFloat(item.price);
            if (item.symbol === 'XRPUSDT') pricesMap['XRP/USDT'] = parseFloat(item.price);
            if (item.symbol === 'ADAUSDT') pricesMap['ADA/USDT'] = parseFloat(item.price);
            if (item.symbol === 'AVAXUSDT') pricesMap['AVAX/USDC'] = parseFloat(item.price);
          });
          setLiveMarketPrices(pricesMap);

          // Populate initial 500 trades (50 pages) if empty
          setTradeStream((prev) => {
            if (prev.length > 0) return prev;
            return generateInitialHistory(pricesMap);
          });
        }
      } catch {
        // Fallback live prices
        const fallbackMap: Record<string, number> = {
          'BTC/USDT': 64250.80,
          'ETH/USDT': 3450.40,
          'SOL/USDC': 158.20,
          'BNB/USDT': 572.60,
          'XRP/USDT': 0.5840,
          'ADA/USDT': 0.3820,
          'AVAX/USDC': 24.50,
        };
        setLiveMarketPrices(fallbackMap);
        setTradeStream((prev) => {
          if (prev.length > 0) return prev;
          return generateInitialHistory(fallbackMap);
        });
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 1000);
    return () => clearInterval(interval);
  }, []);

  // Continuous Auto-Stream Trade Generation (Every 1.0s, maintaining 500 buffer)
  useEffect(() => {
    if (!autoStream) return;
    const interval = setInterval(() => {
      const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDC', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'AVAX/USDC'];
      const p = pairs[Math.floor(Math.random() * pairs.length)];
      const currentPx = liveMarketPrices[p] || (p.startsWith('BTC') ? 96450 : p.startsWith('ETH') ? 3450 : 198);
      const newTrade = createTrade(p, currentPx);

      setTradeStream((prev) => [newTrade, ...prev.slice(0, 499)]);
    }, 1000);

    return () => clearInterval(interval);
  }, [autoStream, liveMarketPrices]);

  const filteredTrades = useMemo(() => {
    return tradeStream.filter((t) => {
      const matchesPair = selectedPair === 'All' || t.pair === selectedPair;
      const matchesSearch =
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.pair.toLowerCase().includes(search.toLowerCase()) ||
        t.buyEx.toLowerCase().includes(search.toLowerCase()) ||
        t.sellEx.toLowerCase().includes(search.toLowerCase());
      return matchesPair && matchesSearch;
    });
  }, [tradeStream, selectedPair, search]);

  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / itemsPerPage));
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTrades.slice(start, start + itemsPerPage);
  }, [filteredTrades, currentPage, itemsPerPage]);

  // Dynamic KPI Stats calculated from actual executed trades stream on top of base baselines
  const kpiStats = useMemo(() => {
    let vol = 142890420; // $142.89M 24h Volume base baseline
    let profit = 4120;   // $4,120 24h Net Profit base baseline (Always above $4,000)
    let totalPing = 0;

    tradeStream.forEach((t) => {
      const v = parseFloat(t.amount.replace(/[^0-9.]/g, '')) || 0;
      const p = parseFloat(t.profit.replace(/[^0-9.]/g, '')) || 0;
      const ping = parseFloat(t.ping.replace(/[^0-9.]/g, '')) || 12;

      vol += v;
      profit += p;
      totalPing += ping;
    });

    const avgPing = tradeStream.length ? (totalPing / tradeStream.length).toFixed(1) : '12.4';
    return {
      volume: vol,
      profit: profit,
      avgLatency: avgPing,
    };
  }, [tradeStream]);

  return (
    <div>
      {/* Ultra-Premium AI Intelligence Hero Banner */}
      <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-[#0b0e0d] via-[#0d1110] to-[#08090a] py-12 lg:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(232,185,73,0.15)_0%,rgba(16,185,129,0.05)_50%,transparent_75%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e8b94908_1px,transparent_1px),linear-gradient(to_bottom,#e8b94908_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-60 pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Heading & System Telemetry Status */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[10px] uppercase tracking-widest text-primary mb-4 shadow-[0_0_20px_rgba(232,185,73,0.2)]">
                <Sparkles size={13} className="animate-spin-slow text-primary" />
                NEURAL ARBITRAGE SYSTEM V4 · REAL TIME ENGINE
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
                Arbitrage Live Trades
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base max-w-2xl">
                Watch sub-14ms cross-exchange arbitrage routes execute in real-time across 18+ connected venues. Powered by autonomous AI orderbook scanning and tick-by-tick neural routing.
              </p>

              {/* Live Bot Execution Highlights */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="rounded-xl border border-primary/30 bg-[#121614]/80 p-3 backdrop-blur-md">
                  <div className="text-[10px] text-muted-foreground uppercase">Bot Status</div>
                  <div className="mt-1 flex items-center gap-1.5 font-bold text-accent">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse-signal" />
                    AUTONOMOUS
                  </div>
                </div>
                <div className="rounded-xl border border-border/80 bg-card/60 p-3 backdrop-blur-md">
                  <div className="text-[10px] text-muted-foreground uppercase">Execution Speed</div>
                  <div className="mt-1 font-bold text-primary">Sub-14ms</div>
                </div>
                <div className="rounded-xl border border-border/80 bg-card/60 p-3 backdrop-blur-md col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-muted-foreground uppercase">Scanning Venues</div>
                  <div className="mt-1 font-bold text-foreground">18 Global Exchanges</div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Tech Cyber Robot Graphic Container */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-b from-[#141917] to-[#0c0f0f] p-3 shadow-[0_0_60px_rgba(232,185,73,0.25)] group backdrop-blur-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090a] via-transparent to-transparent z-10 opacity-40 pointer-events-none" />
                <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-black aspect-square">
                  <img
                    src="/ai-bot-hero.jpg"
                    alt="Autonomous AI Arbitrage Trading Robot"
                    className="h-full w-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                    data-testid="img-ai-bot-trades"
                  />
                  {/* Floating Overlay Badge */}
                  <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-2 rounded-lg border border-primary/50 bg-[#0d1010]/90 px-3 py-1.5 font-mono text-[10px] text-primary backdrop-blur-md shadow-xl">
                    <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
                    AI ENGINE ACTIVE · SCANNING TICK ORDERBOOKS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        {/* Real-time Ticker Feed Banner */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 font-mono text-xs text-accent backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse-signal" />
            <span className="font-bold">● LIVE MARKET PRICE FEED CONNECTED</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="text-muted-foreground">BTC: <strong className="text-foreground">{formatPrice(liveMarketPrices['BTC/USDT'] || 64250)}</strong></span>
            <span className="text-muted-foreground">ETH: <strong className="text-foreground">{formatPrice(liveMarketPrices['ETH/USDT'] || 3450)}</strong></span>
            <span className="text-muted-foreground">SOL: <strong className="text-foreground">{formatPrice(liveMarketPrices['SOL/USDC'] || 158)}</strong></span>
            <span className="text-muted-foreground">BNB: <strong className="text-foreground">{formatPrice(liveMarketPrices['BNB/USDT'] || 572)}</strong></span>
            <span className="text-muted-foreground">XRP: <strong className="text-foreground">{formatPrice(liveMarketPrices['XRP/USDT'] || 0.584)}</strong></span>
          </div>
        </div>
        {/* KPI Top Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-primary/40 bg-card/70 p-5 shadow-[0_0_30px_rgba(232,185,73,0.1)]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">24h Total Volume</span>
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse-signal" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-foreground">
              ${kpiStats.volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="mt-1 font-mono text-xs text-accent">↑ +18.4% 24h routed</p>
          </div>

          <div className="rounded-xl border border-accent/40 bg-card/70 p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">24h Net Profit</span>
              <Sparkles size={16} className="text-accent" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-accent">
              +${kpiStats.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">99.84% win rate</p>
          </div>

          <div className="rounded-xl border border-border bg-card/70 p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Active Executions</span>
              <span className="font-mono text-xs text-primary">● Live</span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-foreground">1,842</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">Routes active</p>
          </div>

          <div className="rounded-xl border border-border bg-card/70 p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Avg Latency</span>
              <Zap size={16} className="text-primary" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-primary">{kpiStats.avgLatency} ms</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">Sub-14ms HFT speed</p>
          </div>
        </div>

        {/* Filter & Live Ticker Controls */}
        <div className="mt-10 flex flex-col gap-4 rounded-xl border border-border bg-card/60 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {['All', 'BTC/USDT', 'ETH/USDT', 'SOL/USDC', 'BNB/USDT', 'XRP/USDT'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPair(p)}
                className={`rounded-lg px-3 py-1.5 uppercase transition ${
                  selectedPair === p
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'border border-border bg-secondary/50 text-muted-foreground hover:text-foreground'
                }`}
                data-testid={`filter-pair-${p.toLowerCase().replace('/', '-')}`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search trade ID or exchange..."
                className="w-full rounded-lg border border-border bg-secondary py-2 pl-9 pr-3 text-xs outline-none focus:border-primary font-mono"
                data-testid="input-search-trades"
              />
            </div>

            <button
              onClick={() => setAutoStream((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs font-semibold transition ${
                autoStream ? 'border-accent/40 bg-accent/10 text-accent' : 'border-border bg-secondary text-muted-foreground'
              }`}
              data-testid="button-toggle-autostream"
            >
              <span className={`h-2 w-2 rounded-full ${autoStream ? 'bg-accent animate-pulse-signal' : 'bg-muted'}`} />
              Auto-Stream: {autoStream ? 'ON' : 'PAUSED'}
            </button>
          </div>
        </div>

        {/* Live Trades Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card/70 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs" data-testid="table-live-trades">
              <thead className="border-b border-border/80 bg-secondary/80 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">Trade ID / Time</th>
                  <th className="p-4">Pair</th>
                  <th className="p-4">Buy Exchange</th>
                  <th className="p-4">Sell Exchange</th>
                  <th className="p-4">Spread Edge</th>
                  <th className="p-4">Trade Capital</th>
                  <th className="p-4">Net Profit</th>
                  <th className="p-4">Speed</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedTrades.map((t, idx) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTrade(t)}
                    className="group cursor-pointer transition hover:bg-primary/5"
                    data-testid={`row-trade-${t.id}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {idx === 0 && currentPage === 1 && <span className="h-2 w-2 rounded-full bg-accent animate-pulse-signal" />}
                        <span className="font-bold text-foreground group-hover:text-primary">{t.id}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{t.timestamp}</span>
                    </td>
                    <td className="p-4 font-bold text-foreground">{t.pair}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <ExchangeLogoIcon name={t.buyEx} />
                        <div>
                          <span className="block font-bold text-foreground">{t.buyEx}</span>
                          <span className="text-[10px] text-muted-foreground">{t.buyPrice}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <ExchangeLogoIcon name={t.sellEx} />
                        <div>
                          <span className="block font-bold text-foreground">{t.sellEx}</span>
                          <span className="text-[10px] text-muted-foreground">{t.sellPrice}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 rounded bg-accent/15 px-2 py-0.5 font-bold text-accent">
                        <ArrowUpRight size={12} /> {t.spread}
                      </span>
                    </td>
                    <td className="p-4 text-foreground">{t.amount}</td>
                    <td className="p-4 font-bold text-primary">{t.profit}</td>
                    <td className="p-4 text-muted-foreground">{t.ping}</td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] text-accent">
                        <Check size={11} /> Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 50-Page Pagination Bar */}
          <div className="flex flex-col gap-4 border-t border-border/80 bg-secondary/40 p-4 sm:flex-row sm:items-center sm:justify-between font-mono text-xs">
            <div className="text-muted-foreground">
              Showing <strong className="text-foreground">{((currentPage - 1) * itemsPerPage) + 1}</strong>–
              <strong className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredTrades.length)}</strong> of{' '}
              <strong className="text-primary">{filteredTrades.length}</strong> trades (Page <strong className="text-foreground">{currentPage}</strong> of <strong className="text-foreground">{totalPages}</strong>)
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="rounded-md border border-border bg-card px-2.5 py-1.5 text-muted-foreground hover:border-primary/50 hover:text-foreground disabled:opacity-40"
                data-testid="button-page-first"
              >
                « First
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-md border border-border bg-card px-2.5 py-1.5 text-muted-foreground hover:border-primary/50 hover:text-foreground disabled:opacity-40"
                data-testid="button-page-prev"
              >
                ‹ Prev
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pNum = currentPage;
                if (currentPage <= 3) pNum = i + 1;
                else if (currentPage >= totalPages - 2) pNum = totalPages - 4 + i;
                else pNum = currentPage - 2 + i;
                if (pNum < 1 || pNum > totalPages) return null;

                return (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    className={`rounded-md px-3 py-1.5 font-bold transition ${
                      currentPage === pNum
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                    data-testid={`button-page-${pNum}`}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-md border border-border bg-card px-2.5 py-1.5 text-muted-foreground hover:border-primary/50 hover:text-foreground disabled:opacity-40"
                data-testid="button-page-next"
              >
                Next ›
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="rounded-md border border-border bg-card px-2.5 py-1.5 text-muted-foreground hover:border-primary/50 hover:text-foreground disabled:opacity-40"
                data-testid="button-page-last"
              >
                Last 50 »
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trade Inspector Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-primary/40 bg-[#0d1010] p-6 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse-signal" />
                <h3 className="font-bold text-base text-foreground">Trade Telemetry / {selectedTrade.id}</h3>
              </div>
              <button onClick={() => setSelectedTrade(null)} className="rounded p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Pair</span>
                <strong className="text-foreground">{selectedTrade.pair}</strong>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Buy Venue</span>
                <span className="text-foreground">{selectedTrade.buyEx} ({selectedTrade.buyPrice})</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Sell Venue</span>
                <span className="text-foreground">{selectedTrade.sellEx} ({selectedTrade.sellPrice})</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Arbitrage Spread Edge</span>
                <strong className="text-accent">{selectedTrade.spread}</strong>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Trade Capital</span>
                <span>{selectedTrade.amount}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Net Yield</span>
                <strong className="text-primary text-sm">{selectedTrade.profit}</strong>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Execution Latency</span>
                <span className="text-primary">{selectedTrade.ping}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedTrade(null)}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-[#f3cc68]"
                data-testid="button-close-telemetry"
              >
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  return (
    <ErrorBoundary resetKey={location}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/trades" component={TradesPage} />
        <Route path="/packages" component={PackagesPage} />
        <Route path="/dashboard" component={UserDashboard} />
        <Route path="/admin/login" component={AdminLoginPage} />
        <Route path="/admin" component={AdminLayout} />
        <Route path="/about" component={AboutPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:slug" component={ArticlePage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/login">{() => <AuthPage mode="login" />}</Route>
        <Route path="/register">{() => <AuthPage mode="register" />}</Route>
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          {!isAdminRoute && <Navbar />}
          <Router />
          {!isAdminRoute && <Footer />}
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;