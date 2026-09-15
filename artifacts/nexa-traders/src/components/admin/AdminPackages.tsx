import React, { useState } from 'react';
import { Package, TrendingUp, DollarSign, Users, Award, ShieldCheck, Coins, CheckCircle2, AlertCircle, X, RefreshCw, Search } from 'lucide-react';
import { manuallyCreditPackageRoiInDb } from '@/lib/supabase';

interface AdminPackagesProps {
  packages: any[];
  onRefreshData?: () => void;
}

export function AdminPackages({ packages, onRefreshData }: AdminPackagesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPkgForRoi, setSelectedPkgForRoi] = useState<any | null>(null);
  const [roiCreditAmount, setRoiCreditAmount] = useState<string>('');
  const [isCrediting, setIsCrediting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const totalVolume = packages.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const activeCount = packages.filter(p => p.status === 'ACTIVE' || !p.status).length;

  // Breakdown by plan tier name
  const tiers = ['Rise', 'Surge', 'Apex', 'Zenith', 'Sovereign'];
  const tierStats = tiers.map(tierName => {
    const matching = packages.filter(p => (p.package_name || p.name || '').toLowerCase().includes(tierName.toLowerCase()));
    const count = matching.length;
    const vol = matching.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    return { name: tierName, count, vol };
  });

  const filteredPackages = packages.filter(pkg => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (pkg.id || '').toLowerCase().includes(term) ||
      (pkg.user_email || pkg.email || '').toLowerCase().includes(term) ||
      (pkg.package_name || pkg.name || '').toLowerCase().includes(term)
    );
  });

  const handleOpenRoiModal = (pkg: any) => {
    setSelectedPkgForRoi(pkg);
    const defaultAmount = Number(pkg.daily_roi ?? pkg.dailyRoi) || (Number(pkg.amount) * 0.013) || 1.3;
    setRoiCreditAmount(defaultAmount.toFixed(2));
    setStatusMessage(null);
  };

  const handleConfirmRoiCredit = async () => {
    if (!selectedPkgForRoi) return;
    const amount = Number(roiCreditAmount);
    if (isNaN(amount) || amount <= 0) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid ROI amount greater than $0' });
      return;
    }

    setIsCrediting(true);
    setStatusMessage(null);

    try {
      const res = await manuallyCreditPackageRoiInDb(selectedPkgForRoi.id, amount);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Successfully credited $${(res.amountCredited || 0).toFixed(2)} USDT Daily ROI to ${res.userEmail}! Updated wallet: $${(res.updatedWallet || 0).toFixed(2)} USDT.`
        });
        if (onRefreshData) {
          onRefreshData();
        }
        setTimeout(() => {
          setSelectedPkgForRoi(null);
        }, 1800);
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Failed to credit ROI' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Server error crediting ROI' });
    } finally {
      setIsCrediting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-black font-sans tracking-tight text-foreground flex items-center gap-2">
            <Package className="text-purple-400" size={24} /> Quantitative Package Sales & Manual ROI Control
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Performance breakdown across subscription tiers & manual Daily ROI payout controls.
          </p>
        </div>
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-foreground hover:bg-white/10 transition-all self-start sm:self-auto"
          >
            <RefreshCw size={14} /> Refresh Packages Data
          </button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-purple-500/30 bg-purple-500/5 p-5 backdrop-blur-2xl">
          <span className="text-[11px] uppercase font-bold text-purple-400 block">Total Active Subscriptions</span>
          <strong className="text-3xl font-black text-foreground font-sans mt-2 block">{activeCount} Subscriptions</strong>
        </div>

        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-5 backdrop-blur-2xl">
          <span className="text-[11px] uppercase font-bold text-primary block">Total Investment Volume</span>
          <strong className="text-3xl font-black text-primary font-sans mt-2 block">${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT</strong>
        </div>

        <div className="rounded-3xl border border-accent/30 bg-accent/5 p-5 backdrop-blur-2xl">
          <span className="text-[11px] uppercase font-bold text-accent block">Average Ticket Size</span>
          <strong className="text-3xl font-black text-accent font-sans mt-2 block">
            ${packages.length > 0 ? (totalVolume / packages.length).toFixed(2) : '0.00'} USDT
          </strong>
        </div>
      </div>

      {/* Tier Sales Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {tierStats.map(tier => (
          <div key={tier.name} className="rounded-2xl border border-white/10 bg-[#0c100e] p-4 text-center space-y-1 hover:border-primary/50 transition-all">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{tier.name} Tier</span>
            <strong className="text-xl font-black text-foreground font-sans block">${tier.vol.toLocaleString()}</strong>
            <span className="text-[10px] text-primary font-bold block">{tier.count} User Purchases</span>
          </div>
        ))}
      </div>

      {/* Package Subscriptions Table & Filter */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-foreground font-sans">Live Package Purchases ({filteredPackages.length})</h3>

          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filter by package ID or email..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs outline-none focus:border-primary font-sans"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0c100e] p-6 backdrop-blur-2xl shadow-xl overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-muted-foreground text-[11px] uppercase">
                <th className="pb-3 px-4">Package ID</th>
                <th className="pb-3 px-4">User Email</th>
                <th className="pb-3 px-4">Tier Name</th>
                <th className="pb-3 px-4">Purchase Date</th>
                <th className="pb-3 px-4">Investment</th>
                <th className="pb-3 px-4">Daily ROI Rate</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4 text-right">Manual Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-muted-foreground">No package subscription records match search.</td>
                </tr>
              ) : (
                filteredPackages.map(pkg => (
                  <tr key={pkg.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-bold text-primary">{pkg.id}</td>
                    <td className="py-3.5 px-4 text-foreground font-bold">{pkg.user_email || pkg.email}</td>
                    <td className="py-3.5 px-4 text-purple-400 font-bold">{pkg.package_name || pkg.name}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{pkg.purchase_date || 'Recent'}</td>
                    <td className="py-3.5 px-4 font-bold text-primary">${Number(pkg.amount).toFixed(2)} USDT</td>
                    <td className="py-3.5 px-4 text-accent font-bold">${Number(pkg.daily_roi || pkg.dailyRoi || (pkg.amount * 0.013)).toFixed(2)} / day</td>
                    <td className="py-3.5 px-4">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${
                        pkg.status === 'COMPLETED'
                          ? 'bg-muted/30 text-muted-foreground border-white/10'
                          : 'bg-accent/15 text-accent border-accent/30'
                      }`}>
                        {pkg.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenRoiModal(pkg)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 transition-all"
                        title="Manually credit daily ROI for this package"
                      >
                        <Coins size={14} /> Credit Daily ROI
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANUAL DAILY ROI MODAL */}
      {selectedPkgForRoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-3xl border border-primary/40 bg-[#0d1310] p-6 sm:p-8 shadow-2xl space-y-6 relative font-sans">
            <button
              onClick={() => setSelectedPkgForRoi(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-accent/30 bg-accent/15 text-accent">
                <Coins size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground font-sans">Manual Daily ROI Payout</h3>
                <p className="text-xs text-muted-foreground font-sans">
                  Package ID: <span className="text-primary font-bold">{selectedPkgForRoi.id}</span>
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target User:</span>
                <strong className="text-foreground">{selectedPkgForRoi.user_email || selectedPkgForRoi.email}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package Name:</span>
                <strong className="text-purple-400">{selectedPkgForRoi.package_name || selectedPkgForRoi.name} (${Number(selectedPkgForRoi.amount).toFixed(2)} USDT)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Standard 1-Day ROI Rate:</span>
                <strong className="text-accent">${Number(selectedPkgForRoi.daily_roi || selectedPkgForRoi.dailyRoi || (selectedPkgForRoi.amount * 0.013)).toFixed(2)} USDT</strong>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-muted-foreground">Current Earned ROI:</span>
                <span className="text-foreground">${Number(selectedPkgForRoi.earned_roi || selectedPkgForRoi.earnedRoi || 0).toFixed(2)} / ${(Number(selectedPkgForRoi.total_roi_cap || selectedPkgForRoi.totalRoiCap || (selectedPkgForRoi.amount * 1.85))).toFixed(2)} USDT</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">
                Enter ROI Amount to Credit (USDT):
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={roiCreditAmount}
                  onChange={e => setRoiCreditAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-8 pr-4 text-sm font-bold text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                This amount will be added directly to the user's wallet balance and updated on their package ROI tracker.
              </p>
            </div>

            {statusMessage && (
              <div className={`rounded-xl border p-3 text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-rose-500/40 bg-rose-500/10 text-rose-400'
              }`}>
                {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedPkgForRoi(null)}
                className="flex-1 rounded-2xl border border-white/15 bg-white/5 py-3 text-xs font-semibold text-foreground hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRoiCredit}
                disabled={isCrediting}
                className="flex-1 rounded-2xl bg-gradient-to-r from-primary via-[#f5c542] to-primary py-3 text-xs font-bold text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {isCrediting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Crediting ROI...
                  </>
                ) : (
                  <>
                    <Coins size={14} /> Confirm & Credit ROI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
