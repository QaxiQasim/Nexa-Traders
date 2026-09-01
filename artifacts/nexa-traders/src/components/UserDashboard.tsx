import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Wallet,
  TrendingUp,
  Package,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Copy,
  Check,
  CreditCard,
  FileText,
  UploadCloud,
  DollarSign,
  History,
  Sparkles,
  RefreshCw,
  Zap,
  ChevronRight,
  ExternalLink,
  Lock,
  UserCheck,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Layers,
  ChevronDown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  syncUserProfile,
  insertPackageToDb,
  upsertKycToDb,
  insertTransactionToDb,
  fetchUserPackagesFromDb,
  fetchKycFromDb,
  fetchTransactionsFromDb,
  fetchUserProfileFromDb
} from '@/lib/supabase';

export interface PurchasedPackage {
  id: string;
  name: string;
  amount: number;
  dailyRoi: number;
  totalRoiCap: number; // e.g. 200% or 300%
  earnedRoi: number;
  remainingRoi: number;
  purchaseDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface Transaction {
  id: string;
  date: string;
  type: 'DEPOSIT' | 'PACKAGE_PURCHASE' | 'DAILY_ROI' | 'WITHDRAWAL';
  title: string;
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  txHash?: string;
}

export interface KycData {
  status: 'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  fullName: string;
  dob: string;
  country: string;
  idType: 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE';
  idNumber: string;
  submittedAt?: string;
}

const DEFAULT_PACKAGES: PurchasedPackage[] = [
  {
    id: 'PKG-8921',
    name: 'Rise',
    amount: 1000,
    dailyRoi: 1.8,
    totalRoiCap: 2000,
    earnedRoi: 480.00,
    remainingRoi: 1520.00,
    purchaseDate: '2026-08-12',
    expiryDate: '2026-11-12',
    status: 'ACTIVE'
  },
  {
    id: 'PKG-9403',
    name: 'Supreme',
    amount: 10000,
    dailyRoi: 3.5,
    totalRoiCap: 30000,
    earnedRoi: 4200.00,
    remainingRoi: 25800.00,
    purchaseDate: '2026-08-20',
    expiryDate: '2027-02-20',
    status: 'ACTIVE'
  }
];

const AVAILABLE_PLANS = [
  {
    name: 'Spark',
    price: '$100',
    min: 100,
    max: 100,
    totalRoi: '85%',
    totalReturn: '$185',
    dailyRoi: '$1/day',
    dailyRoiNum: 1.0,
    totalCapPct: 185,
    duration: '6 Months',
    slots: '2 active',
    features: ['Standard AI Execution', 'Daily ROI Credits', '24/7 Live Monitoring', 'Standard Withdrawal Speed']
  },
  {
    name: 'Boost',
    price: '$300',
    min: 300,
    max: 300,
    totalRoi: '90%',
    totalReturn: '$570',
    dailyRoi: '$3.8/day',
    dailyRoiNum: 1.26,
    totalCapPct: 190,
    duration: '5 Months',
    slots: '4 active',
    features: ['Multi-Exchange Spreads', 'Institutional Liquidity', 'Dedicated Account Assistant', 'Instant Capital Compound']
  },
  {
    name: 'Rise',
    price: '$1,000',
    min: 1000,
    max: 1000,
    totalRoi: '95%',
    totalReturn: '$2,000',
    dailyRoi: '$13/day',
    dailyRoiNum: 1.3,
    totalCapPct: 200,
    duration: '5 Months',
    slots: '5 active',
    popular: true,
    badgeText: 'MOST SELECTED',
    features: ['High-Frequency Arbitrage', 'Automated Daily Payouts', 'Priority Execution Latency', 'Fast 15-Min Withdrawal']
  },
  {
    name: 'Titan',
    price: '$5,000',
    min: 5000,
    max: 5000,
    totalRoi: '100%',
    totalReturn: '$10,000',
    dailyRoi: '$66/day',
    dailyRoiNum: 1.32,
    totalCapPct: 200,
    duration: '5 Months',
    slots: '6 active',
    features: ['VIP Flash Loans Integration', 'Maximum Daily Spread Yield', 'Zero Withdrawal Fees', 'Direct Trader Desk Access']
  },
  {
    name: 'Supreme',
    price: '$10,000',
    min: 10000,
    max: 100000,
    totalRoi: '120%',
    totalReturn: '$22,000',
    dailyRoi: '$183/day',
    dailyRoiNum: 1.83,
    totalCapPct: 220,
    duration: '4 Months',
    slots: '8 active',
    supreme: true,
    badgeText: 'VIP TIER 👑',
    features: ['Institutional AI Quantum Engine', 'Custom Yield Strategy', 'VIP Concierge Service', 'Uncapped Compounding Power']
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-98421',
    date: '2026-08-30 14:20',
    type: 'DAILY_ROI',
    title: 'Daily ROI Payout (Supreme Plan)',
    amount: 350.00,
    status: 'COMPLETED',
    txHash: '0x8f2...b41e'
  },
  {
    id: 'TX-98418',
    date: '2026-08-30 14:15',
    type: 'DAILY_ROI',
    title: 'Daily ROI Payout (Rise Plan)',
    amount: 18.00,
    status: 'COMPLETED',
    txHash: '0x3a1...c90d'
  },
  {
    id: 'TX-97800',
    date: '2026-08-20 10:30',
    type: 'PACKAGE_PURCHASE',
    title: 'Activated Supreme Package',
    amount: -10000.00,
    status: 'COMPLETED',
    txHash: '0x7e4...f112'
  },
  {
    id: 'TX-97550',
    date: '2026-08-20 10:15',
    type: 'DEPOSIT',
    title: 'USDT BEP20 Deposit',
    amount: 10000.00,
    status: 'COMPLETED',
    txHash: '0x1c9...d88a'
  },
  {
    id: 'TX-96100',
    date: '2026-08-12 09:00',
    type: 'PACKAGE_PURCHASE',
    title: 'Activated Rise Package',
    amount: -1000.00,
    status: 'COMPLETED',
    txHash: '0x4b2...e55c'
  }
];

const YIELD_GRAPH_DATA = [
  { day: 'Mon', yield: 120 },
  { day: 'Tue', yield: 240 },
  { day: 'Wed', yield: 410 },
  { day: 'Thu', yield: 680 },
  { day: 'Fri', yield: 1150 },
  { day: 'Sat', yield: 2800 },
  { day: 'Sun', yield: 4680 }
];

export function UserDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'buy' | 'kyc' | 'withdraw' | 'transactions'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load User Data from localStorage / Supabase defaults
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('nexa_user_name') || 'Alex Vance');
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem('nexa_user_email') || 'alex.vance@nexatraders.com');
  
  const isDemo = userEmail.toLowerCase() === 'alex.vance@nexatraders.com';

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('nexa_wallet_balance');
    if (saved !== null) return parseFloat(saved);
    return isDemo ? 4680.00 : 0.00;
  });

  const [purchasedPackages, setPurchasedPackages] = useState<PurchasedPackage[]>(() => {
    const saved = localStorage.getItem('nexa_purchased_packages');
    if (saved !== null) return JSON.parse(saved);
    return isDemo ? DEFAULT_PACKAGES : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('nexa_transactions');
    if (saved !== null) return JSON.parse(saved);
    return isDemo ? INITIAL_TRANSACTIONS : [];
  });

  const [kycData, setKycData] = useState<KycData>(() => {
    const saved = localStorage.getItem('nexa_kyc_data');
    if (saved !== null) return JSON.parse(saved);
    return isDemo ? {
      status: 'APPROVED',
      fullName: 'Alex Vance',
      dob: '1992-05-14',
      country: 'United Arab Emirates',
      idType: 'PASSPORT',
      idNumber: 'N849102948',
      submittedAt: '2026-08-10'
    } : {
      status: 'UNVERIFIED',
      fullName: '',
      dob: '',
      country: 'United Arab Emirates',
      idType: 'PASSPORT',
      idNumber: '',
    };
  });

  // On mount, sync from live Supabase DB
  useEffect(() => {
    if (!userEmail) return;
    fetchUserProfileFromDb(userEmail).then(profile => {
      if (profile && profile.wallet_balance !== undefined) {
        setWalletBalance(Number(profile.wallet_balance));
      }
    });
    fetchUserPackagesFromDb(userEmail).then(pkgs => {
      if (pkgs !== null) setPurchasedPackages(pkgs);
    });
    fetchTransactionsFromDb(userEmail).then(txs => {
      if (txs !== null) setTransactions(txs);
    });
    fetchKycFromDb(userEmail).then(kyc => {
      if (kyc !== null) setKycData(kyc as any);
    });
  }, [userEmail]);

  // Save to localStorage & sync to Supabase Live Database
  useEffect(() => {
    localStorage.setItem('nexa_wallet_balance', walletBalance.toString());
    syncUserProfile(userEmail, userName, walletBalance);
  }, [walletBalance, userEmail, userName]);

  useEffect(() => {
    localStorage.setItem('nexa_purchased_packages', JSON.stringify(purchasedPackages));
  }, [purchasedPackages]);

  useEffect(() => {
    localStorage.setItem('nexa_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('nexa_kyc_data', JSON.stringify(kycData));
  }, [kycData]);

  // Aggregate Metrics
  const totalInvested = purchasedPackages.reduce((acc, p) => acc + p.amount, 0);
  const totalEarnedRoi = purchasedPackages.reduce((acc, p) => acc + p.earnedRoi, 0);
  const totalRemainingRoi = purchasedPackages.reduce((acc, p) => acc + p.remainingRoi, 0);
  const activePackagesCount = purchasedPackages.filter(p => p.status === 'ACTIVE').length;

  // Buy Package Modal State
  const [selectedPlanForBuy, setSelectedPlanForBuy] = useState<typeof AVAILABLE_PLANS[0] | null>(null);
  const [customInvestAmount, setCustomInvestAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'USDT_BEP20' | 'BTC'>('WALLET');
  const [buySuccessMessage, setBuySuccessMessage] = useState<string>('');

  // KYC Form State
  const [kycForm, setKycForm] = useState({
    fullName: '',
    dob: '',
    country: 'United Arab Emirates',
    idType: 'PASSPORT' as 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE',
    idNumber: '',
    fileUploaded: false
  });
  const [kycMessage, setKycMessage] = useState<string>('');

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState<string>('500');
  const [withdrawWallet, setWithdrawWallet] = useState<string>('');
  const [withdrawNetwork, setWithdrawNetwork] = useState<'USDT_BEP20' | 'USDT_TRC20' | 'BTC'>('USDT_BEP20');
  const [withdrawMessage, setWithdrawMessage] = useState<string>('');

  // Handle Buy Package Confirmation
  const handleConfirmPurchase = () => {
    if (!selectedPlanForBuy) return;
    const amount = Number(customInvestAmount);
    if (isNaN(amount) || amount < selectedPlanForBuy.min || amount > selectedPlanForBuy.max) {
      alert(`Investment amount must be between $${selectedPlanForBuy.min} and $${selectedPlanForBuy.max}`);
      return;
    }

    if (paymentMethod === 'WALLET' && walletBalance < amount) {
      alert(`Insufficient wallet balance. You have $${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} available.`);
      return;
    }

    const totalCap = amount * (selectedPlanForBuy.totalCapPct / 100);
    const newPkg: PurchasedPackage = {
      id: `PKG-${Math.floor(1000 + Math.random() * 9000)}`,
      name: selectedPlanForBuy.name,
      amount: amount,
      dailyRoi: selectedPlanForBuy.dailyRoiNum,
      totalRoiCap: totalCap,
      earnedRoi: 0,
      remainingRoi: totalCap,
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE'
    };

    setPurchasedPackages([newPkg, ...purchasedPackages]);
    insertPackageToDb(userEmail, newPkg);

    if (paymentMethod === 'WALLET') {
      setWalletBalance(prev => prev - amount);
    }

    const newTx: Transaction = {
      id: `TX-${Math.floor(80000 + Math.random() * 10000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'PACKAGE_PURCHASE',
      title: `Subscribed ${selectedPlanForBuy.name} Plan`,
      amount: -amount,
      status: 'COMPLETED',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
    };

    setTransactions([newTx, ...transactions]);
    insertTransactionToDb(userEmail, newTx);
    setBuySuccessMessage(`Successfully purchased ${selectedPlanForBuy.name} Plan for $${amount.toLocaleString()}! Package activated.`);
    
    setTimeout(() => {
      setSelectedPlanForBuy(null);
      setBuySuccessMessage('');
      setActiveTab('packages');
    }, 1800);
  };

  // Handle KYC Submit
  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycForm.fullName || !kycForm.idNumber) {
      alert('Please fill out all mandatory KYC fields.');
      return;
    }
    const updated: KycData = {
      status: 'PENDING',
      fullName: kycForm.fullName,
      dob: kycForm.dob || '1995-01-01',
      country: kycForm.country,
      idType: kycForm.idType,
      idNumber: kycForm.idNumber,
      submittedAt: new Date().toISOString().split('T')[0]
    };
    setKycData(updated);
    upsertKycToDb(userEmail, updated);
    setKycMessage('Your KYC identity documents have been submitted successfully! Verification is currently in review.');
  };

  // Handle Withdrawal Request
  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid withdrawal amount.');
      return;
    }
    if (val > walletBalance) {
      alert(`Cannot withdraw more than available balance ($${walletBalance.toFixed(2)}).`);
      return;
    }
    if (!withdrawWallet) {
      alert('Please enter your destination wallet address.');
      return;
    }

    setWalletBalance(prev => prev - val);

    const withdrawTx: Transaction = {
      id: `TX-${Math.floor(80000 + Math.random() * 10000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'WITHDRAWAL',
      title: `Withdrawal to ${withdrawNetwork}`,
      amount: -val,
      status: 'COMPLETED',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
    };

    setTransactions([withdrawTx, ...transactions]);
    insertTransactionToDb(userEmail, withdrawTx);
    setWithdrawMessage(`Withdrawal request for $${val.toFixed(2)} USDT submitted! Transferred to ${withdrawWallet.substring(0, 8)}...`);
    setWithdrawAmount('');
    setWithdrawWallet('');
  };

  const navMenuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'packages', label: 'My Packages', icon: Package, badge: `${activePackagesCount}` },
    { id: 'buy', label: 'Packages Store', icon: Sparkles, badgeText: 'HOT', badgeColor: 'bg-primary text-primary-foreground' },
    { id: 'kyc', label: 'KYC Verification', icon: ShieldCheck, statusBadge: kycData.status },
    { id: 'withdraw', label: 'Withdrawal Portal', icon: ArrowUpRight },
    { id: 'transactions', label: 'Transactions History', icon: History }
  ];

  return (
    <div className="min-h-screen bg-[#070908] text-foreground font-sans selection:bg-primary selection:text-primary-foreground flex flex-col lg:flex-row relative overflow-x-hidden">
      {/* Glow Ambient Backdrop Orbs */}
      <div className="fixed top-0 left-1/4 w-[800px] h-[500px] bg-primary/10 blur-[180px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-1/4 w-[700px] h-[500px] bg-accent/5 blur-[200px] pointer-events-none rounded-full" />

      {/* MOBILE TOP BAR WITH MENU TOGGLE */}
      <div className="lg:hidden sticky top-0 z-40 border-b border-white/10 bg-[#090d0b]/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/20 text-primary border border-primary/40 font-bold">
            {userName.charAt(0)}
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">{userName}</h2>
            <span className="text-[10px] text-primary font-mono font-bold">$ {walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT</span>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-foreground"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-[#0a0f0d]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between p-5 transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Brand & User Profile Card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#131b17] to-[#0c110f] p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-primary/10 blur-xl pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl border border-primary/50 bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-black text-xl shadow-[0_0_20px_rgba(232,185,73,0.3)]">
                {userName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-foreground truncate">{userName}</h2>
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                </div>
                <p className="text-[11px] text-muted-foreground font-mono truncate">{userEmail}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[9px] text-accent font-bold uppercase">
                  <Zap size={9} className="fill-current" /> VIP QUANT TRADER
                </div>
              </div>
            </div>

            {/* Quick Wallet Balance Widget in Sidebar */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase">Available Balance</span>
                <span className="text-base font-black text-primary">
                  ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveTab('withdraw');
                  setSidebarOpen(false);
                }}
                className="rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-[10px] font-bold text-primary hover:bg-primary/20 transition-all flex items-center gap-1"
              >
                Withdraw <ArrowUpRight size={11} />
              </button>
            </div>
          </div>

          {/* SIDEBAR NAVIGATION ITEMS MENU */}
          <nav className="space-y-1.5 font-mono text-xs">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Dashboard Navigation
            </div>
            {navMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-3.5 font-bold transition-all relative overflow-hidden group ${
                    isActive
                      ? 'border border-primary/70 bg-gradient-to-r from-primary/25 via-primary/15 to-transparent text-primary shadow-[0_0_25px_rgba(232,185,73,0.2)]'
                      : 'border border-transparent hover:border-white/10 hover:bg-white/[0.03] text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
                    <span>{item.label}</span>
                  </div>

                  {/* Badges */}
                  {item.badge && (
                    <span className="rounded-full bg-primary/20 text-primary border border-primary/40 px-2.5 py-0.5 text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                  {item.badgeText && (
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${item.badgeColor}`}>
                      {item.badgeText}
                    </span>
                  )}
                  {item.statusBadge && (
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                      item.statusBadge === 'APPROVED' ? 'bg-accent/20 text-accent border border-accent/40' :
                      item.statusBadge === 'PENDING' ? 'bg-primary/20 text-primary border border-primary/40' :
                      'bg-destructive/20 text-destructive border border-destructive/40'
                    }`}>
                      {item.statusBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SIDEBAR FOOTER TELEMETRY CARD */}
        <div className="mt-6 pt-4 border-t border-white/10 font-mono text-[11px] space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-muted-foreground space-y-1.5">
            <div className="flex items-center justify-between text-foreground font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" /> Quantitative Engine
              </span>
              <span className="text-accent text-[10px]">99.99%</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Multi-Exchange High Frequency Arbitrage Cluster online.
            </p>
          </div>

          <button
            onClick={() => setLocation('/')}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-white/20 transition-all"
          >
            <LogOut size={14} /> Return to Homepage
          </button>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 lg:pl-8">
        
        {/* TOP CONTENT HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-primary font-bold">
              <span>NEXATRADES</span>
              <ChevronRight size={12} />
              <span className="capitalize">{activeTab.replace('_', ' ')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
              {activeTab === 'overview' && 'Dashboard Analytics & Overview'}
              {activeTab === 'packages' && 'My Active Subscription Packages'}
              {activeTab === 'buy' && 'Arbitrage Package Store'}
              {activeTab === 'kyc' && 'Identity & KYC Verification'}
              {activeTab === 'withdraw' && 'Instant Withdrawal Portal'}
              {activeTab === 'transactions' && 'Cryptographic Transaction Ledger'}
            </h1>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3 font-mono">
            <button
              onClick={() => {
                setSelectedPlanForBuy(AVAILABLE_PLANS[1]);
                setCustomInvestAmount(1000);
              }}
              className="rounded-xl bg-gradient-to-r from-primary via-[#f5c542] to-primary px-5 py-2.5 text-xs font-black uppercase text-primary-foreground shadow-[0_0_20px_rgba(232,185,73,0.3)] transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <Plus size={15} /> Buy Package
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className="rounded-xl border border-primary/50 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all flex items-center gap-1.5"
            >
              <ArrowUpRight size={15} /> Withdraw
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="mt-8 space-y-8">
            {/* Top 4 Metrics Cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#141b18] to-[#0c100e] p-6 backdrop-blur-xl shadow-xl relative overflow-hidden group">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-mono text-xs font-bold uppercase">Total Capital Invested</span>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <DollarSign size={18} />
                  </div>
                </div>
                <div className="mt-4 text-3xl font-black font-mono text-foreground tracking-tight">
                  ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-accent font-mono font-bold">
                  <TrendingUp size={13} /> Across {purchasedPackages.length} active trading plans
                </div>
              </div>

              <div className="rounded-3xl border border-primary/40 bg-gradient-to-b from-[#1c241f] to-[#0e1311] p-6 backdrop-blur-xl shadow-[0_0_35px_rgba(232,185,73,0.15)] relative overflow-hidden group">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-mono text-xs font-bold uppercase text-primary">Total Earned ROI</span>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/20 text-primary border border-primary/40">
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div className="mt-4 text-3xl font-black font-mono text-primary tracking-tight">
                  ${totalEarnedRoi.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-accent font-mono font-bold">
                  <CheckCircle2 size={13} /> Direct credited to balance
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#141b18] to-[#0c100e] p-6 backdrop-blur-xl shadow-xl relative overflow-hidden group">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-mono text-xs font-bold uppercase">Remaining Pending ROI</span>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-muted-foreground border border-white/10">
                    <Clock size={18} />
                  </div>
                </div>
                <div className="mt-4 text-3xl font-black font-mono text-foreground tracking-tight">
                  ${totalRemainingRoi.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground font-mono">
                  Future payout cap from active plans
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#141b18] to-[#0c100e] p-6 backdrop-blur-xl shadow-xl relative overflow-hidden group">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-mono text-xs font-bold uppercase">KYC Verification</span>
                  <div className={`grid h-9 w-9 place-items-center rounded-xl border ${
                    kycData.status === 'APPROVED' ? 'bg-accent/10 text-accent border-accent/30' : 'bg-primary/10 text-primary border-primary/30'
                  }`}>
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <div className="mt-4 text-2xl font-black font-mono text-foreground tracking-tight uppercase flex items-center gap-2">
                  {kycData.status}
                </div>
                <button
                  onClick={() => setActiveTab('kyc')}
                  className="mt-2 text-[11px] text-primary hover:underline font-mono font-bold flex items-center gap-1"
                >
                  View Verification Details <ChevronRight size={12} />
                </button>
              </div>
            </div>

            {/* Middle Section: ROI Yield Graph & Active Packages Overview */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Yield Growth Chart */}
              <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#0f1412]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                      <Sparkles size={18} className="text-primary" /> Live Daily Arbitrage Yield Growth
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      Automated yield accrual curves from active quantitative trading clusters.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-xs text-accent font-bold">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" /> Live Streaming
                  </span>
                </div>

                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={YIELD_GRAPH_DATA}>
                      <defs>
                        <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e8b949" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#e8b949" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="day" stroke="#a1a1aa" fontSize={11} fontFamily="monospace" />
                      <YAxis stroke="#a1a1aa" fontSize={11} fontFamily="monospace" tickFormatter={(val) => `$${val}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#141c18', borderColor: '#e8b94940', borderRadius: '12px', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
                        formatter={(val: any) => [`$${val}.00`, 'Earned ROI']}
                      />
                      <Area type="monotone" dataKey="yield" stroke="#e8b949" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Active Packages Side List */}
              <div className="rounded-3xl border border-white/10 bg-[#0f1412]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h3 className="font-bold text-base text-foreground font-mono flex items-center gap-2">
                      <Package size={16} className="text-primary" /> Active Plans ({activePackagesCount})
                    </h3>
                    <button
                      onClick={() => setActiveTab('packages')}
                      className="text-xs text-primary hover:underline font-mono font-bold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="mt-5 space-y-4">
                    {purchasedPackages.map(pkg => {
                      const pct = Math.min(100, Math.round((pkg.earnedRoi / pkg.totalRoiCap) * 100));
                      return (
                        <div key={pkg.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-mono">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground text-sm">{pkg.name} Plan</span>
                            <span className="text-xs font-bold text-primary">${pkg.amount.toLocaleString()}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Daily: <strong className="text-accent">+{pkg.dailyRoi}%</strong></span>
                            <span>Earned: <strong className="text-primary">${pkg.earnedRoi.toFixed(2)}</strong></span>
                          </div>
                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                              <span>ROI Cap Progress</span>
                              <span>{pct}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('buy')}
                  className="mt-6 w-full rounded-xl border border-primary/50 bg-primary/10 py-3 font-mono text-xs font-bold text-primary hover:bg-primary/20 transition-all text-center"
                >
                  + Add Another Arbitrage Package
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY PACKAGES */}
        {activeTab === 'packages' && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight font-mono">
                  My Active Subscription Packages
                </h2>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Individual tracking for all your purchased Quantitative Arbitrage plans.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('buy')}
                className="rounded-xl bg-primary px-5 py-2.5 font-mono text-xs font-bold text-primary-foreground hover:bg-[#f3cc68] transition-all flex items-center gap-1.5 self-start"
              >
                <Plus size={15} /> Buy New Package
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {purchasedPackages.map(pkg => {
                const progressPct = Math.min(100, Math.round((pkg.earnedRoi / pkg.totalRoiCap) * 100));
                return (
                  <div
                    key={pkg.id}
                    className="group relative rounded-3xl border border-white/15 bg-gradient-to-b from-[#141d19] via-[#0f1513] to-[#090d0b] p-7 backdrop-blur-2xl shadow-2xl flex flex-col justify-between hover:border-primary/60 transition-all duration-300"
                  >
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    <div>
                      <div className="flex items-start justify-between border-b border-white/10 pb-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">{pkg.id}</span>
                          <h3 className="text-2xl font-black text-foreground font-mono">{pkg.name} Plan</h3>
                        </div>
                        <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10px] font-bold text-accent uppercase">
                          ● {pkg.status}
                        </span>
                      </div>

                      <div className="mt-6 space-y-3 font-mono text-xs">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-muted-foreground">Investment Capital</span>
                          <strong className="text-foreground text-sm">${pkg.amount.toLocaleString()}.00</strong>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-muted-foreground">Daily ROI Rate</span>
                          <strong className="text-accent text-sm">+{pkg.dailyRoi}% / Day</strong>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-muted-foreground">Total Earned ROI</span>
                          <strong className="text-primary text-sm">${pkg.earnedRoi.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-muted-foreground">Remaining ROI Cap</span>
                          <strong className="text-foreground">${pkg.remainingRoi.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-muted-foreground">Purchase Date</span>
                          <span className="text-foreground">{pkg.purchaseDate}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-6">
                        <div className="flex justify-between text-xs font-mono text-muted-foreground mb-1.5">
                          <span>Total Yield Progress</span>
                          <span className="font-bold text-primary">{progressPct}%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary via-[#f5c542] to-accent transition-all duration-700"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                      <button
                        onClick={() => {
                          const planMatch = AVAILABLE_PLANS.find(p => p.name === pkg.name);
                          if (planMatch) {
                            setSelectedPlanForBuy(planMatch);
                            setCustomInvestAmount(pkg.amount);
                          }
                        }}
                        className="w-full rounded-xl border border-primary/50 bg-primary/10 py-3 font-mono text-xs font-bold text-primary hover:bg-primary/20 transition-all text-center"
                      >
                        Top-Up Plan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: BUY PACKAGE (STORE) */}
        {activeTab === 'buy' && (
          <div className="mt-8 space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-black text-foreground tracking-tight font-mono">
                Select Your Arbitrage Package
              </h2>
              <p className="mt-2 text-sm text-muted-foreground font-mono">
                Activate high-yield quantitative AI trading strategies with automated daily ROI payouts directly to your wallet.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 items-stretch">
              {AVAILABLE_PLANS.map(plan => (
                <div
                  key={plan.name}
                  className={`group relative rounded-3xl border p-6 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 ${
                    plan.supreme
                      ? 'border-2 border-primary bg-gradient-to-b from-[#1c241f] via-[#121815] to-[#0c100e] shadow-[0_0_40px_rgba(232,185,73,0.3)]'
                      : plan.popular
                      ? 'border-2 border-primary/80 bg-gradient-to-b from-[#18201b] via-[#111613] to-[#0a0e0c] shadow-[0_0_30px_rgba(232,185,73,0.2)]'
                      : 'border-white/12 bg-gradient-to-b from-[#141c18]/90 via-[#0f1412]/85 to-[#090c0b]/95 hover:border-primary/50'
                  }`}
                >
                  <div>
                    {/* Badge */}
                    {plan.badgeText && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-primary/60 bg-primary px-3 py-0.5 font-mono text-[9px] font-black uppercase text-primary-foreground shadow-md whitespace-nowrap">
                        {plan.badgeText}
                      </span>
                    )}

                    {/* Plan Header & Big Price */}
                    <div className="pb-4">
                      <span className="text-[11px] font-black tracking-widest font-mono uppercase text-muted-foreground block">
                        {plan.name}
                      </span>
                      <div className="mt-2 text-4xl font-black text-foreground font-mono tracking-tight">
                        {plan.price}
                      </div>
                    </div>

                    {/* Gold Total ROI Box */}
                    <div className="rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 p-3 text-center my-3">
                      <span className="text-[10px] uppercase text-muted-foreground font-mono font-bold block">Total ROI</span>
                      <span className="text-xl font-black text-primary font-mono">{plan.totalRoi}</span>
                    </div>

                    {/* Plan Metrics List */}
                    <div className="space-y-2.5 font-mono text-xs my-4">
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-muted-foreground">Total Return</span>
                        <strong className="text-foreground">{plan.totalReturn}</strong>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="text-foreground">{plan.duration}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-muted-foreground">Daily ROI</span>
                        <strong className="text-primary">{plan.dailyRoi}</strong>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-muted-foreground">Max Slots</span>
                        <span className="text-accent text-[11px]">{plan.slots}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPlanForBuy(plan);
                      setCustomInvestAmount(plan.min);
                    }}
                    className={`mt-4 w-full rounded-xl py-3.5 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      plan.supreme || plan.popular
                        ? 'bg-gradient-to-r from-primary via-[#f5c542] to-primary text-primary-foreground shadow-[0_0_25px_rgba(232,185,73,0.4)] hover:scale-[1.02]'
                        : 'border border-primary/50 bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    Choose Plan <ArrowUpRight size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: KYC VERIFICATION */}
        {activeTab === 'kyc' && (
          <div className="mt-8 max-w-4xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight font-mono">
                KYC Identity Verification Portal
              </h2>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                Required for unhindered withdrawals and institutional compliance under NexaTrades security governance.
              </p>
            </div>

            {/* Status Card */}
            <div className="rounded-3xl border border-white/10 bg-[#0f1412] p-6 sm:p-8 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`grid h-14 w-14 place-items-center rounded-2xl border ${
                  kycData.status === 'APPROVED' ? 'border-accent/40 bg-accent/15 text-accent' :
                  kycData.status === 'PENDING' ? 'border-primary/40 bg-primary/15 text-primary' :
                  'border-white/20 bg-white/5 text-muted-foreground'
                }`}>
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-mono">Current Verification Status</div>
                  <div className="text-2xl font-black font-mono text-foreground tracking-tight flex items-center gap-2 mt-0.5">
                    {kycData.status === 'APPROVED' && <span className="text-accent">✓ Verified Account</span>}
                    {kycData.status === 'PENDING' && <span className="text-primary">⏳ Pending Review</span>}
                    {kycData.status === 'UNVERIFIED' && <span className="text-muted-foreground">⚠️ Not Submitted</span>}
                  </div>
                </div>
              </div>

              {kycData.submittedAt && (
                <div className="text-xs font-mono text-muted-foreground">
                  Submitted On: <strong className="text-foreground">{kycData.submittedAt}</strong>
                </div>
              )}
            </div>

            {kycMessage && (
              <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-xs font-mono text-accent flex items-center gap-2">
                <CheckCircle2 size={16} /> {kycMessage}
              </div>
            )}

            {/* KYC Submission Form */}
            <form onSubmit={handleKycSubmit} className="rounded-3xl border border-white/10 bg-[#0f1412] p-6 sm:p-8 space-y-6 font-mono text-xs">
              <h3 className="text-lg font-bold text-foreground border-b border-white/10 pb-3 flex items-center gap-2">
                <UserCheck size={18} className="text-primary" /> Identity Information & Document Upload
              </h3>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-muted-foreground mb-2">Full Legal Name (as on ID)</label>
                  <input
                    type="text"
                    required
                    value={kycForm.fullName || kycData.fullName}
                    onChange={e => setKycForm({ ...kycForm, fullName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-2">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={kycForm.dob || kycData.dob}
                    onChange={e => setKycForm({ ...kycForm, dob: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-2">Country of Residence</label>
                  <select
                    value={kycForm.country || kycData.country}
                    onChange={e => setKycForm({ ...kycForm, country: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-[#121815] px-4 py-3 text-foreground outline-none focus:border-primary"
                  >
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Germany">Germany</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-2">Identification Document Type</label>
                  <select
                    value={kycForm.idType || kycData.idType}
                    onChange={e => setKycForm({ ...kycForm, idType: e.target.value as any })}
                    className="w-full rounded-xl border border-white/15 bg-[#121815] px-4 py-3 text-foreground outline-none focus:border-primary"
                  >
                    <option value="PASSPORT">Passport</option>
                    <option value="NATIONAL_ID">National Identity Card</option>
                    <option value="DRIVERS_LICENSE">Driver's License</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-muted-foreground mb-2">Document Serial / Identification Number</label>
                  <input
                    type="text"
                    required
                    value={kycForm.idNumber || kycData.idNumber}
                    onChange={e => setKycForm({ ...kycForm, idNumber: e.target.value })}
                    placeholder="e.g. N984102948"
                    className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-muted-foreground mb-2">Upload Front & Back Copy of Document (PNG, JPG, PDF)</label>
                <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] p-8 text-center hover:border-primary/50 transition-all cursor-pointer">
                  <UploadCloud size={36} className="mx-auto text-primary mb-2" />
                  <p className="text-sm font-bold text-foreground">Click to upload document photo or drag & drop</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Maximum file size: 10MB (Clear scan required)</p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-primary via-[#f5c542] to-primary py-4 font-mono text-xs font-black uppercase text-primary-foreground shadow-[0_0_25px_rgba(232,185,73,0.35)] transition-all hover:scale-[1.01]"
              >
                Submit Identity Verification Request
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: WITHDRAWAL */}
        {activeTab === 'withdraw' && (
          <div className="mt-8 max-w-3xl mx-auto space-y-8 font-mono">
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                Instant Withdrawal Portal
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Transfer your earned trading profit and capital directly to your external crypto wallet.
              </p>
            </div>

            {withdrawMessage && (
              <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-xs text-accent flex items-center gap-2">
                <CheckCircle2 size={16} /> {withdrawMessage}
              </div>
            )}

            <div className="rounded-3xl border border-white/10 bg-[#0f1412] p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6">
              {/* Balance Box */}
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Available Withdrawable Balance</span>
                  <div className="text-3xl font-black text-primary tracking-tight mt-1">
                    ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
                  </div>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/20 text-primary">
                  <Wallet size={24} />
                </div>
              </div>

              <form onSubmit={handleWithdrawalSubmit} className="space-y-5 text-xs">
                <div>
                  <label className="block text-muted-foreground mb-2">Select Withdrawal Network</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'USDT_BEP20', label: 'USDT (BEP20)', fee: '$1.00 Fee' },
                      { id: 'USDT_TRC20', label: 'USDT (TRC20)', fee: '$1.50 Fee' },
                      { id: 'BTC', label: 'Bitcoin (BTC)', fee: '$3.00 Fee' }
                    ].map(net => (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => setWithdrawNetwork(net.id as any)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          withdrawNetwork === net.id
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-white/10 bg-white/[0.02] text-muted-foreground'
                        }`}
                      >
                        <strong className="block text-foreground">{net.label}</strong>
                        <span className="text-[10px] text-muted-foreground">{net.fee}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-2">Withdrawal Amount ($ USD)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={50}
                      max={walletBalance}
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/[0.03] pl-4 pr-16 py-3.5 text-foreground text-sm font-bold outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(walletBalance.toString())}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary font-bold hover:underline"
                    >
                      MAX
                    </button>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1 block">Minimum withdrawal: $50.00 USDT</span>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-2">Destination Wallet Address</label>
                  <input
                    type="text"
                    required
                    value={withdrawWallet}
                    onChange={e => setWithdrawWallet(e.target.value)}
                    placeholder="Enter your USDT BEP20 wallet address..."
                    className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3.5 text-foreground text-xs outline-none focus:border-primary"
                  />
                </div>

                {/* Calculation Summary */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Requested Amount:</span>
                    <span className="text-foreground">${parseFloat(withdrawAmount || '0').toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Network Gas Fee:</span>
                    <span className="text-foreground">$1.00 USDT</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-foreground">
                    <span>Net Amount to Receive:</span>
                    <span className="text-primary text-sm">${Math.max(0, parseFloat(withdrawAmount || '0') - 1).toFixed(2)} USDT</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-primary via-[#f5c542] to-primary py-4 text-xs font-black uppercase text-primary-foreground shadow-[0_0_25px_rgba(232,185,73,0.35)] hover:scale-[1.01] transition-all"
                >
                  Submit Instant Withdrawal Request
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: TRANSACTIONS LEDGER */}
        {activeTab === 'transactions' && (
          <div className="mt-8 space-y-6 font-mono text-xs">
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight font-sans">
                Complete Transaction Ledger
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time cryptographic execution logs for deposits, package purchases, daily ROI payouts, and withdrawals.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0f1412] p-6 backdrop-blur-2xl shadow-xl overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-muted-foreground text-[11px] uppercase">
                    <th className="pb-3 px-4">Tx ID</th>
                    <th className="pb-3 px-4">Date & Time</th>
                    <th className="pb-3 px-4">Type</th>
                    <th className="pb-3 px-4">Description</th>
                    <th className="pb-3 px-4">Amount</th>
                    <th className="pb-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-white/[0.02]">
                      <td className="py-4 px-4 font-bold text-primary">{tx.id}</td>
                      <td className="py-4 px-4 text-muted-foreground">{tx.date}</td>
                      <td className="py-4 px-4">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                          tx.type === 'DAILY_ROI' ? 'bg-accent/15 text-accent border border-accent/30' :
                          tx.type === 'DEPOSIT' ? 'bg-primary/15 text-primary border border-primary/30' :
                          tx.type === 'PACKAGE_PURCHASE' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                          'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-foreground font-bold">{tx.title}</td>
                      <td className={`py-4 px-4 font-bold text-sm ${tx.amount > 0 ? 'text-accent' : 'text-foreground'}`}>
                        {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 text-accent font-bold">
                          ✓ {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* BUY PACKAGE CONFIRMATION MODAL */}
      {selectedPlanForBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-primary/50 bg-[#0d1210] p-6 sm:p-8 shadow-[0_0_50px_rgba(232,185,73,0.3)] font-mono text-xs relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase text-primary font-bold">PACKAGE ACTIVATION</span>
                <h3 className="text-xl font-black text-foreground font-mono">{selectedPlanForBuy.name} Arbitrage Plan</h3>
              </div>
              <button
                onClick={() => setSelectedPlanForBuy(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {buySuccessMessage ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 size={42} className="mx-auto text-accent animate-bounce" />
                <h4 className="text-lg font-bold text-foreground">Plan Activated!</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{buySuccessMessage}</p>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-muted-foreground mb-2">
                    Enter Investment Amount (${selectedPlanForBuy.min.toLocaleString()} – ${selectedPlanForBuy.max.toLocaleString()})
                  </label>
                  <input
                    type="number"
                    min={selectedPlanForBuy.min}
                    max={selectedPlanForBuy.max}
                    value={customInvestAmount}
                    onChange={e => setCustomInvestAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-primary/40 bg-white/[0.04] px-4 py-3.5 text-foreground text-base font-bold outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-2">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('WALLET')}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        paymentMethod === 'WALLET'
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-white/10 bg-white/[0.02] text-muted-foreground'
                      }`}
                    >
                      <strong className="block text-foreground">Wallet Balance</strong>
                      <span className="text-[10px] text-muted-foreground">${walletBalance.toFixed(2)} Available</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('USDT_BEP20')}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        paymentMethod === 'USDT_BEP20'
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-white/10 bg-white/[0.02] text-muted-foreground'
                      }`}
                    >
                      <strong className="block text-foreground">USDT BEP20</strong>
                      <span className="text-[10px] text-muted-foreground">External Wallet Deposit</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Daily ROI Payout:</span>
                    <strong className="text-accent">+{selectedPlanForBuy.dailyRoi} (${(customInvestAmount * (selectedPlanForBuy.dailyRoiNum / 100)).toFixed(2)}/day)</strong>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total ROI Return Cap:</span>
                    <strong className="text-primary">${(customInvestAmount * (selectedPlanForBuy.totalCapPct / 100)).toFixed(2)} ({selectedPlanForBuy.totalCapPct}%)</strong>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForBuy(null)}
                    className="w-1/2 rounded-xl border border-white/20 bg-white/5 py-3 font-bold text-muted-foreground hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPurchase}
                    className="w-1/2 rounded-xl bg-gradient-to-r from-primary via-[#f5c542] to-primary py-3 font-black uppercase text-primary-foreground shadow-[0_0_20px_rgba(232,185,73,0.4)] hover:scale-[1.02]"
                  >
                    Confirm & Activate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
