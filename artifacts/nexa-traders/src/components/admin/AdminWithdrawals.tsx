import React, { useState } from 'react';
import { 
  ArrowUpRight, Clock, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, DollarSign, Wallet, RefreshCw 
} from 'lucide-react';
import { updateWithdrawalStatusInDb, logAdminAuditAction } from '@/lib/supabase';

interface AdminWithdrawalsProps {
  transactions: any[];
  users: any[];
  adminEmail: string;
  onRefreshData: () => void;
}

export function AdminWithdrawals({
  transactions,
  users,
  adminEmail,
  onRefreshData
}: AdminWithdrawalsProps) {
  const [selectedTxForAction, setSelectedTxForAction] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Extract all Withdrawal Transactions
  const withdrawalTxs = transactions.filter(t => t.type === 'WITHDRAWAL');
  const pendingWithdrawals = withdrawalTxs.filter(t => t.status === 'PENDING');
  const processedWithdrawals = withdrawalTxs.filter(t => t.status !== 'PENDING');

  const handleExecuteAction = async () => {
    if (!selectedTxForAction || !actionType) return;
    setLoading(true);
    setSuccessMsg('');

    const newStatus = actionType === 'APPROVE' ? 'COMPLETED' : 'REJECTED';
    const amount = Math.abs(Number(selectedTxForAction.amount) || 0);

    const success = await updateWithdrawalStatusInDb(
      selectedTxForAction.id,
      newStatus,
      selectedTxForAction.user_email,
      amount
    );

    if (success) {
      await logAdminAuditAction(
        adminEmail,
        `WITHDRAWAL_${actionType}`,
        selectedTxForAction.user_email,
        `Withdrawal ID ${selectedTxForAction.id} of $${amount.toFixed(2)} marked as ${newStatus}`
      );

      setSuccessMsg(`Withdrawal ${actionType === 'APPROVE' ? 'APPROVED & Completed' : 'REJECTED & Refunded'} successfully!`);
      setTimeout(() => {
        setLoading(false);
        setSelectedTxForAction(null);
        setActionType(null);
        setSuccessMsg('');
        onRefreshData();
      }, 1200);
    } else {
      alert('Error updating withdrawal request. Please check network connection.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black font-sans tracking-tight text-foreground flex items-center gap-2">
              <ArrowUpRight className="text-rose-400" size={24} /> Withdrawal Request Queue
            </h2>
            {pendingWithdrawals.length > 0 && (
              <span className="rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 px-3 py-1 text-xs font-bold animate-pulse">
                🔔 {pendingWithdrawals.length} Action Required
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Review institutional payout requests, verify on-chain balances, and execute secure transaction settlements.
          </p>
        </div>
      </div>

      {/* PENDING WITHDRAWALS SECTION */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground font-sans flex items-center gap-2">
          <Clock size={18} className="text-yellow-400" /> Pending Approval Requests ({pendingWithdrawals.length})
        </h3>

        {pendingWithdrawals.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#0c100e] p-8 text-center text-muted-foreground">
            <CheckCircle2 size={36} className="mx-auto text-accent mb-2 opacity-80" />
            <strong className="block text-foreground text-sm font-sans">No Pending Withdrawal Requests</strong>
            <span>All user payout requests have been reviewed and processed.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendingWithdrawals.map(tx => {
              const userObj = users.find(u => (u.email || '').toLowerCase() === (tx.user_email || '').toLowerCase());
              const amount = Math.abs(Number(tx.amount || 0));
              const availBal = Number(userObj?.wallet_balance || 0);

              return (
                <div key={tx.id} className="rounded-3xl border border-rose-500/30 bg-[#0c100e] p-6 backdrop-blur-2xl shadow-xl space-y-4 relative">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <strong className="text-foreground text-sm block font-sans">{tx.user_email}</strong>
                      <span className="text-[10px] text-muted-foreground">Tx ID: {tx.id} • {tx.created_at ? new Date(tx.created_at).toLocaleString() : 'Recent'}</span>
                    </div>
                    <span className="rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-2.5 py-1 text-[10px] font-bold">
                      PENDING
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3">
                      <span className="text-[10px] text-muted-foreground uppercase block">Requested Payout</span>
                      <strong className="text-lg font-black text-rose-400">${amount.toFixed(2)} USDT</strong>
                    </div>
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
                      <span className="text-[10px] text-muted-foreground uppercase block">User Current Balance</span>
                      <strong className="text-lg font-black text-primary">${availBal.toFixed(2)} USDT</strong>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-[11px] space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Description:</span>
                      <strong className="text-foreground">{tx.description || 'USDT BEP20 Withdrawal'}</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>User KYC State:</span>
                      <strong className="text-accent">{userObj?.kyc_status || 'UNVERIFIED'}</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSelectedTxForAction(tx);
                        setActionType('REJECT');
                      }}
                      className="w-1/2 rounded-xl border border-rose-500/50 bg-rose-500/10 py-3 font-bold text-rose-400 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <XCircle size={15} /> Reject & Refund
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTxForAction(tx);
                        setActionType('APPROVE');
                      }}
                      className="w-1/2 rounded-xl bg-gradient-to-r from-accent via-primary to-accent py-3 font-black uppercase text-primary-foreground shadow-[0_0_20px_rgba(232,185,73,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={15} /> Approve Payout
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PROCESSED WITHDRAWALS HISTORY TABLE */}
      <div className="space-y-4 pt-6">
        <h3 className="text-base font-bold text-foreground font-sans">Processed Withdrawal Ledger ({processedWithdrawals.length})</h3>

        <div className="rounded-3xl border border-white/10 bg-[#0c100e] p-6 backdrop-blur-2xl shadow-xl overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-muted-foreground text-[11px] uppercase">
                <th className="pb-3 px-4">Tx ID</th>
                <th className="pb-3 px-4">User Email</th>
                <th className="pb-3 px-4">Date & Time</th>
                <th className="pb-3 px-4">Amount</th>
                <th className="pb-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {processedWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">No processed withdrawal logs.</td>
                </tr>
              ) : (
                processedWithdrawals.map(tx => (
                  <tr key={tx.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-bold text-primary">{tx.id}</td>
                    <td className="py-3.5 px-4 text-foreground">{tx.user_email}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{tx.created_at ? new Date(tx.created_at).toLocaleString() : 'Recent'}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-400">-${Math.abs(Number(tx.amount || 0)).toFixed(2)} USDT</td>
                    <td className="py-3.5 px-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase border ${
                        tx.status === 'COMPLETED' || tx.status === 'APPROVED'
                          ? 'bg-accent/15 text-accent border-accent/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
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

      {/* CONFIRMATION MODAL BEFORE APPROVAL / REJECTION */}
      {selectedTxForAction && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0c100e] p-6 sm:p-8 shadow-2xl space-y-6 relative font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black text-foreground font-sans">
                Confirm Withdrawal {actionType}
              </h3>
              <button
                onClick={() => {
                  setSelectedTxForAction(null);
                  setActionType(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {successMsg ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 size={36} className="mx-auto text-accent animate-bounce" />
                <strong className="block text-foreground text-sm font-sans">{successMsg}</strong>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>User:</span>
                    <strong className="text-foreground">{selectedTxForAction.user_email}</strong>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Amount:</span>
                    <strong className="text-rose-400">${Math.abs(Number(selectedTxForAction.amount || 0)).toFixed(2)} USDT</strong>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tx ID:</span>
                    <strong className="text-primary">{selectedTxForAction.id}</strong>
                  </div>
                </div>

                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-[11px] text-yellow-300 flex items-center gap-2">
                  <AlertTriangle size={16} className="flex-shrink-0" />
                  <span>
                    {actionType === 'APPROVE'
                      ? 'Approving will finalize transaction status to COMPLETED.'
                      : 'Rejecting will refund the requested amount back to user wallet balance.'}
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedTxForAction(null);
                      setActionType(null);
                    }}
                    className="w-1/2 rounded-xl border border-white/20 bg-white/5 py-3 font-bold text-muted-foreground hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    onClick={handleExecuteAction}
                    className={`w-1/2 rounded-xl py-3 font-black uppercase text-white shadow-lg transition-all ${
                      actionType === 'APPROVE'
                        ? 'bg-gradient-to-r from-accent via-primary to-accent text-primary-foreground'
                        : 'bg-rose-600 hover:bg-rose-500'
                    }`}
                  >
                    {loading ? 'Processing...' : `Confirm ${actionType}`}
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
