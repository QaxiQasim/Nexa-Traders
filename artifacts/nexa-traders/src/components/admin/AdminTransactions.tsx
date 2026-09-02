import React, { useState } from 'react';
import { DollarSign, Search, Filter, ArrowDownRight, ArrowUpRight, Package, Clock } from 'lucide-react';

interface AdminTransactionsProps {
  transactions: any[];
}

export function AdminTransactions({ transactions }: AdminTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredTxs = transactions.filter(t => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
      (t.user_email || '').toLowerCase().includes(term) ||
      (t.id || '').toLowerCase().includes(term) ||
      (t.description || '').toLowerCase().includes(term);

    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-black font-sans tracking-tight text-foreground flex items-center gap-2">
            <DollarSign className="text-accent" size={24} /> Financial Transaction Ledger
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Cryptographic ledger logging deposits, withdrawals, package subscriptions, and ROI distributions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search Email, Tx ID..."
              className="w-full rounded-xl border border-white/15 bg-white/[0.03] pl-10 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="rounded-xl border border-white/15 bg-[#0c100e] px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
          >
            <option value="ALL">All Types</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="PACKAGE_PURCHASE">Package Purchase</option>
            <option value="DAILY_ROI">Daily ROI</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/15 bg-[#0c100e] px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0c100e] p-6 backdrop-blur-2xl shadow-xl overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground text-[11px] uppercase">
              <th className="pb-3 px-4">Tx ID</th>
              <th className="pb-3 px-4">User Email</th>
              <th className="pb-3 px-4">Date & Time</th>
              <th className="pb-3 px-4">Type</th>
              <th className="pb-3 px-4">Description</th>
              <th className="pb-3 px-4">Amount</th>
              <th className="pb-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTxs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                  No transaction records matching search criteria.
                </td>
              </tr>
            ) : (
              filteredTxs.map(tx => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-all">
                  <td className="py-3.5 px-4 font-bold text-primary">{tx.id ? tx.id.substring(0, 10) : 'N/A'}</td>
                  <td className="py-3.5 px-4 text-foreground font-bold">{tx.user_email}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {tx.created_at ? new Date(tx.created_at).toLocaleString() : 'Recent'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase border ${
                      tx.type === 'DEPOSIT' ? 'bg-accent/15 text-accent border-accent/30' :
                      tx.type === 'WITHDRAWAL' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                      tx.type === 'PACKAGE_PURCHASE' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' :
                      'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-foreground">{tx.description || tx.type}</td>
                  <td className={`py-3.5 px-4 font-bold text-sm ${Number(tx.amount) > 0 ? 'text-accent' : 'text-rose-400'}`}>
                    {Number(tx.amount) > 0 ? `+$${Number(tx.amount).toFixed(2)}` : `-$${Math.abs(Number(tx.amount)).toFixed(2)}`}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase border ${
                      tx.status === 'COMPLETED' || tx.status === 'APPROVED' ? 'bg-accent/15 text-accent border-accent/30' :
                      tx.status === 'PENDING' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                      'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
