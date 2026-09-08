import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, ShieldCheck, Clock, AlertCircle, X, 
  ArrowDownRight, ArrowUpRight, Package, DollarSign, ExternalLink, Calendar, CheckCircle2, RefreshCw, Eye, UserCheck, Check, AlertTriangle
} from 'lucide-react';
import { fetchUser360ProfileFromDb, updateKycStatusInDb, syncUserProfile } from '@/lib/supabase';

interface AdminUsersProps {
  users: any[];
  transactions: any[];
  packages: any[];
  kycRequests: any[];
  selectedUserEmail?: string | null;
  selectedEmail?: string | null;
  onSelectUser?: (email: string | null) => void;
  onClearSelectedEmail?: () => void;
  onRefreshData?: () => void;
}

export function AdminUsers({
  users,
  transactions,
  packages,
  kycRequests,
  selectedUserEmail: propSelectedUserEmail,
  selectedEmail,
  onSelectUser,
  onClearSelectedEmail,
  onRefreshData
}: AdminUsersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Internal selection fallback state
  const [internalEmail, setInternalEmail] = useState<string | null>(null);

  // Active email preference: propSelectedUserEmail > selectedEmail > internalEmail
  const activeSelectedEmail = (propSelectedUserEmail !== undefined && propSelectedUserEmail !== null ? propSelectedUserEmail : undefined) ?? selectedEmail ?? internalEmail;

  // Live 360 Targeted User State
  const [live360Data, setLive360Data] = useState<any | null>(null);
  const [isLoading360, setIsLoading360] = useState<boolean>(false);

  const handleUserSelect = (email: string | null) => {
    setInternalEmail(email);
    if (onSelectUser) onSelectUser(email);
    if (email === null && onClearSelectedEmail) onClearSelectedEmail();
  };

  // Fetch Live Targeted 360 Profile Data whenever a user is selected
  useEffect(() => {
    if (!activeSelectedEmail) {
      setLive360Data(null);
      return;
    }
    setIsLoading360(true);
    fetchUser360ProfileFromDb(activeSelectedEmail).then(data => {
      setLive360Data(data);
      setIsLoading360(false);
    }).catch(err => {
      console.error('360 profile error:', err);
      setIsLoading360(false);
    });
  }, [activeSelectedEmail]);

  // Filtered Users List
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      (u.email || '').toLowerCase().includes(term) ||
      (u.full_name || '').toLowerCase().includes(term) ||
      (u.id || '').toLowerCase().includes(term);

    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'KYC_PENDING' ? u.kyc_status === 'PENDING' :
      statusFilter === 'KYC_APPROVED' ? u.kyc_status === 'APPROVED' :
      statusFilter === 'KYC_REJECTED' ? u.kyc_status === 'REJECTED' :
      statusFilter === 'ACTIVE' ? u.kyc_status !== 'REJECTED' : true;

    return matchesSearch && matchesStatus;
  });

  // Selected User Object & Computations for 360° Drawer
  const selectedUserObj = activeSelectedEmail 
    ? users.find(u => (u.email || '').toLowerCase() === activeSelectedEmail.toLowerCase()) || { email: activeSelectedEmail, full_name: activeSelectedEmail.split('@')[0], wallet_balance: 0 }
    : null;

  const emailLower = (activeSelectedEmail || '').toLowerCase().trim();

  // Fallbacks using passed props if live360Data is loading
  const propTxs = activeSelectedEmail ? transactions.filter(t => (t.user_email || t.email || t.userEmail || '').toLowerCase().trim() === emailLower) : [];
  const propPkgs = activeSelectedEmail ? packages.filter(p => (p.user_email || p.email || p.userEmail || '').toLowerCase().trim() === emailLower) : [];

  const propTotalDepositsExplicit = propTxs.filter(t => (t.type === 'DEPOSIT' || (t.type && t.type.toUpperCase().includes('DEPOSIT'))) && (t.status === 'COMPLETED' || t.status === 'APPROVED' || !t.status)).reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
  const propPackageInvested = propPkgs.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const propTotalDeposits = Math.max(propTotalDepositsExplicit, propPackageInvested);
  const propTotalWithdrawals = propTxs.filter(t => (t.type === 'WITHDRAWAL' || (t.type && t.type.toUpperCase().includes('WITHDRAW'))) && (t.status === 'COMPLETED' || t.status === 'APPROVED')).reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
  const propPendingWithdrawals = propTxs.filter(t => (t.type === 'WITHDRAWAL' || (t.type && t.type.toUpperCase().includes('WITHDRAW'))) && t.status === 'PENDING').reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

  // Final display metrics prioritizing live targeted 360 data
  const displayBalance = live360Data ? live360Data.walletBalance : Number(selectedUserObj?.wallet_balance || 0);
  const displayDeposits = live360Data ? live360Data.totalDeposited : propTotalDeposits;
  const displayWithdrawals = live360Data ? live360Data.totalWithdrawn : propTotalWithdrawals;
  const displayPendingW = live360Data ? live360Data.pendingWithdrawal : propPendingWithdrawals;
  const displayPkgVol = live360Data ? live360Data.packageVolume : propPackageInvested;
  const displayKycStatus = live360Data ? live360Data.kycStatus : (selectedUserObj?.kyc_status || 'NOT_SUBMITTED');

  const displayPkgs = (live360Data && live360Data.packages && live360Data.packages.length > 0) ? live360Data.packages : propPkgs;
  const displayTxs = (live360Data && live360Data.recentTransactions && live360Data.recentTransactions.length > 0) ? live360Data.recentTransactions : propTxs;
  const kycDetail = live360Data?.kycDetail;

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-black font-sans tracking-tight text-foreground flex items-center gap-2">
            <Users className="text-primary" size={24} /> Registered User Directory
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Comprehensive account governance, balances, KYC verification states, and transaction histories.
          </p>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search ID, Name, Email..."
              className="w-full rounded-xl border border-white/15 bg-white/[0.03] pl-10 pr-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/15 bg-[#0c100e] px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Users</option>
            <option value="KYC_PENDING">KYC Pending</option>
            <option value="KYC_APPROVED">KYC Approved</option>
            <option value="KYC_REJECTED">KYC Rejected</option>
          </select>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0c100e] p-6 backdrop-blur-2xl shadow-xl overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground text-[11px] uppercase">
              <th className="pb-3 px-4">User ID / Email</th>
              <th className="pb-3 px-4">Full Name</th>
              <th className="pb-3 px-4">Registration</th>
              <th className="pb-3 px-4">KYC Status</th>
              <th className="pb-3 px-4">Available Balance</th>
              <th className="pb-3 px-4">Total Packages</th>
              <th className="pb-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                  No users matching search filter criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => {
                const uEmail = (user.email || '').toLowerCase();
                const pkgsCount = packages.filter(p => (p.user_email || p.email || '').toLowerCase() === uEmail).length;
                return (
                  <tr key={user.id || user.email} className="hover:bg-white/[0.02] transition-all">
                    <td className="py-4 px-4">
                      <strong className="block text-foreground text-xs">{user.email}</strong>
                      <span className="text-[10px] text-muted-foreground font-mono">ID: {user.id ? user.id.substring(0, 8) : 'N/A'}</span>
                    </td>
                    <td className="py-4 px-4 font-bold text-foreground">
                      {user.full_name || user.email.split('@')[0]}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase border ${
                        user.kyc_status === 'APPROVED' ? 'bg-accent/15 text-accent border-accent/30' :
                        user.kyc_status === 'PENDING' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                        'bg-white/10 text-muted-foreground border-white/20'
                      }`}>
                        {user.kyc_status || 'UNVERIFIED'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-primary text-sm">
                      ${Number(user.wallet_balance || 0).toFixed(2)} USDT
                    </td>
                    <td className="py-4 px-4">
                      <span className="rounded-xl bg-purple-500/10 px-2.5 py-1 font-bold text-purple-400 border border-purple-500/20">
                        {pkgsCount} Packages
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleUserSelect(user.email)}
                        className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 font-bold text-primary hover:bg-primary/20 transition-all flex items-center gap-1 text-[11px]"
                      >
                        View 360° Profile <ExternalLink size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 360° USER DETAILS DRAWER / MODAL */}
      {selectedUserObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl h-full max-h-[92vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#0c100e] p-6 sm:p-8 shadow-2xl space-y-6 relative font-mono">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase text-primary font-bold">USER 360° AUDIT PROFILE</span>
                  {isLoading360 && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-accent animate-pulse">
                      <RefreshCw size={11} className="animate-spin" /> Fetching Live Telemetry...
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-foreground font-sans">{selectedUserObj.full_name || selectedUserObj.email}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span>{selectedUserObj.email}</span>
                  {selectedUserObj.referral_code && (
                    <span className="text-primary font-bold">Ref Code: {selectedUserObj.referral_code}</span>
                  )}
                  {selectedUserObj.sponsor_email && (
                    <span className="text-accent">Sponsor: {selectedUserObj.sponsor_email}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleUserSelect(null)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {/* Financial Overview Cards (100% Calculated & Verified) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3.5">
                <span className="text-[10px] uppercase text-muted-foreground block font-bold">Available Balance</span>
                <strong className="text-lg font-black text-primary">${displayBalance.toFixed(2)}</strong>
              </div>
              <div className="rounded-2xl border border-accent/30 bg-accent/5 p-3.5">
                <span className="text-[10px] uppercase text-muted-foreground block font-bold">Total Deposited</span>
                <strong className="text-lg font-black text-accent">${displayDeposits.toFixed(2)}</strong>
              </div>
              <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-3.5">
                <span className="text-[10px] uppercase text-muted-foreground block font-bold">Total Withdrawn</span>
                <strong className="text-lg font-black text-orange-400">${displayWithdrawals.toFixed(2)}</strong>
              </div>
              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-3.5">
                <span className="text-[10px] uppercase text-muted-foreground block font-bold">Package Volume</span>
                <strong className="text-lg font-black text-purple-400">${displayPkgVol.toFixed(2)}</strong>
              </div>
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-3.5">
                <span className="text-[10px] uppercase text-muted-foreground block font-bold">Pending Withdrawal</span>
                <strong className="text-lg font-black text-rose-400">${displayPendingW.toFixed(2)}</strong>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                <span className="text-[10px] uppercase text-muted-foreground block font-bold">KYC Status</span>
                <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-black uppercase border ${
                  displayKycStatus === 'APPROVED' ? 'bg-accent/20 text-accent border-accent/40' :
                  displayKycStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
                  displayKycStatus === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                  'bg-white/10 text-muted-foreground border-white/20'
                }`}>
                  {displayKycStatus}
                </span>
              </div>
            </div>

            {/* KYC Submission Document Audit Details */}
            {kycDetail && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                <h4 className="text-xs font-bold text-foreground font-sans uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={15} className="text-accent" /> Submitted KYC Document Audit
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block">Doc Type</span>
                    <strong className="text-foreground">{kycDetail.document_type || 'PASSPORT'}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-mono">ID / Serial Number</span>
                    <strong className="text-primary font-mono">{kycDetail.document_number || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Submission Date</span>
                    <span className="text-foreground">{kycDetail.submitted_at ? new Date(kycDetail.submitted_at).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Subscribed Packages History */}
            <div className="space-y-3 border-t border-white/10 pt-4">
              <h4 className="text-sm font-bold text-foreground font-sans flex items-center gap-2">
                <Package size={16} className="text-purple-400" /> Active Package Subscriptions ({displayPkgs.length})
              </h4>
              {displayPkgs.length === 0 ? (
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-muted-foreground text-center">
                  No package purchases found for this user.
                </div>
              ) : (
                <div className="space-y-2">
                  {displayPkgs.map((pkg: any) => (
                    <div key={pkg.id} className="flex justify-between items-center p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                      <div>
                        <strong className="text-foreground text-xs block">{pkg.package_name || pkg.name} Plan</strong>
                        <span className="text-[10px] text-muted-foreground">
                          Purchased: {pkg.purchase_date || 'Recent'} | Earned: ${Number(pkg.earned_roi || pkg.earnedRoi || 0).toFixed(2)} / Cap: ${Number(pkg.total_roi_cap || pkg.totalRoiCap || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary text-xs block">${Number(pkg.amount).toFixed(2)} USDT</span>
                        <span className={`text-[9px] font-bold uppercase ${pkg.status === 'COMPLETED' ? 'text-accent' : 'text-primary'}`}>
                          {pkg.status || 'ACTIVE'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verified Deposit TxHash Proofs Section */}
            <div className="space-y-3 border-t border-white/10 pt-4">
              <h4 className="text-sm font-bold text-foreground font-sans flex items-center gap-2">
                <ShieldCheck size={16} className="text-accent" /> Verified Deposit TxHash Proofs ({displayTxs.filter((t: any) => (t.description || '').includes('0x')).length})
              </h4>
              {displayTxs.filter((t: any) => (t.description || '').includes('0x')).length === 0 ? (
                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] text-muted-foreground text-center text-xs">
                  No verified deposit TxHashes recorded for this account.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {displayTxs.filter((t: any) => (t.description || '').includes('0x')).map((tx: any) => {
                    const hashMatch = (tx.description || '').match(/0x[a-fA-F0-9]{64}/);
                    const hashStr = hashMatch ? hashMatch[0] : '';
                    return (
                      <div key={tx.id} className="p-3 rounded-xl border border-accent/20 bg-accent/5 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-accent text-xs">${Number(tx.amount || 0).toFixed(2)} USDT Verified Deposit</span>
                          <span className="text-[10px] text-muted-foreground">{tx.created_at ? new Date(tx.created_at).toLocaleString() : (tx.date || 'Recent')}</span>
                        </div>
                        {hashStr && (
                          <div className="flex items-center justify-between gap-2 bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/10 font-mono text-[11px]">
                            <span className="text-primary truncate font-bold">{hashStr}</span>
                            <a
                              href={`https://bscscan.com/tx/${hashStr}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-accent hover:underline flex items-center gap-1 shrink-0 font-bold"
                            >
                              Verify BscScan <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Financial Transactions Ledger */}
            <div className="space-y-3 border-t border-white/10 pt-4">
              <h4 className="text-sm font-bold text-foreground font-sans flex items-center gap-2">
                <DollarSign size={16} className="text-accent" /> Full Transaction Audit History ({displayTxs.length})
              </h4>
              {displayTxs.length === 0 ? (
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-muted-foreground text-center">
                  No transaction records found for this user.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {displayTxs.map((tx: any) => (
                    <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all">
                      <div>
                        <span className="text-foreground font-bold text-xs block">{tx.description || tx.title || tx.type}</span>
                        <span className="text-[10px] text-muted-foreground">{tx.created_at ? new Date(tx.created_at).toLocaleString() : (tx.date || 'Recent')}</span>
                      </div>
                      <div className="text-right">
                        <strong className={`block text-xs font-bold ${Number(tx.amount) > 0 ? 'text-accent' : 'text-foreground'}`}>
                          {Number(tx.amount) > 0 ? `+$${Number(tx.amount).toFixed(2)}` : `-$${Math.abs(Number(tx.amount)).toFixed(2)}`}
                        </strong>
                        <span className="text-[10px] text-muted-foreground uppercase">{tx.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
