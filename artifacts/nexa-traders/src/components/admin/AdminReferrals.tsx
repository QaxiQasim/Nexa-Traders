import React, { useState } from 'react';
import { 
  Users, Search, Network, ArrowUpRight, Copy, Check, ShieldCheck, 
  ChevronRight, Sparkles, Filter, Database, UserCheck, Layers, GitBranch
} from 'lucide-react';
import { fetchDirectReferralsFromDb, fetchFullTeamHierarchyFromDb } from '@/lib/supabase';

interface AdminReferralsProps {
  users: any[];
}

export function AdminReferrals({ users }: AdminReferralsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userTree, setUserTree] = useState<any[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Compute Referral Metrics
  const usersWithSponsors = users.filter(u => u.sponsor_email || u.sponsor_code);
  const usersWithRefCodes = users.filter(u => u.referral_code);

  const getDirectCount = (userEmail: string, refCode?: string) => {
    return users.filter(u => 
      (u.sponsor_email && u.sponsor_email.toLowerCase() === userEmail.toLowerCase()) ||
      (refCode && u.sponsor_code && u.sponsor_code.toUpperCase() === refCode.toUpperCase())
    ).length;
  };

  const getNetworkTree = (userEmail: string, refCode?: string) => {
    const direct = users.filter(u => 
      (u.sponsor_email && u.sponsor_email.toLowerCase() === userEmail.toLowerCase()) ||
      (refCode && u.sponsor_code && u.sponsor_code.toUpperCase() === refCode.toUpperCase())
    );

    const tree: Array<{ user: any; level: number; sponsorEmail: string }> = [];
    for (const d of direct) {
      tree.push({ user: d, level: 1, sponsorEmail: userEmail });
      const level2 = users.filter(u => 
        (u.sponsor_email && u.sponsor_email.toLowerCase() === d.email?.toLowerCase()) ||
        (d.referral_code && u.sponsor_code && u.sponsor_code.toUpperCase() === d.referral_code.toUpperCase())
      );
      for (const l2 of level2) {
        tree.push({ user: l2, level: 2, sponsorEmail: d.email });
        const level3 = users.filter(u => 
          (u.sponsor_email && u.sponsor_email.toLowerCase() === l2.email?.toLowerCase()) ||
          (l2.referral_code && u.sponsor_code && u.sponsor_code.toUpperCase() === l2.referral_code.toUpperCase())
        );
        for (const l3 of level3) {
          tree.push({ user: l3, level: 3, sponsorEmail: l2.email });
        }
      }
    }
    return tree;
  };

  const handleViewTree = async (user: any) => {
    setSelectedUser(user);
    setTreeLoading(true);
    const tree = getNetworkTree(user.email, user.referral_code);
    setUserTree(tree);
    setTreeLoading(false);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered Users List
  const filteredUsers = users.filter(u => {
    const q = searchTerm.toLowerCase();
    return (
      (u.email || '').toLowerCase().includes(q) ||
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.referral_code || '').toLowerCase().includes(q) ||
      (u.sponsor_email || '').toLowerCase().includes(q) ||
      (u.sponsor_code || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
              Direct Referral & Sponsor Manager
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Real-time Database Direct Referrals & Direct Sponsor Attribution
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top.1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search email, ref code, sponsor..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-xs font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0d1310] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Total Registered</span>
            <Users size={18} className="text-primary" />
          </div>
          <div className="mt-3 text-3xl font-bold font-mono text-foreground">{users.length}</div>
          <p className="mt-1 text-[10px] text-muted-foreground font-mono">Platform Accounts</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1310] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Active Ref Codes</span>
            <Sparkles size={18} className="text-accent" />
          </div>
          <div className="mt-3 text-3xl font-bold font-mono text-accent">{usersWithRefCodes.length}</div>
          <p className="mt-1 text-[10px] text-accent/80 font-mono">Unique Codes Generated</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1310] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Referred Members</span>
            <Network size={18} className="text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-bold font-mono text-emerald-400">{usersWithSponsors.length}</div>
          <p className="mt-1 text-[10px] text-emerald-400/80 font-mono">Registered via Sponsor Link</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1310] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Network Ratio</span>
            <GitBranch size={18} className="text-purple-400" />
          </div>
          <div className="mt-3 text-3xl font-bold font-mono text-purple-400">
            {users.length > 0 ? `${((usersWithSponsors.length / users.length) * 100).toFixed(0)}%` : '0%'}
          </div>
          <p className="mt-1 text-[10px] text-purple-400/80 font-mono">Referral Adoption Rate</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-white/10 bg-[#090e0c]/90 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-primary" />
            <h3 className="text-sm font-bold font-mono text-foreground">User Referral Directory</h3>
          </div>
          <span className="text-xs font-mono text-muted-foreground">Showing {filteredUsers.length} Users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-white/5 border-b border-white/10 text-muted-foreground uppercase text-[10px]">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Referral Code</th>
                <th className="px-6 py-4">Sponsor / Referrer</th>
                <th className="px-6 py-4 text-center">Direct Ref</th>
                <th className="px-6 py-4 text-center">Total Network</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No user profiles found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const directCount = getDirectCount(user.email, user.referral_code);
                  const totalTree = getNetworkTree(user.email, user.referral_code);
                  const refCode = user.referral_code || 'N/A';

                  return (
                    <tr key={user.id || user.email} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 border border-primary/30 font-bold text-primary">
                            {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-foreground font-sans">{user.full_name || 'User'}</div>
                            <div className="text-[11px] text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleCopy(refCode)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
                          title="Click to copy code"
                        >
                          {refCode}
                          {copiedCode === refCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        {user.sponsor_email || user.sponsor_code ? (
                          <div className="space-y-0.5">
                            <span className="text-xs text-foreground font-semibold block">
                              {user.sponsor_code ? `Code: ${user.sponsor_code}` : 'Direct Link'}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">{user.sponsor_email || 'Verified Sponsor'}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60 italic">Direct Organic Registration</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center font-bold text-foreground">
                        <span className={`px-2 py-1 rounded-md ${directCount > 0 ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground'}`}>
                          {directCount} Users
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center font-bold">
                        <span className={`px-2 py-1 rounded-md ${totalTree.length > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-muted-foreground'}`}>
                          {totalTree.length} Total
                        </span>
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {user.created_at ? user.created_at.substring(0, 10) : '2026-09-02'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewTree(user)}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-primary/20 hover:text-primary hover:border-primary/40 transition-all inline-flex items-center gap-1.5"
                        >
                          <GitBranch size={13} /> Network Tree
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REFERRAL HIERARCHY TREE MODAL DRAWER */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-3xl rounded-2xl border border-primary/40 bg-[#0b100d] p-6 shadow-2xl space-y-6 font-mono text-xs max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/20 text-primary border border-primary/40 font-bold">
                  {(selectedUser.full_name || selectedUser.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground font-sans">
                    {selectedUser.full_name || 'User'}'s Referral Hierarchy
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Email: {selectedUser.email} | Code: <strong className="text-primary">{selectedUser.referral_code}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* Tree Summary KPIs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <span className="text-[10px] text-muted-foreground uppercase block">Direct L1 Referrals</span>
                <span className="text-xl font-bold text-primary">{getDirectCount(selectedUser.email, selectedUser.referral_code)}</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <span className="text-[10px] text-muted-foreground uppercase block">Total Network Team</span>
                <span className="text-xl font-bold text-emerald-400">{userTree.length}</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <span className="text-[10px] text-muted-foreground uppercase block">Max Depth Level</span>
                <span className="text-xl font-bold text-accent">
                  {userTree.length > 0 ? Math.max(...userTree.map(t => t.level)) : 0} Levels
                </span>
              </div>
            </div>

            {/* Tree Network List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <GitBranch size={14} className="text-primary" /> Visual Network Tree
              </h4>

              {userTree.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-muted-foreground">
                  User currently has zero team members registered under their referral code.
                </div>
              ) : (
                <div className="space-y-2">
                  {userTree.map((item, index) => {
                    const indent = item.level === 1 ? 'ml-0' : item.level === 2 ? 'ml-6' : 'ml-12';
                    const levelBadge = item.level === 1 ? 'bg-primary/20 text-primary border-primary/30' : item.level === 2 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30';

                    return (
                      <div
                        key={item.user.id || item.user.email || index}
                        className={`${indent} rounded-xl border border-white/10 bg-white/[0.03] p-3 flex items-center justify-between transition-all hover:border-primary/40`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground text-sm">{item.level === 1 ? '├──' : '└──'}</span>
                          <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 font-bold text-xs">
                            {(item.user.full_name || item.user.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-foreground font-sans text-xs">
                              {item.user.full_name || item.user.email.split('@')[0]}
                            </div>
                            <div className="text-[10px] text-muted-foreground">{item.user.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-muted-foreground">
                            Sponsor: {item.sponsorEmail}
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${levelBadge}`}>
                            Level {item.level}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
