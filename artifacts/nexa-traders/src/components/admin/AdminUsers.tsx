import React, { useState } from 'react';
import { 
  Users, Search, Filter, ShieldCheck, Clock, AlertCircle, X, 
  ArrowDownRight, ArrowUpRight, Package, DollarSign, ExternalLink, Calendar 
} from 'lucide-react';

interface AdminUsersProps {
  users: any[];
  transactions: any[];
  packages: any[];
  kycRequests: any[];
  selectedUserEmail: string | null;
  onSelectUser: (email: string | null) => void;
}

export function AdminUsers({
  users,
  transactions,
  packages,
  kycRequests,
  selectedUserEmail,
  onSelectUser
}: AdminUsersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
  const selectedUserObj = selectedUserEmail 
    ? users.find(u => u.email.toLowerCase() === selectedUserEmail.toLowerCase()) || { email: selectedUserEmail, full_name: selectedUserEmail.split('@')[0], wallet_balance: 0 }
    : null;

  const userTxs = selectedUserEmail ? transactions.filter(t => (t.user_email || '').toLowerCase() === selectedUserEmail.toLowerCase()) : [];
  const userPkgs = selectedUserEmail ? packages.filter(p => (p.user_email || '').toLowerCase() === selectedUserEmail.toLowerCase()) : [];
  const userKyc = selectedUserEmail ? kycRequests.find(k => (k.user_email || '').toLowerCase() === selectedUserEmail.toLowerCase()) : null;

  const userTotalDeposits = userTxs.filter(t => t.type === 'DEPOSIT' && t.status === 'COMPLETED').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const userTotalWithdrawals = userTxs.filter(t => t.type === 'WITHDRAWAL' && (t.status === 'COMPLETED' || t.status === 'APPROVED')).reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
  const userPendingWithdrawals = userTxs.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING').reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
  const userPackageInvested = userPkgs.reduce((sum, p) => sum + Number(p.amount || 0), 0);

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
                const pkgsCount = packages.filter(p => (p.user_email || '').toLowerCase() === user.email.toLowerCase()).length;
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
                        onClick={() => onSelectUser(user.email)}
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
                <span className="text-[10px] uppercase text-primary font-bold">USER 360° AUDIT PROFILE</span>
                <h3 className="text-xl font-black text-foreground font-sans">{selectedUserObj.full_name || selectedUserObj.email}</h3>
                <span className="text-xs text-muted-foreground">{selectedUserObj.email}</span>
              </div>
              <button
                onClick={() => onSelectUser(null)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3.5">
                <span className="text-[10px] uppercase text-muted-foreground block">Available Balance</span>
                <strong className="text-lg font-black text-primary">${Number(selectedUserObj.wallet_balance || 0).toFixed(2)}</strong>
              </div>
              <div className="rounded-2xl border border-accent/30 bg-accent/5 p-3.5">
                <span className="text-[10px] uppercase text-muted-foreground block">Total Deposited</span>
                <strong className="text-lg font-black text-accent">${userTotalDeposits.toFixed(2)}</strong>
              </div>
              <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-3.5">
                <span className="text-[10px] uppercase text-muted-foreground block">Total Withdrawn</span>
                <strong className="text-lg font-black text-orange-400">${userTotalWithdrawals.toFixed(2)}</strong>
              </div>
              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-3.5">
                <span className="text-[10px] uppercase text-muted-foreground block">Package Volume</span>
                <strong className="text-lg font-black text-purple-400">${userPackageInvested.toFixed(2)}</strong>
              </div>
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-3.5">
                <span className="text-[10px] uppercase text-muted-foreground block">Pending Withdrawal</span>
                <strong className="text-lg font-black text-rose-400">${userPendingWithdrawals.toFixed(2)}</strong>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                <span className="text-[10px] uppercase text-muted-foreground block">KYC Status</span>
                <strong className="text-xs font-black text-foreground">{selectedUserObj.kyc_status || 'UNVERIFIED'}</strong>
              </div>
            </div>

            {/* Subscribed Packages History */}
            <div className="space-y-3 border-t border-white/10 pt-4">
              <h4 className="text-sm font-bold text-foreground font-sans flex items-center gap-2">
                <Package size={16} className="text-purple-400" /> Active Package Subscriptions ({userPkgs.length})
              </h4>
              {userPkgs.length === 0 ? (
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-muted-foreground text-center">
                  No active package purchases found.
                </div>
              ) : (
                <div className="space-y-2">
                  {userPkgs.map(pkg => (
                    <div key={pkg.id} className="flex justify-between items-center p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                      <div>
                        <strong className="text-foreground text-xs block">{pkg.package_name || pkg.name} Plan</strong>
                        <span className="text-[10px] text-muted-foreground">Purchased: {pkg.purchase_date || 'Recent'}</span>
                      </div>
                      <span className="font-bold text-primary text-xs">${Number(pkg.amount).toFixed(2)} USDT</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial Transactions Ledger */}
            <div className="space-y-3 border-t border-white/10 pt-4">
              <h4 className="text-sm font-bold text-foreground font-sans flex items-center gap-2">
                <DollarSign size={16} className="text-accent" /> Transaction Audit History ({userTxs.length})
              </h4>
              {userTxs.length === 0 ? (
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-muted-foreground text-center">
                  No transaction records.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userTxs.map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                      <div>
                        <span className="text-foreground font-bold text-xs block">{tx.description || tx.type}</span>
                        <span className="text-[10px] text-muted-foreground">{tx.created_at ? new Date(tx.created_at).toLocaleString() : 'Recent'}</span>
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
