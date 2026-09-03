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
  ChevronDown,
  Camera,
  Users,
  Share2,
  UserPlus,
  Search,
  Network,
  Calendar
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
  fetchUserProfileFromDb,
  fetchDirectReferralsFromDb,
  fetchFullTeamHierarchyFromDb
} from '@/lib/supabase';
import { verifyBep20Transaction, DEFAULT_DEPOSIT_WALLET } from '@/lib/bep20';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'packages' | 'buy' | 'team' | 'kyc' | 'withdraw' | 'transactions'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 1. Core User Info States
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('nexa_user_name') || '');
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem('nexa_user_email') || '');
  const isDemo = userEmail.toLowerCase() === 'alex.vance@nexatraders.com';

  // 2. Financial & Data States
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const email = localStorage.getItem('nexa_user_email') || '';
      const saved = email ? localStorage.getItem(`nexa_balance_${email}`) : null;
      if (saved !== null) {
        const val = parseFloat(saved);
        if (!isNaN(val)) return val;
      }
    } catch (e) {}
    return isDemo ? 4680.00 : 0.00;
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    try {
      const email = localStorage.getItem('nexa_user_email') || '';
      return email ? localStorage.getItem(`nexa_avatar_${email}`) || null : null;
    } catch (e) {}
    return null;
  });

  const [purchasedPackages, setPurchasedPackages] = useState<PurchasedPackage[]>(() => {
    try {
      const email = localStorage.getItem('nexa_user_email') || '';
      const saved = email ? localStorage.getItem(`nexa_packages_${email}`) : null;
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return isDemo ? DEFAULT_PACKAGES : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const email = localStorage.getItem('nexa_user_email') || '';
      const saved = email ? localStorage.getItem(`nexa_tx_${email}`) : null;
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return isDemo ? INITIAL_TRANSACTIONS : [];
  });

  const [kycData, setKycData] = useState<KycData>(() => {
    try {
      const email = localStorage.getItem('nexa_user_email') || '';
      const saved = email ? localStorage.getItem(`nexa_kyc_${email}`) : null;
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
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

  // 3. Referral & Team States
  const [userRefCode, setUserRefCode] = useState<string>(() => {
    try {
      const email = localStorage.getItem('nexa_user_email') || '';
      return email ? localStorage.getItem(`nexa_ref_code_${email}`) || '' : '';
    } catch (e) {}
    return '';
  });
  const [directTeam, setDirectTeam] = useState<any[]>([]);
  const [teamHierarchy, setTeamHierarchy] = useState<any[]>([]);
  const [teamLoading, setTeamLoading] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [teamTabFilter, setTeamTabFilter] = useState<'all' | 'direct' | 'network'>('all');

  // Member Package Detail Modal State
  const [selectedTeamMemberModal, setSelectedTeamMemberModal] = useState<any | null>(null);
  const [memberPackagesList, setMemberPackagesList] = useState<any[]>([]);
  const [loadingMemberPackages, setLoadingMemberPackages] = useState<boolean>(false);

  const handleOpenMemberPackages = async (memberUser: any) => {
    setSelectedTeamMemberModal(memberUser);
    setLoadingMemberPackages(true);
    try {
      const fetchedPkgs = await fetchUserPackagesFromDb(memberUser.email);
      if (fetchedPkgs && fetchedPkgs.length > 0) {
        setMemberPackagesList(fetchedPkgs);
      } else if (memberUser.packages && memberUser.packages.length > 0) {
        setMemberPackagesList(memberUser.packages);
      } else if (Number(memberUser.package_investment || memberUser.wallet_balance) > 0) {
        const inv = Number(memberUser.package_investment || memberUser.wallet_balance);
        setMemberPackagesList([{
          id: `PKG-${Math.floor(1000 + Math.random() * 9000)}`,
          name: 'Starter Trader Package',
          amount: inv,
          dailyRoi: 2.0,
          totalRoiCap: inv * 3,
          earnedRoi: 0,
          remainingRoi: inv * 3,
          purchaseDate: memberUser.created_at ? memberUser.created_at.substring(0, 10) : new Date().toISOString().substring(0, 10),
          expiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().substring(0, 10),
          status: 'ACTIVE'
        }]);
      } else {
        setMemberPackagesList([]);
      }
    } catch (err) {
      setMemberPackagesList(memberUser.packages || []);
    } finally {
      setLoadingMemberPackages(false);
    }
  };

  // 4. Authentication Check
  useEffect(() => {
    setIsMounted(true);
    const email = localStorage.getItem('nexa_user_email');
    if (!email) {
      setLocation('/login');
    }
  }, [setLocation]);

  // 5. Load Referral & Team Database Telemetry
  useEffect(() => {
    if (!userEmail) return;
    const loadReferralTeamData = async () => {
      setTeamLoading(true);
      try {
        const profile = await fetchUserProfileFromDb(userEmail);
        let refCode = profile?.referral_code || userRefCode;
        if (!refCode) {
          const synced = await syncUserProfile(userEmail, userName || userEmail.split('@')[0], walletBalance);
          if (synced?.referral_code) refCode = synced.referral_code;
        }
        if (refCode) {
          setUserRefCode(refCode);
          try { localStorage.setItem(`nexa_ref_code_${userEmail}`, refCode); } catch (e) {}
        }

        // Fetch Direct Referrals (Level 1)
        const directs = await fetchDirectReferralsFromDb(userEmail, refCode);
        setDirectTeam(directs);

        // Fetch Full Team Hierarchy (Multi-Level Network)
        const hierarchy = await fetchFullTeamHierarchyFromDb(userEmail, refCode);
        setTeamHierarchy(hierarchy);
      } catch (err) {
        console.error('Error loading team telemetry:', err);
      } finally {
        setTeamLoading(false);
      }
    };

    loadReferralTeamData();
  }, [userEmail, userName, walletBalance]);

  const handleLogout = () => {
    localStorage.removeItem('nexa_auth_user');
    localStorage.removeItem('nexa_user_name');
    localStorage.removeItem('nexa_user_email');
    setAvatarUrl(null);
    setWalletBalance(0);
    setPurchasedPackages([]);
    setTransactions([]);
    setKycData({
      status: 'UNVERIFIED',
      fullName: '',
      dob: '',
      country: 'United Arab Emirates',
      idType: 'PASSPORT',
      idNumber: '',
    });
    setLocation('/login');
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAvatarUrl(base64);
      if (userEmail) {
        try {
          localStorage.setItem(`nexa_avatar_${userEmail}`, base64);
        } catch (err) {}
        await syncUserProfile(userEmail, userName, walletBalance, base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // On mount or user switch, load user-specific cached data and sync from live Supabase DB
  useEffect(() => {
    if (!userEmail) return;

    const email = userEmail.toLowerCase();
    const isDemoAccount = email === 'alex.vance@nexatraders.com';

    // Hydrate avatar
    const cachedAvatar = localStorage.getItem(`nexa_avatar_${email}`);
    setAvatarUrl(cachedAvatar || null);

    // Hydrate balance
    const cachedBal = localStorage.getItem(`nexa_balance_${email}`);
    if (cachedBal !== null) {
      const parsed = parseFloat(cachedBal);
      if (!isNaN(parsed)) setWalletBalance(parsed);
    } else {
      setWalletBalance(isDemoAccount ? 4680.00 : 0.00);
    }

    // Hydrate packages
    const cachedPkgs = localStorage.getItem(`nexa_packages_${email}`);
    if (cachedPkgs !== null) {
      try { setPurchasedPackages(JSON.parse(cachedPkgs)); } catch (e) {}
    } else {
      setPurchasedPackages(isDemoAccount ? DEFAULT_PACKAGES : []);
    }

    // Hydrate transactions
    const cachedTx = localStorage.getItem(`nexa_tx_${email}`);
    if (cachedTx !== null) {
      try { setTransactions(JSON.parse(cachedTx)); } catch (e) {}
    } else {
      setTransactions(isDemoAccount ? INITIAL_TRANSACTIONS : []);
    }

    // Hydrate kyc
    const cachedKyc = localStorage.getItem(`nexa_kyc_${email}`);
    if (cachedKyc !== null) {
      try { setKycData(JSON.parse(cachedKyc)); } catch (e) {}
    } else {
      setKycData(isDemoAccount ? {
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
      });
    }

    // Fetch Live Data from Supabase DB
    fetchUserProfileFromDb(email).then(profile => {
      if (profile) {
        if (profile.full_name) setUserName(profile.full_name);
        if (profile.wallet_balance !== undefined) {
          const bal = Number(profile.wallet_balance);
          if (!isNaN(bal)) {
            setWalletBalance(bal);
            localStorage.setItem(`nexa_balance_${email}`, bal.toString());
          }
        }
        if (profile.avatar_url) {
          setAvatarUrl(profile.avatar_url);
          localStorage.setItem(`nexa_avatar_${email}`, profile.avatar_url);
        } else {
          setAvatarUrl(null);
          localStorage.removeItem(`nexa_avatar_${email}`);
        }
      }
    }).catch(() => {});

    fetchUserPackagesFromDb(email).then(pkgs => {
      if (Array.isArray(pkgs) && pkgs.length > 0) {
        setPurchasedPackages(pkgs);
        localStorage.setItem(`nexa_packages_${email}`, JSON.stringify(pkgs));
      }
    }).catch(() => {});

    fetchTransactionsFromDb(email).then(txs => {
      if (Array.isArray(txs) && txs.length > 0) {
        setTransactions(txs);
        localStorage.setItem(`nexa_tx_${email}`, JSON.stringify(txs));
      }
    }).catch(() => {});

    fetchKycFromDb(email).then(kyc => {
      if (kyc && typeof kyc === 'object') {
        setKycData(kyc as any);
        localStorage.setItem(`nexa_kyc_${email}`, JSON.stringify(kyc));
      }
    }).catch(() => {});
  }, [userEmail]);

  // Save to user-scoped localStorage & sync to Supabase Database
  useEffect(() => {
    if (walletBalance === undefined || walletBalance === null || !userEmail) return;
    try {
      localStorage.setItem(`nexa_balance_${userEmail.toLowerCase()}`, walletBalance.toString());
    } catch (e) {}
    syncUserProfile(userEmail, userName, walletBalance, avatarUrl || undefined);
  }, [walletBalance, userEmail, userName, avatarUrl]);

  useEffect(() => {
    if (!userEmail) return;
    try {
      localStorage.setItem(`nexa_packages_${userEmail.toLowerCase()}`, JSON.stringify(purchasedPackages || []));
    } catch (e) {}
  }, [purchasedPackages, userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    try {
      localStorage.setItem(`nexa_tx_${userEmail.toLowerCase()}`, JSON.stringify(transactions || []));
    } catch (e) {}
  }, [transactions, userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    try {
      localStorage.setItem(`nexa_kyc_${userEmail.toLowerCase()}`, JSON.stringify(kycData || {}));
    } catch (e) {}
  }, [kycData, userEmail]);

  // Aggregate Metrics
  const pkgsList = Array.isArray(purchasedPackages) ? purchasedPackages : [];
  const totalInvested = pkgsList.reduce((acc, p) => acc + (p?.amount || 0), 0);
  const totalEarnedRoi = pkgsList.reduce((acc, p) => acc + (p?.earnedRoi || 0), 0);
  const totalRemainingRoi = pkgsList.reduce((acc, p) => acc + (p?.remainingRoi || 0), 0);
  const activePackagesCount = pkgsList.filter(p => p && p.status === 'ACTIVE').length;

  // Package Store & Modal State
  const [selectedPlanForBuy, setSelectedPlanForBuy] = useState<any | null>(null);
  const [customInvestAmount, setCustomInvestAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'BEP20_USDT'>('BEP20_USDT');
  const [buySuccessMessage, setBuySuccessMessage] = useState<string>('');

  // KYC Form State
  const [kycForm, setKycForm] = useState({
    fullName: '',
    dob: '',
    country: 'United Arab Emirates',
    idType: 'PASSPORT' as 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE',
    idNumber: ''
  });
  const [kycMessage, setKycMessage] = useState<string>('');

  // Dedicated Deposit Portal State
  const [depositTxHash, setDepositTxHash] = useState<string>('');
  const [depositAmountInput, setDepositAmountInput] = useState<string>('100');
  const [isVerifyingDeposit, setIsVerifyingDeposit] = useState<boolean>(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string>('');
  const [depositErrorMsg, setDepositErrorMsg] = useState<string>('');
  const [copiedDepositAddr, setCopiedDepositAddr] = useState<boolean>(false);

  // Dedicated Deposit Handler with Strict BscScan On-Chain Validation
  const handleProcessDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositErrorMsg('');
    setDepositSuccessMsg('');

    const cleanTxHash = depositTxHash.trim();
    if (!cleanTxHash) {
      setDepositErrorMsg('BEP20 Transaction Hash (TxHash) is REQUIRED. Please paste your 66-character transaction hash (0x...) from your wallet.');
      return;
    }

    if (!cleanTxHash.startsWith('0x') || cleanTxHash.length !== 66) {
      setDepositErrorMsg('Invalid BEP20 TxHash format. Must start with 0x and be exactly 66 characters long.');
      return;
    }

    // Check duplicate TxHash reuse
    const alreadyProcessed = (transactions || []).some(t => t.txHash && t.txHash.toLowerCase() === cleanTxHash.toLowerCase());
    if (alreadyProcessed) {
      setDepositErrorMsg('This TxHash has ALREADY been claimed and credited to an account. Duplicate claims are prohibited.');
      return;
    }

    setIsVerifyingDeposit(true);

    const verRes = await verifyBep20Transaction(cleanTxHash, DEFAULT_DEPOSIT_WALLET);
    setIsVerifyingDeposit(false);

    if (!verRes.success) {
      setDepositErrorMsg(verRes.message || 'On-chain verification failed. Please verify your transaction hash on BscScan.');
      return;
    }

    // Use actual on-chain verified amount sent via BEP20
    const verifiedAmount = verRes.amountUsdt && verRes.amountUsdt > 0 
      ? verRes.amountUsdt 
      : parseFloat(depositAmountInput) || 0;

    if (verifiedAmount <= 0) {
      setDepositErrorMsg('Could not verify on-chain USDT transfer value. Transaction amount is 0 USDT.');
      return;
    }

    const newBal = (walletBalance || 0) + verifiedAmount;
    setWalletBalance(newBal);
    syncUserProfile(userEmail, userName, newBal);

    const depTx: Transaction = {
      id: `TX-${Math.floor(80000 + Math.random() * 10000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'DEPOSIT',
      title: 'BEP20 USDT Verified On-Chain Deposit',
      amount: verifiedAmount,
      status: 'COMPLETED',
      txHash: cleanTxHash
    };

    setTransactions(prev => [depTx, ...(prev || [])]);
    insertTransactionToDb(userEmail, depTx);

    setDepositSuccessMsg(`Verified on BNB Smart Chain! Credited $${verifiedAmount.toFixed(2)} USDT to your account. Total Available Balance: $${newBal.toFixed(2)} USDT.`);
    setDepositTxHash('');
  };

  // BEP20 Auto-Verification State
  const [bep20TxHash, setBep20TxHash] = useState<string>('');
  const [isVerifyingBep20, setIsVerifyingBep20] = useState<boolean>(false);
  const [bep20VerifyError, setBep20VerifyError] = useState<string>('');
  const [bep20VerifySuccess, setBep20VerifySuccess] = useState<string>('');

  const handleVerifyBep20Payment = async () => {
    if (!bep20TxHash.trim()) {
      setBep20VerifyError('Please enter your 66-character BEP20 TxHash (0x...) from your wallet app.');
      return;
    }

    setIsVerifyingBep20(true);
    setBep20VerifyError('');
    setBep20VerifySuccess('');

    const res = await verifyBep20Transaction(bep20TxHash, DEFAULT_DEPOSIT_WALLET);
    setIsVerifyingBep20(false);

    if (res.success) {
      setBep20VerifySuccess(res.message);
      
      const amount = res.amountUsdt && res.amountUsdt > 0 ? res.amountUsdt : Number(customInvestAmount);
      const totalCap = amount * ((selectedPlanForBuy?.totalCapPct || 200) / 100);

      const newPkg: PurchasedPackage = {
        id: `PKG-${Math.floor(1000 + Math.random() * 9000)}`,
        name: selectedPlanForBuy?.name || 'Rise',
        amount: amount,
        dailyRoi: selectedPlanForBuy?.dailyRoiNum || 1.3,
        totalRoiCap: totalCap,
        earnedRoi: 0,
        remainingRoi: totalCap,
        purchaseDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'ACTIVE'
      };

      setPurchasedPackages(prev => [newPkg, ...prev]);
      insertPackageToDb(userEmail, newPkg);

      const newTx: Transaction = {
        id: `TX-${Math.floor(80000 + Math.random() * 10000)}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'DEPOSIT',
        title: `BEP20 Auto-Deposit (${selectedPlanForBuy?.name || 'Package'})`,
        amount: amount,
        status: 'COMPLETED',
        txHash: bep20TxHash
      };
      setTransactions(prev => [newTx, ...prev]);
      insertTransactionToDb(userEmail, newTx);

      setBuySuccessMessage(`Verified Live on BNB Smart Chain! Activated ${selectedPlanForBuy?.name} plan with ${amount} USDT.`);
      setTimeout(() => {
        setSelectedPlanForBuy(null);
        setBuySuccessMessage('');
        setBep20TxHash('');
        setBep20VerifySuccess('');
      }, 3000);
    } else {
      setBep20VerifyError(res.message);
    }
  };

  // Handle Buy Package Confirmation
  const handleConfirmPurchase = () => {
    if (!selectedPlanForBuy) return;
    const amount = Number(customInvestAmount);
    if (isNaN(amount) || amount < selectedPlanForBuy.min || amount > selectedPlanForBuy.max) {
      alert(`Investment amount must be between $${selectedPlanForBuy.min} and $${selectedPlanForBuy.max}`);
      return;
    }

    if (walletBalance < amount) {
      alert(`Insufficient account balance. You have $${walletBalance.toFixed(2)} USDT available, but package requires $${amount.toFixed(2)} USDT. Please deposit funds first.`);
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

    // Deduct package cost directly from available wallet balance
    const newBal = Math.max(0, walletBalance - amount);
    setWalletBalance(newBal);
    syncUserProfile(userEmail, userName, newBal);

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
    setBuySuccessMessage(`Successfully purchased ${selectedPlanForBuy.name} Plan for $${amount.toLocaleString()}! Remaining Balance: $${newBal.toFixed(2)} USDT.`);
    
    setTimeout(() => {
      setSelectedPlanForBuy(null);
      setBuySuccessMessage('');
      setActiveTab('packages');
    }, 1800);
  };

  // Handle KYC Document File Upload & Validation
  const [kycDocFile, setKycDocFile] = useState<string | null>(null);
  const [kycDocFileName, setKycDocFileName] = useState<string>('');
  const [kycFormError, setKycFormError] = useState<string>('');

  // Live Camera Capture States
  const [showCameraModal, setShowCameraModal] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const startLiveCamera = async () => {
    try {
      setShowCameraModal(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(mediaStream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 300);
    } catch (err) {
      alert('Unable to access camera. Please allow camera permissions or upload photo from device file chooser.');
      setShowCameraModal(false);
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const captureLivePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setKycDocFile(dataUrl);
        setKycDocFileName(`camera_snap_${Date.now()}.jpg`);
        setKycFormError('');
        stopLiveCamera();
      }
    }
  };

  const handleKycDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Document file size must be less than 10MB.');
      return;
    }

    setKycDocFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setKycDocFile(reader.result as string);
      setKycFormError('');
    };
    reader.readAsDataURL(file);
  };

  // Handle KYC Submit
  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKycFormError('');

    const fullName = kycForm.fullName || kycData.fullName;
    const dob = kycForm.dob || kycData.dob;
    const country = kycForm.country || kycData.country || 'United Arab Emirates';
    const idType = kycForm.idType || kycData.idType || 'PASSPORT';
    const idNumber = kycForm.idNumber || kycData.idNumber;

    if (!fullName || !fullName.trim()) {
      setKycFormError('Full Legal Name (as on ID) is mandatory.');
      return;
    }
    if (!dob) {
      setKycFormError('Date of Birth is mandatory.');
      return;
    }
    if (!idNumber || !idNumber.trim()) {
      setKycFormError('Document Serial / Identification Number is mandatory.');
      return;
    }
    if (!kycDocFile) {
      setKycFormError('Document Photo Upload is Mandatory! Please click to select your ID/Passport photo before submitting.');
      return;
    }

    const updated: KycData = {
      status: 'PENDING',
      fullName: fullName.trim(),
      dob,
      country,
      idType,
      idNumber: idNumber.trim(),
      submittedAt: new Date().toISOString().split('T')[0]
    };
    setKycData(updated);
    upsertKycToDb(userEmail, updated);
    setKycMessage('Your KYC identity information & document photo have been submitted successfully! Verification is currently in review.');
    setKycFormError('');
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
    { id: 'deposit', label: 'Deposit Funds (BEP20)', icon: Wallet, badgeText: 'AUTO', badgeColor: 'bg-accent text-accent-foreground font-bold' },
    { id: 'packages', label: 'My Packages', icon: Package, badge: `${activePackagesCount}` },
    { id: 'buy', label: 'Packages Store', icon: Sparkles, badgeText: 'HOT', badgeColor: 'bg-primary text-primary-foreground' },
    { id: 'team', label: 'My Team & Referral', icon: Users, badge: `${teamHierarchy.length}` },
    { id: 'kyc', label: 'KYC Verification', icon: ShieldCheck, statusBadge: (kycData && kycData.status) || 'UNVERIFIED' },
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
            {(userName || 'User').charAt(0)}
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">{userName || 'User'}</h2>
            <span className="text-[10px] text-primary font-mono font-bold">$ {(walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT</span>
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
              {/* Clickable Profile Image Upload Box */}
              <div className="relative group cursor-pointer flex-shrink-0" title="Click to upload profile picture">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                />
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/50 bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-black text-xl shadow-[0_0_20px_rgba(232,185,73,0.3)] overflow-hidden relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
                  ) : (
                    (userName || 'User').charAt(0)
                  )}
                  {/* Camera Hover Overlay */}
                  <div className="absolute inset-0 bg-black/65 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Camera size={16} className="text-primary animate-pulse" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-black shadow-md z-10 pointer-events-none">
                  <Camera size={10} className="font-bold" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-foreground truncate">{userName || 'User'}</h2>
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                </div>
                <p className="text-[11px] text-muted-foreground font-mono truncate">{userEmail || ''}</p>
              </div>
            </div>

            {/* Quick Wallet Balance Widget in Sidebar */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase">Available Balance</span>
                <span className="text-base font-black text-primary">
                  ${(walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
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
          <div className="space-y-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)]"
            >
              <LogOut size={14} /> Log Out
            </button>
            <button
              onClick={() => setLocation('/')}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-white/20 transition-all"
            >
              <ExternalLink size={14} /> Return to Homepage
            </button>
          </div>
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
              {activeTab === 'deposit' && 'Instant BEP20 USDT Deposit Portal'}
              {activeTab === 'packages' && 'My Active Subscription Packages'}
              {activeTab === 'buy' && 'Arbitrage Package Store'}
              {activeTab === 'kyc' && 'Identity & KYC Verification'}
              {activeTab === 'withdraw' && 'Instant Withdrawal Portal'}
              {activeTab === 'transactions' && 'Cryptographic Transaction Ledger'}
            </h1>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono">
            <button
              onClick={() => setActiveTab('deposit')}
              className="rounded-xl border border-accent/60 bg-accent/15 px-4 py-2.5 text-xs font-bold text-accent hover:bg-accent/25 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <ArrowDownRight size={15} /> Deposit
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className="rounded-xl border border-primary/50 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all flex items-center gap-1.5"
            >
              <ArrowUpRight size={15} /> Withdraw
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
              title="Log out of account"
            >
              <LogOut size={15} /> Logout
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
                  {isMounted && (
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
                          formatter={(val: any) => [`$${val || 0}.00`, 'Earned ROI']}
                        />
                        <Area type="monotone" dataKey="yield" stroke="#e8b949" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
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
                    {(purchasedPackages || []).map(pkg => {
                      const amount = Number(pkg?.amount || 0);
                      const earned = Number(pkg?.earnedRoi || 0);
                      const totalCap = Number(pkg?.totalRoiCap || 1);
                      const pct = Math.min(100, Math.round((earned / totalCap) * 100));
                      return (
                        <div key={pkg.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-mono">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground text-sm">{pkg.name} Plan</span>
                            <span className="text-xs font-bold text-primary">${amount.toLocaleString()}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Daily: <strong className="text-accent">+{pkg.dailyRoi}%</strong></span>
                            <span>Earned: <strong className="text-primary">${earned.toFixed(2)}</strong></span>
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

        {/* TAB: DEPOSIT FUNDS PORTAL */}
        {activeTab === 'deposit' && (
          <div className="mt-8 space-y-8 max-w-5xl mx-auto font-sans">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-xs text-accent font-bold mb-2">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" /> AUTOMATED BEP20 DEPOSIT GATEWAY
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-mono">
                Deposit USDT (BNB Smart Chain BEP20)
              </h2>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                Send USDT via BEP20 network to your personal deposit address below. Balance is credited automatically upon payment.
              </p>
            </div>

            {depositSuccessMsg && (
              <div className="rounded-2xl border border-accent/40 bg-accent/15 p-5 text-sm font-mono text-accent flex items-center justify-between gap-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={24} className="flex-shrink-0" />
                  <div>
                    <strong className="block font-bold">Deposit Credited!</strong>
                    <span>{depositSuccessMsg}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-foreground hover:bg-emerald-400 transition"
                >
                  View Dashboard
                </button>
              </div>
            )}

            {depositErrorMsg && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-mono text-rose-400 flex items-center gap-2">
                <AlertCircle size={18} /> {depositErrorMsg}
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-12 items-start">
              {/* Left Box: BEP20 Address & QR Code */}
              <div className="lg:col-span-5 rounded-3xl border border-primary/40 bg-gradient-to-b from-[#161f1a] via-[#101713] to-[#0a0e0c] p-6 backdrop-blur-2xl shadow-[0_0_35px_rgba(232,185,73,0.15)] space-y-6 text-center">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-mono">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <Wallet size={16} /> Official Deposit Wallet
                  </span>
                  <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold text-accent">
                    BEP20 ONLY
                  </span>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="relative p-3 rounded-2xl border-2 border-primary/50 bg-[#070a08] shadow-[0_0_30px_rgba(232,185,73,0.25)] group">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${DEFAULT_DEPOSIT_WALLET}&color=e8b949&bgcolor=070a08`}
                      alt="BEP20 Deposit Wallet QR Code"
                      className="w-48 h-48 rounded-xl object-contain transition-transform group-hover:scale-105"
                    />
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Scan with TrustWallet, Metamask, Binance, or OKX App
                  </span>
                </div>

                {/* Wallet Address Display */}
                <div className="space-y-2 text-left font-mono">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    BEP20 Receiving Address (USDT)
                  </label>
                  <div className="rounded-xl border border-white/15 bg-black/60 p-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-primary break-all">
                      {DEFAULT_DEPOSIT_WALLET}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(DEFAULT_DEPOSIT_WALLET);
                        } catch (e) {}
                        setCopiedDepositAddr(true);
                        setTimeout(() => setCopiedDepositAddr(false), 2500);
                      }}
                      className="rounded-lg border border-primary/40 bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/30 transition-all flex items-center gap-1 flex-shrink-0"
                    >
                      {copiedDepositAddr ? <Check size={14} /> : <Copy size={14} />}
                      {copiedDepositAddr ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Network Safety Note */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] font-mono text-amber-300 text-left space-y-1">
                  <strong className="block font-bold">⚠️ Network Notice:</strong>
                  <p className="text-[10px] text-amber-300/80 leading-relaxed">
                    Only send <strong>USDT via BEP20 (BNB Smart Chain)</strong> to this address. Sending funds on other networks (ERC20/TRC20) may result in permanent loss.
                  </p>
                </div>
              </div>

              {/* Right Box: Deposit Verification Form */}
              <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#0f1412] p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6 font-mono text-xs">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2 font-sans">
                    <Sparkles size={18} className="text-accent" /> Confirm Deposit & Credit Account
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your deposit amount and transaction hash (TxHash) below to instantly credit your account.
                  </p>
                </div>

                <form onSubmit={handleProcessDeposit} className="space-y-5">
                  <div>
                    <label className="block text-muted-foreground mb-2 font-bold">
                      Deposit Amount (USDT) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-base">$</span>
                      <input
                        type="number"
                        step="any"
                        min="1"
                        required
                        value={depositAmountInput}
                        onChange={e => setDepositAmountInput(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full rounded-xl border border-white/15 bg-white/[0.03] pl-9 pr-16 py-3.5 text-foreground text-sm font-bold outline-none focus:border-accent"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">USDT</span>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {['100', '300', '500', '1000', '5000', '10000'].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDepositAmountInput(amt)}
                          className={`rounded-lg border px-3 py-1 text-xs font-bold transition-all ${
                            depositAmountInput === amt
                              ? 'border-accent bg-accent/20 text-accent'
                              : 'border-white/10 bg-white/5 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          +${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-muted-foreground mb-2 font-bold">
                      BEP20 Transaction Hash / TxHash <span className="text-muted-foreground font-normal">(Optional for Instant Credit)</span>
                    </label>
                    <input
                      type="text"
                      value={depositTxHash}
                      onChange={e => setDepositTxHash(e.target.value)}
                      placeholder="e.g. 0x8f2b41e... (66 characters)"
                      className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3.5 text-foreground text-xs font-mono outline-none focus:border-accent"
                    />
                    <span className="text-[10px] text-muted-foreground mt-1.5 block">
                      Found in your wallet app after sending payment on BNB Smart Chain.
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Target Network:</span>
                      <strong className="text-foreground">BNB Smart Chain (BEP20)</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Deposit Fee:</span>
                      <strong className="text-accent font-bold">0% (Zero Fee)</strong>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-foreground">
                      <span>Net Balance Credit:</span>
                      <strong className="text-accent text-sm">+${(parseFloat(depositAmountInput || '0') || 0).toFixed(2)} USDT</strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingDeposit}
                    className="w-full rounded-xl bg-gradient-to-r from-accent via-emerald-400 to-accent py-4 text-xs font-black uppercase text-accent-foreground shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isVerifyingDeposit ? (
                      <span>Verifying On-Chain...</span>
                    ) : (
                      <>
                        <CheckCircle2 size={16} /> Confirm & Credit Deposit to Balance
                      </>
                    )}
                  </button>
                </form>
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
              {(purchasedPackages || []).map(pkg => {
                const amount = Number(pkg?.amount || 0);
                const earned = Number(pkg?.earnedRoi || 0);
                const remaining = Number(pkg?.remainingRoi || 0);
                const totalCap = Number(pkg?.totalRoiCap || 1);
                const progressPct = Math.min(100, Math.round((earned / totalCap) * 100));
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
                          <strong className="text-foreground text-sm">${amount.toLocaleString()}.00</strong>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-muted-foreground">Daily ROI Rate</span>
                          <strong className="text-accent text-sm">+{pkg.dailyRoi}% / Day</strong>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-muted-foreground">Total Earned ROI</span>
                          <strong className="text-primary text-sm">${earned.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-muted-foreground">Remaining ROI Cap</span>
                          <strong className="text-foreground">${remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
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

        {/* TAB 3.5: MY TEAM & REFERRAL HUB */}
        {activeTab === 'team' && (
          <div className="mt-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight font-mono flex items-center gap-2">
                  <Users className="text-primary" size={24} /> My Team & Referral Hub
                </h2>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Invite friends, track direct referrals, and build your multi-level trading community.
                </p>
              </div>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/register?ref=${userRefCode || 'NEXA7K42'}`;
                  if (navigator.share) {
                    navigator.share({ title: 'Nexa Traders', url }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(url);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  }
                }}
                className="rounded-xl border border-primary/50 bg-primary/10 px-4 py-2.5 text-xs font-bold font-mono text-primary hover:bg-primary/20 transition-all flex items-center gap-2"
              >
                <Share2 size={16} /> Share Referral Link
              </button>
            </div>

            {/* REFERRAL CODE & REFERRAL LINK CARDS GRID */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Card 1: Referral Code */}
              <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#131b17] to-[#0c110f] p-6 backdrop-blur-2xl shadow-xl relative overflow-hidden space-y-4">
                <div className="absolute top-0 right-0 h-24 w-24 bg-primary/10 blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">My Unique Referral Code</span>
                  <span className="rounded-full bg-primary/20 border border-primary/30 px-3 py-0.5 text-[10px] font-mono text-primary font-bold">PERMANENT</span>
                </div>
                <div className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <span className="text-2xl font-black font-mono tracking-widest text-primary">
                    {userRefCode || 'NEXA7K42'}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(userRefCode || 'NEXA7K42');
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2500);
                    }}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-bold font-mono text-primary-foreground hover:bg-[#f3cc68] transition-all flex items-center gap-1.5 shadow-md"
                  >
                    {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                    {copiedCode ? 'Copied Code!' : 'Copy Code'}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Share this code with your friends during Sign Up to add them directly to your team network.
                </p>
              </div>

              {/* Card 2: Referral Link */}
              <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#131b17] to-[#0c110f] p-6 backdrop-blur-2xl shadow-xl relative overflow-hidden space-y-4">
                <div className="absolute top-0 right-0 h-24 w-24 bg-accent/10 blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">My Unique Referral Link</span>
                  <span className="rounded-full bg-accent/20 border border-accent/30 px-3 py-0.5 text-[10px] font-mono text-accent font-bold">AUTO ATTRIBUTION</span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-2xl p-2.5">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/register?ref=${userRefCode || 'NEXA7K42'}`}
                    className="w-full bg-transparent px-2 text-xs font-mono text-foreground outline-none truncate"
                  />
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/register?ref=${userRefCode || 'NEXA7K42'}`;
                      navigator.clipboard.writeText(link);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }}
                    className="rounded-xl bg-accent px-4 py-2 text-xs font-bold font-mono text-accent-foreground hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md flex-shrink-0"
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Anyone registering through this link will automatically be connected as your permanent direct referral.
                </p>
              </div>
            </div>

            {/* TEAM STATISTICS KPI CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-mono">
              <div className="rounded-2xl border border-white/10 bg-[#0c110f] p-5">
                <div className="text-xs text-muted-foreground uppercase">Total Team Members</div>
                <div className="mt-2 text-3xl font-black text-foreground">{teamHierarchy.length}</div>
                <div className="mt-1 text-[10px] text-primary">All Network Levels</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0c110f] p-5">
                <div className="text-xs text-muted-foreground uppercase">Direct Referrals</div>
                <div className="mt-2 text-3xl font-black text-primary">{directTeam.length}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">Level 1 Direct Sponsor</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0c110f] p-5">
                <div className="text-xs text-muted-foreground uppercase">Active Members</div>
                <div className="mt-2 text-3xl font-black text-accent">
                  {teamHierarchy.filter(item => {
                    const inv = item.user?.package_investment !== undefined ? Number(item.user.package_investment) : (Number(item.user?.wallet_balance) || 0);
                    return inv > 0;
                  }).length}
                </div>
                <div className="mt-1 text-[10px] text-accent/80">Active Package Investors</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0c110f] p-5">
                <div className="text-xs text-muted-foreground uppercase">Total Team Packages</div>
                <div className="mt-2 text-3xl font-black text-emerald-400">
                  $ {teamHierarchy.reduce((sum, item) => {
                    const inv = item.user?.package_investment !== undefined ? Number(item.user.package_investment) : (Number(item.user?.wallet_balance) || 0);
                    return sum + inv;
                  }, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="mt-1 text-[10px] text-emerald-400/80">USDT Packages Investment</div>
              </div>
            </div>

            {/* TEAM SECTION CONTENTS: EMPTY STATE OR TEAM TABLE */}
            {teamHierarchy.length === 0 ? (
              /* ATTRACTIVE EMPTY STATE CARD */
              <div className="rounded-3xl border border-white/10 bg-[#0a0f0d] p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto shadow-2xl">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-primary/40 bg-primary/10 text-primary shadow-[0_0_30px_rgba(232,185,73,0.2)]">
                  <Users size={36} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-mono text-foreground">You don't have any team members yet.</h3>
                  <p className="text-xs font-mono text-muted-foreground max-w-md mx-auto">
                    Invite friends and build your team. Share your unique referral code or link to start earning referral rewards across your network!
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/register?ref=${userRefCode || 'NEXA7K42'}`;
                      navigator.clipboard.writeText(link);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }}
                    className="w-full sm:w-auto rounded-xl bg-primary px-6 py-3 text-xs font-bold font-mono text-primary-foreground hover:bg-[#f3cc68] transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                    {copiedLink ? 'Copied Referral Link!' : 'Copy Referral Link'}
                  </button>

                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/register?ref=${userRefCode || 'NEXA7K42'}`;
                      if (navigator.share) {
                        navigator.share({ title: 'Join Nexa Traders', url }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(url);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2500);
                      }
                    }}
                    className="w-full sm:w-auto rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-xs font-bold font-mono text-foreground hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Share2 size={16} /> Invite Friends
                  </button>
                </div>
              </div>
            ) : (
              /* PREMIUM TEAM MEMBERS TABLE */
              <div className="rounded-3xl border border-white/10 bg-[#0a0f0d] overflow-hidden shadow-2xl space-y-4">
                <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold font-mono text-foreground">My Referred Team Members</h3>
                    <p className="text-xs font-mono text-muted-foreground">Showing verified user network accounts</p>
                  </div>

                  <div className="flex gap-2 font-mono text-xs">
                    <button
                      onClick={() => setTeamTabFilter('all')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        teamTabFilter === 'all' ? 'bg-primary text-primary-foreground font-bold' : 'bg-white/5 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      All ({teamHierarchy.length})
                    </button>
                    <button
                      onClick={() => setTeamTabFilter('direct')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        teamTabFilter === 'direct' ? 'bg-primary text-primary-foreground font-bold' : 'bg-white/5 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Direct L1 ({directTeam.length})
                    </button>
                    <button
                      onClick={() => setTeamTabFilter('network')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        teamTabFilter === 'network' ? 'bg-primary text-primary-foreground font-bold' : 'bg-white/5 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Level 2+ ({teamHierarchy.length - directTeam.length})
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-white/5 border-b border-white/10 text-muted-foreground uppercase text-[10px]">
                      <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">User ID / Code</th>
                        <th className="px-6 py-4">Hierarchy Level</th>
                        <th className="px-6 py-4">Registration Date</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Packages Purchased</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(teamTabFilter === 'direct' ? teamHierarchy.filter(t => t.level === 1) : teamTabFilter === 'network' ? teamHierarchy.filter(t => t.level > 1) : teamHierarchy).map((item, index) => {
                        const u = item.user;
                        const packageInv = Number(u.package_investment !== undefined ? u.package_investment : u.wallet_balance) || 0;
                        const hasDeposit = packageInv > 0;
                        const levelBadge = item.level === 1 ? 'bg-primary/20 text-primary border-primary/30' : item.level === 2 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30';

                        return (
                          <tr key={u.id || u.email || index} className="hover:bg-white/[0.03] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 border border-primary/30 font-bold text-primary">
                                  {(u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-foreground font-sans">{u.full_name || 'User'}</div>
                                  <div className="text-[11px] text-muted-foreground">{u.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 font-bold text-primary">
                              {u.referral_code || `NT${10020 + index}`}
                            </td>

                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${levelBadge}`}>
                                {item.level === 1 ? 'Direct L1' : `Level ${item.level}`}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-muted-foreground">
                              {u.created_at ? u.created_at.substring(0, 10) : '2026-09-02'}
                            </td>

                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                hasDeposit ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              }`}>
                                {hasDeposit ? 'Active' : 'Pending'}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleOpenMemberPackages(u)}
                                className="group inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all"
                                title="Click to view detailed packages purchased by this member"
                              >
                                <span>$ {packageInv.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT</span>
                                <ExternalLink size={12} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-400" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* REFERRED MEMBER PACKAGES BREAKDOWN MODAL */}
            {selectedTeamMemberModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
                <div className="w-full max-w-2xl rounded-3xl border border-primary/40 bg-[#0a0f0d] p-6 sm:p-8 shadow-2xl space-y-6 font-mono text-xs max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 border border-primary/40 text-primary font-bold text-lg">
                        {(selectedTeamMemberModal.full_name || selectedTeamMemberModal.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-foreground font-sans">
                            {selectedTeamMemberModal.full_name || 'Team Member'}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                            {selectedTeamMemberModal.referral_code || 'MEMBER'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {selectedTeamMemberModal.email}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTeamMemberModal(null)}
                      className="rounded-xl border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* KPI Cards Banner */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Total Packages Investment</span>
                      <span className="text-2xl font-black text-emerald-400 mt-1 block">
                        $ {(Number(selectedTeamMemberModal.package_investment !== undefined ? selectedTeamMemberModal.package_investment : selectedTeamMemberModal.wallet_balance) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
                      </span>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold font-mono">Active Plans Count</span>
                      <span className="text-2xl font-black text-primary mt-1 block">
                        {memberPackagesList.length} {memberPackagesList.length === 1 ? 'Package' : 'Packages'}
                      </span>
                    </div>
                  </div>

                  {/* Package Breakdown List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <Package size={15} className="text-primary" /> Purchased Packages Breakdown
                      </h4>
                      <span className="text-[11px] text-muted-foreground">Detailed Purchase History</span>
                    </div>

                    {loadingMemberPackages ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-muted-foreground flex items-center justify-center gap-2 font-mono">
                        <RefreshCw size={16} className="animate-spin text-primary" /> Loading package details...
                      </div>
                    ) : memberPackagesList.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-muted-foreground space-y-2">
                        <Package size={32} className="mx-auto text-muted-foreground/40" />
                        <p className="font-bold text-foreground">No active packages purchased yet</p>
                        <p className="text-[11px]">This team member has registered but has not bought any packages yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {memberPackagesList.map((pkg, idx) => (
                          <div
                            key={pkg.id || idx}
                            className="rounded-2xl border border-white/10 bg-[#0d1310] p-4 sm:p-5 hover:border-primary/40 transition-all space-y-3 shadow-lg"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-foreground font-sans">{pkg.name || 'Trading Package'}</span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    {pkg.status || 'ACTIVE'}
                                  </span>
                                </div>
                                <span className="text-[11px] text-muted-foreground font-mono mt-0.5 block">
                                  Package ID: {pkg.id}
                                </span>
                              </div>

                              <div className="text-right">
                                <span className="text-lg font-black text-emerald-400 font-mono">
                                  $ {(Number(pkg.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                              <div>
                                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Purchase Date (Kab Buy Kiya)</span>
                                <span className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                                  <Calendar size={12} className="text-primary" /> {pkg.purchaseDate || pkg.created_at?.substring(0, 10) || '2026-09-03'}
                                </span>
                              </div>

                              <div>
                                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Daily ROI Rate</span>
                                <span className="font-bold text-accent flex items-center gap-1 mt-0.5">
                                  <TrendingUp size={12} /> {pkg.dailyRoi || 2.5}% Daily
                                </span>
                              </div>

                              <div>
                                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Max ROI Cap</span>
                                <span className="font-bold text-primary flex items-center gap-1 mt-0.5">
                                  <ShieldCheck size={12} /> $ {(Number(pkg.totalRoiCap) || (pkg.amount * 3)).toLocaleString()} USDT
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 text-center border-t border-white/10">
                    <button
                      onClick={() => setSelectedTeamMemberModal(null)}
                      className="w-full rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-foreground hover:bg-white/15 transition-all"
                    >
                      Close Package Details
                    </button>
                  </div>
                </div>
              </div>
            )}
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

            {kycFormError && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-mono text-rose-400 flex items-center gap-2">
                <AlertCircle size={16} /> {kycFormError}
              </div>
            )}

            {/* KYC Submission Form */}
            <form onSubmit={handleKycSubmit} className="rounded-3xl border border-white/10 bg-[#0f1412] p-6 sm:p-8 space-y-6 font-mono text-xs">
              <h3 className="text-lg font-bold text-foreground border-b border-white/10 pb-3 flex items-center gap-2">
                <UserCheck size={18} className="text-primary" /> Identity Information & Document Upload
              </h3>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-muted-foreground mb-2">Full Legal Name (as on ID) <span className="text-rose-400">*</span></label>
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
                  <label className="block text-muted-foreground mb-2">Date of Birth <span className="text-rose-400">*</span></label>
                  <input
                    type="date"
                    required
                    value={kycForm.dob || kycData.dob}
                    onChange={e => setKycForm({ ...kycForm, dob: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-2">Country of Residence <span className="text-rose-400">*</span></label>
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
                  <label className="block text-muted-foreground mb-2">Identification Document Type <span className="text-rose-400">*</span></label>
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
                  <label className="block text-muted-foreground mb-2">Document Serial / Identification Number <span className="text-rose-400">*</span></label>
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

              {/* Upload Options: Live Camera Capture OR File Upload */}
              <div>
                <label className="block text-muted-foreground mb-2 flex items-center justify-between">
                  <span>Upload or Take Photo of Document (PNG, JPG, PDF) <span className="text-rose-400 font-bold">*MANDATORY</span></span>
                  {kycDocFileName && <span className="text-accent font-bold">✓ {kycDocFileName} Attached</span>}
                </label>

                {/* Option Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={startLiveCamera}
                    className="rounded-2xl border border-primary/50 bg-primary/10 p-4 font-mono text-xs font-bold text-primary hover:bg-primary/20 hover:border-primary transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Camera size={18} /> 📷 Open Live Camera Capture
                  </button>

                  <label className="rounded-2xl border border-white/20 bg-white/5 p-4 font-mono text-xs font-bold text-foreground hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm relative overflow-hidden">
                    <UploadCloud size={18} className="text-accent" /> 📁 Choose Photo / File
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleKycDocFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </label>
                </div>

                {/* Dropzone Display / Preview Area */}
                <div className="rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 p-6 text-center hover:border-primary transition-all cursor-pointer relative overflow-hidden group">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleKycDocFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                  />
                  {kycDocFile ? (
                    <div className="space-y-2">
                      {kycDocFile.startsWith('data:image/') ? (
                        <img src={kycDocFile} alt="Captured Document" className="h-28 mx-auto rounded-xl border border-accent/40 object-cover shadow-md" />
                      ) : (
                        <CheckCircle2 size={36} className="mx-auto text-accent animate-bounce" />
                      )}
                      <p className="text-sm font-bold text-accent">Document Attached: {kycDocFileName}</p>
                      <p className="text-[11px] text-muted-foreground">Click to change attached document file</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <UploadCloud size={32} className="mx-auto text-primary mb-1 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-bold text-foreground">Click here to upload photo or drag & drop</p>
                      <p className="text-[11px] text-muted-foreground mt-1">Maximum file size: 10MB (Clear Passport / ID Scan Required)</p>
                    </div>
                  )}
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

        {/* LIVE CAMERA CAPTURE MODAL */}
        {showCameraModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md font-mono">
            <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#0c100e] p-6 shadow-2xl space-y-5 text-center relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-foreground font-sans flex items-center gap-2">
                  <Camera size={18} className="text-primary animate-pulse" /> Live Document Camera Capture
                </h3>
                <button type="button" onClick={stopLiveCamera} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 aspect-video flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-4 border-2 border-dashed border-primary/60 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="bg-black/70 text-primary font-bold text-[11px] px-3 py-1 rounded-full border border-primary/40 shadow-md">
                    Position Document Inside Frame
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={stopLiveCamera}
                  className="w-1/2 rounded-xl border border-white/15 bg-white/5 py-3 font-bold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={captureLivePhoto}
                  className="w-1/2 rounded-xl bg-gradient-to-r from-primary via-[#f5c542] to-primary py-3 font-black uppercase text-primary-foreground shadow-[0_0_20px_rgba(232,185,73,0.35)] flex items-center justify-center gap-2 hover:scale-105 transition-all"
                >
                  <Camera size={16} /> Snap Photo 📸
                </button>
              </div>
            </div>
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

                {paymentMethod === 'USDT_BEP20' && (
                  <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-primary flex items-center gap-1.5">
                        <Zap size={14} /> Official BEP20 Deposit Address (BNB Smart Chain)
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] text-foreground">
                      <span className="truncate mr-2 font-bold">{DEFAULT_DEPOSIT_WALLET}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(DEFAULT_DEPOSIT_WALLET);
                          alert('BEP20 Address Copied to Clipboard!');
                        }}
                        className="rounded-lg bg-primary/20 px-2 py-1 text-primary hover:bg-primary/30 flex items-center gap-1 flex-shrink-0 font-bold"
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[11px] text-muted-foreground">Enter BEP20 TxHash / Transaction ID</label>
                      <input
                        type="text"
                        value={bep20TxHash}
                        onChange={e => setBep20TxHash(e.target.value)}
                        placeholder="0x..."
                        className="w-full rounded-xl border border-white/20 bg-white/[0.04] px-3.5 py-2.5 text-xs text-foreground font-mono outline-none focus:border-primary"
                      />
                    </div>

                    {bep20VerifyError && (
                      <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-[11px] text-rose-400 font-mono flex items-center gap-2">
                        <AlertCircle size={14} className="flex-shrink-0" /> {bep20VerifyError}
                      </div>
                    )}

                    {bep20VerifySuccess && (
                      <div className="rounded-xl border border-accent/40 bg-accent/10 p-3 text-[11px] text-accent font-mono flex items-center gap-2">
                        <CheckCircle2 size={14} className="flex-shrink-0" /> {bep20VerifySuccess}
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isVerifyingBep20}
                      onClick={handleVerifyBep20Payment}
                      className="w-full rounded-xl bg-gradient-to-r from-accent via-primary to-accent py-3 font-mono text-xs font-black uppercase text-primary-foreground shadow-[0_0_20px_rgba(232,185,73,0.3)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                    >
                      {isVerifyingBep20 ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" /> Verifying on BscScan...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} /> Verify BEP20 Payment Live on BscScan
                        </>
                      )}
                    </button>
                  </div>
                )}

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
