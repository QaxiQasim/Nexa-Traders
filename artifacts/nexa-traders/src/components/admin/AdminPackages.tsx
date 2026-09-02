import React from 'react';
import { Package, TrendingUp, DollarSign, Users, Award, ShieldCheck } from 'lucide-react';

interface AdminPackagesProps {
  packages: any[];
}

export function AdminPackages({ packages }: AdminPackagesProps) {
  const totalVolume = packages.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const activeCount = packages.filter(p => p.status === 'ACTIVE').length;

  // Breakdown by plan tier name
  const tiers = ['Rise', 'Surge', 'Apex', 'Zenith', 'Sovereign'];
  const tierStats = tiers.map(tierName => {
    const matching = packages.filter(p => (p.package_name || p.name || '').toLowerCase() === tierName.toLowerCase());
    const count = matching.length;
    const vol = matching.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    return { name: tierName, count, vol };
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-black font-sans tracking-tight text-foreground flex items-center gap-2">
            <Package className="text-purple-400" size={24} /> Quantitative Package Sales Analytics
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Performance breakdown across AI trading strategy subscription tiers.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-purple-500/30 bg-purple-500/5 p-5 backdrop-blur-2xl">
          <span className="text-[11px] uppercase font-bold text-purple-400 block">Total Active Subscriptions</span>
          <strong className="text-3xl font-black text-foreground font-mono mt-2 block">{activeCount} Subscriptions</strong>
        </div>

        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-5 backdrop-blur-2xl">
          <span className="text-[11px] uppercase font-bold text-primary block">Total Investment Volume</span>
          <strong className="text-3xl font-black text-primary font-mono mt-2 block">${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT</strong>
        </div>

        <div className="rounded-3xl border border-accent/30 bg-accent/5 p-5 backdrop-blur-2xl">
          <span className="text-[11px] uppercase font-bold text-accent block">Average Ticket Size</span>
          <strong className="text-3xl font-black text-accent font-mono mt-2 block">
            ${packages.length > 0 ? (totalVolume / packages.length).toFixed(2) : '0.00'} USDT
          </strong>
        </div>
      </div>

      {/* Tier Sales Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {tierStats.map(tier => (
          <div key={tier.name} className="rounded-2xl border border-white/10 bg-[#0c100e] p-4 text-center space-y-1 hover:border-primary/50 transition-all">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{tier.name} Tier</span>
            <strong className="text-xl font-black text-foreground font-mono block">${tier.vol.toLocaleString()}</strong>
            <span className="text-[10px] text-primary font-bold block">{tier.count} User Purchases</span>
          </div>
        ))}
      </div>

      {/* Package Subscriptions Table */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-foreground font-sans">Live Package Purchases ({packages.length})</h3>

        <div className="rounded-3xl border border-white/10 bg-[#0c100e] p-6 backdrop-blur-2xl shadow-xl overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-muted-foreground text-[11px] uppercase">
                <th className="pb-3 px-4">Package ID</th>
                <th className="pb-3 px-4">User Email</th>
                <th className="pb-3 px-4">Tier Name</th>
                <th className="pb-3 px-4">Purchase Date</th>
                <th className="pb-3 px-4">Investment Amount</th>
                <th className="pb-3 px-4">Daily ROI Rate</th>
                <th className="pb-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {packages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted-foreground">No package subscription records.</td>
                </tr>
              ) : (
                packages.map(pkg => (
                  <tr key={pkg.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-bold text-primary">{pkg.id}</td>
                    <td className="py-3.5 px-4 text-foreground font-bold">{pkg.user_email}</td>
                    <td className="py-3.5 px-4 text-purple-400 font-bold">{pkg.package_name || pkg.name}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{pkg.purchase_date || 'Recent'}</td>
                    <td className="py-3.5 px-4 font-bold text-primary">${Number(pkg.amount).toFixed(2)} USDT</td>
                    <td className="py-3.5 px-4 text-accent font-bold">+{pkg.daily_roi || 1.3}% / day</td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-full bg-accent/15 text-accent border border-accent/30 px-2.5 py-1 text-[10px] font-bold uppercase">
                        {pkg.status || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
