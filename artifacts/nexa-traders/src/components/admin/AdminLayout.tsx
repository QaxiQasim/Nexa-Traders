import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, LayoutDashboard, Users, Clock, ArrowUpRight, DollarSign, Package, 
  Search, Bell, LogOut, RefreshCw, X, ChevronRight, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import { 
  fetchAllUsersFromDb, 
  fetchAllAdminTransactions, 
  fetchAllAdminPackages, 
  fetchAllAdminKyc, 
  fetchAdminAuditLogs 
} from '@/lib/supabase';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminWithdrawals } from './AdminWithdrawals';
import { AdminKyc } from './AdminKyc';
import { AdminTransactions } from './AdminTransactions';
import { AdminPackages } from './AdminPackages';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminReferrals } from './AdminReferrals';

export function AdminLayout() {
  const [adminSession, setAdminSession] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('nexa_admin_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dateRange, setDateRange] = useState<string>('ALL');

  // Live Database States
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Global Search State & Selected User Drawer
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);

  // Guard: Redirect if not logged in as Admin
  useEffect(() => {
    if (!adminSession || !adminSession.token) {
      window.location.href = '/admin/login';
    }
  }, [adminSession]);

  // Load All Live Supabase Data
  const loadDatabaseData = async () => {
    setIsRefreshing(true);
    try {
      const [uData, tData, pData, kData, aData] = await Promise.all([
        fetchAllUsersFromDb(),
        fetchAllAdminTransactions(),
        fetchAllAdminPackages(),
        fetchAllAdminKyc(),
        fetchAdminAuditLogs()
      ]);

      if (Array.isArray(uData)) setUsers(uData);
      if (Array.isArray(tData)) setTransactions(tData);
      if (Array.isArray(pData)) setPackages(pData);
      if (Array.isArray(kData)) setKycRequests(kData);
      if (Array.isArray(aData)) setAuditLogs(aData);
    } catch (e) {
      console.error('Error loading database telemetry:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
    // Real-Time Polling every 10 seconds
    const interval = setInterval(loadDatabaseData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem('nexa_admin_session');
    window.location.href = '/admin/login';
  };

  // Notification items count
  const pendingWithdrawalsCount = transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING').length;
  const pendingKycCount = kycRequests.filter(k => k.status === 'PENDING').length;
  const totalNotifications = pendingWithdrawalsCount + pendingKycCount;

  // Handle Global Search Submission
  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    const term = globalSearch.trim().toLowerCase();
    const match = users.find(u => 
      (u.email || '').toLowerCase().includes(term) ||
      (u.full_name || '').toLowerCase().includes(term) ||
      (u.id || '').toLowerCase().includes(term)
    );

    if (match) {
      setSelectedUserEmail(match.email);
      setActiveTab('users');
    } else {
      alert(`No user found matching search: "${globalSearch}"`);
    }
  };

  // Mobile Sidebar Toggle State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!adminSession) return null;

  return (
    <div className="min-h-screen bg-[#070a09] text-foreground flex font-sans relative overflow-x-hidden">
      {/* Glow Effects */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 left-10 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

      {/* SIDEBAR NAVIGATION (Desktop + Mobile Drawer) */}
      <aside className={`w-72 border-r border-white/10 bg-[#090d0b]/95 backdrop-blur-2xl flex flex-col justify-between fixed md:sticky top-0 h-screen z-40 transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Nexa Trades Logo" className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(232,185,73,0.4)]" />
              <div>
                <span className="text-[10px] font-mono font-black text-primary uppercase tracking-widest block">ADMIN PORTAL</span>
                <span className="text-xs font-bold text-foreground font-mono">Control Center</span>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden rounded-xl p-1.5 text-muted-foreground hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="space-y-2 font-mono text-xs">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, badge: null },
              { id: 'users', label: 'User Directory', icon: Users, badge: users.length },
              { id: 'referrals', label: 'Referral & Team Hub', icon: Users, badge: users.length },
              { id: 'withdrawals', label: 'Withdrawal Requests', icon: ArrowUpRight, badge: pendingWithdrawalsCount || null, highlight: pendingWithdrawalsCount > 0 },
              { id: 'kyc', label: 'KYC Verifications', icon: ShieldCheck, badge: pendingKycCount || null, highlight: pendingKycCount > 0 },
              { id: 'transactions', label: 'Transactions Ledger', icon: DollarSign, badge: transactions.length },
              { id: 'packages', label: 'Packages Analytics', icon: Package, badge: packages.length },
              { id: 'audit', label: 'Audit Logs', icon: Clock, badge: auditLogs.length }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id !== 'users') setSelectedUserEmail(null);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full rounded-2xl px-4 py-3.5 font-bold flex items-center justify-between transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/30 via-primary/15 to-primary/5 text-primary border border-primary/60 shadow-[0_0_25px_rgba(232,185,73,0.25)] ring-1 ring-primary/30 translate-x-1'
                      : 'text-muted-foreground hover:bg-white/[0.07] hover:border-white/15 hover:text-foreground hover:translate-x-1 border border-transparent'
                  }`}
                >
                  {/* Left Active Indicator Bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-r-full bg-primary shadow-[0_0_12px_#e8b949]" />
                  )}

                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-xl transition-all ${
                      isActive ? 'bg-primary/20 text-primary' : item.highlight ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-muted-foreground group-hover:text-foreground'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <span className="whitespace-nowrap font-sans text-xs tracking-tight">{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold shadow-sm ${
                      item.highlight 
                        ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]' 
                        : isActive 
                        ? 'bg-primary/20 text-primary border border-primary/30' 
                        : 'bg-white/10 text-muted-foreground group-hover:bg-white/20 group-hover:text-foreground'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & System Status Widget */}
        <div className="p-6 border-t border-white/10 font-mono text-xs space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                Supabase Engine
              </span>
              <strong className="text-accent text-[10px]">CONNECTED</strong>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/20 text-primary font-bold shadow-sm">
              SA
            </div>
            <div className="truncate">
              <strong className="block text-foreground text-xs truncate font-sans">Link2blove@gmail.com</strong>
              <span className="text-[10px] text-accent font-bold">SUPERADMIN AUTHORIZED</span>
            </div>
          </div>

          <button
            onClick={handleAdminLogout}
            className="w-full rounded-2xl border border-rose-500/30 bg-rose-500/10 py-3 font-bold text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 transition-all flex items-center justify-center gap-2 text-xs shadow-md"
          >
            <LogOut size={15} /> Admin Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="sticky top-0 z-20 h-16 border-b border-white/10 bg-[#070a09]/90 backdrop-blur-2xl px-6 flex items-center justify-between gap-4 font-mono">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden rounded-xl border border-white/15 bg-white/5 p-2 text-muted-foreground hover:text-foreground"
          >
            <LayoutDashboard size={18} />
          </button>

          {/* Global User Search Box */}
          <form onSubmit={handleGlobalSearchSubmit} className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              placeholder="Global Search User (Email, ID, Name)..."
              className="w-full rounded-xl border border-white/15 bg-white/[0.03] pl-10 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary transition-all"
            />
          </form>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={loadDatabaseData}
              disabled={isRefreshing}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Refresh database records"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-primary' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(prev => !prev)}
                className="relative rounded-xl border border-white/10 bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all"
              >
                <Bell size={16} />
                {totalNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
                    {totalNotifications}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-3xl border border-white/15 bg-[#0c100e] p-5 backdrop-blur-2xl shadow-2xl space-y-3 z-50">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <strong className="text-foreground text-xs font-sans">Notifications Center</strong>
                    <span className="text-[10px] text-rose-400 font-bold">{totalNotifications} Unread</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {pendingWithdrawalsCount > 0 && (
                      <div 
                        onClick={() => {
                          setActiveTab('withdrawals');
                          setShowNotifications(false);
                        }}
                        className="p-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 cursor-pointer hover:bg-rose-500/20 transition-all flex items-center justify-between"
                      >
                        <div>
                          <strong className="block text-rose-400 text-xs">Withdrawal Request Alert</strong>
                          <span className="text-[10px] text-muted-foreground">{pendingWithdrawalsCount} pending payout requests</span>
                        </div>
                        <ChevronRight size={14} className="text-rose-400" />
                      </div>
                    )}

                    {pendingKycCount > 0 && (
                      <div 
                        onClick={() => {
                          setActiveTab('kyc');
                          setShowNotifications(false);
                        }}
                        className="p-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 cursor-pointer hover:bg-yellow-500/20 transition-all flex items-center justify-between"
                      >
                        <div>
                          <strong className="block text-yellow-400 text-xs">KYC Verification Alert</strong>
                          <span className="text-[10px] text-muted-foreground">{pendingKycCount} pending identity files</span>
                        </div>
                        <ChevronRight size={14} className="text-yellow-400" />
                      </div>
                    )}

                    {totalNotifications === 0 && (
                      <div className="py-6 text-center text-muted-foreground">
                        No pending administrative alerts.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <AdminOverview
              users={users}
              transactions={transactions}
              packages={packages}
              kycRequests={kycRequests}
              dateRange={dateRange}
              setDateRange={setDateRange}
              onSelectUser={email => {
                setSelectedUserEmail(email);
                setActiveTab('users');
              }}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsers
              users={users}
              transactions={transactions}
              packages={packages}
              kycRequests={kycRequests}
              selectedUserEmail={selectedUserEmail}
              selectedEmail={selectedUserEmail}
              onSelectUser={(email) => setSelectedUserEmail(email)}
              onClearSelectedEmail={() => setSelectedUserEmail(null)}
              onRefreshData={loadDatabaseData}
            />
          )}

          {activeTab === 'referrals' && (
            <AdminReferrals users={users} />
          )}

          {activeTab === 'withdrawals' && (
            <AdminWithdrawals
              transactions={transactions}
              users={users}
              adminEmail={adminSession.email}
              onRefreshData={loadDatabaseData}
            />
          )}

          {activeTab === 'kyc' && (
            <AdminKyc
              kycRequests={kycRequests}
              users={users}
              adminEmail={adminSession.email}
              onRefreshData={loadDatabaseData}
            />
          )}

          {activeTab === 'transactions' && (
            <AdminTransactions transactions={transactions} />
          )}

          {activeTab === 'packages' && (
            <AdminPackages packages={packages} />
          )}

          {activeTab === 'audit' && (
            <AdminAuditLogs auditLogs={auditLogs} />
          )}
        </main>
      </div>
    </div>
  );
}
