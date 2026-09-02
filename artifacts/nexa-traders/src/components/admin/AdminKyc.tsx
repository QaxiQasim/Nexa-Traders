import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, CheckCircle2, XCircle, Clock, AlertCircle, Eye 
} from 'lucide-react';
import { updateKycStatusInDb, logAdminAuditAction } from '@/lib/supabase';

interface AdminKycProps {
  kycRequests: any[];
  users: any[];
  adminEmail: string;
  onRefreshData: () => void;
}

export function AdminKyc({
  kycRequests,
  users,
  adminEmail,
  onRefreshData
}: AdminKycProps) {
  const [selectedKyc, setSelectedKyc] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const pendingKyc = kycRequests.filter(k => k.status === 'PENDING');
  const processedKyc = kycRequests.filter(k => k.status !== 'PENDING');

  const handleExecuteKycAction = async () => {
    if (!selectedKyc || !actionType) return;
    if (actionType === 'REJECT' && !rejectionReason.trim()) {
      alert('Please enter a rejection reason for the user.');
      return;
    }

    setLoading(true);
    setSuccessMsg('');

    const newStatus = actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const success = await updateKycStatusInDb(
      selectedKyc.id,
      newStatus,
      rejectionReason.trim(),
      selectedKyc.user_email
    );

    if (success) {
      await logAdminAuditAction(
        adminEmail,
        `KYC_${actionType}`,
        selectedKyc.user_email,
        `KYC request ID ${selectedKyc.id} marked as ${newStatus}`
      );

      setSuccessMsg(`KYC Submission ${actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED'} successfully!`);
      setTimeout(() => {
        setLoading(false);
        setSelectedKyc(null);
        setActionType(null);
        setRejectionReason('');
        setSuccessMsg('');
        onRefreshData();
      }, 1200);
    } else {
      alert('Error updating KYC status. Please check network connection.');
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
              <ShieldCheck className="text-yellow-400" size={24} /> KYC Identity Compliance Portal
            </h2>
            {pendingKyc.length > 0 && (
              <span className="rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-3 py-1 text-xs font-bold animate-pulse">
                🔔 {pendingKyc.length} Pending Review
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Inspect submitted user identification documents, verify authenticity, and approve/reject compliance files.
          </p>
        </div>
      </div>

      {/* PENDING KYC REQUESTS */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground font-sans flex items-center gap-2">
          <Clock size={18} className="text-yellow-400" /> Pending KYC Files ({pendingKyc.length})
        </h3>

        {pendingKyc.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#0c100e] p-8 text-center text-muted-foreground">
            <CheckCircle2 size={36} className="mx-auto text-accent mb-2 opacity-80" />
            <strong className="block text-foreground text-sm font-sans">No Pending KYC Submissions</strong>
            <span>All submitted user identification files have been processed.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendingKyc.map(kyc => {
              const userObj = users.find(u => (u.email || '').toLowerCase() === (kyc.user_email || '').toLowerCase());

              return (
                <div key={kyc.id} className="rounded-3xl border border-yellow-500/30 bg-[#0c100e] p-6 backdrop-blur-2xl shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <strong className="text-foreground text-sm block font-sans">{kyc.user_email}</strong>
                      <span className="text-[10px] text-muted-foreground">Submitted: {kyc.submitted_at ? new Date(kyc.submitted_at).toLocaleString() : 'Recent'}</span>
                    </div>
                    <span className="rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-2.5 py-1 text-[10px] font-bold">
                      PENDING
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Full Name:</span>
                      <strong className="text-foreground">{userObj?.full_name || 'Trader'}</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Document Type:</span>
                      <strong className="text-primary">{kyc.document_type || 'PASSPORT'}</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Document Number:</span>
                      <strong className="text-foreground font-mono">{kyc.document_number || 'N849102948'}</strong>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSelectedKyc(kyc);
                        setActionType('REJECT');
                      }}
                      className="w-1/2 rounded-xl border border-rose-500/50 bg-rose-500/10 py-3 font-bold text-rose-400 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <XCircle size={15} /> Reject
                    </button>
                    <button
                      onClick={() => {
                        setSelectedKyc(kyc);
                        setActionType('APPROVE');
                      }}
                      className="w-1/2 rounded-xl bg-gradient-to-r from-accent via-primary to-accent py-3 font-black uppercase text-primary-foreground shadow-[0_0_20px_rgba(232,185,73,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={15} /> Approve KYC
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PROCESSED KYC RECORDS TABLE */}
      <div className="space-y-4 pt-6">
        <h3 className="text-base font-bold text-foreground font-sans">Processed KYC Submissions ({processedKyc.length})</h3>

        <div className="rounded-3xl border border-white/10 bg-[#0c100e] p-6 backdrop-blur-2xl shadow-xl overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-muted-foreground text-[11px] uppercase">
                <th className="pb-3 px-4">User Email</th>
                <th className="pb-3 px-4">Document Type</th>
                <th className="pb-3 px-4">Document Number</th>
                <th className="pb-3 px-4">Submission Date</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {processedKyc.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">No processed KYC files recorded.</td>
                </tr>
              ) : (
                processedKyc.map(kyc => (
                  <tr key={kyc.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 text-foreground font-bold">{kyc.user_email}</td>
                    <td className="py-3.5 px-4 text-primary font-bold">{kyc.document_type || 'PASSPORT'}</td>
                    <td className="py-3.5 px-4 text-muted-foreground font-mono">{kyc.document_number}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{kyc.submitted_at ? new Date(kyc.submitted_at).toLocaleDateString() : 'Recent'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase border ${
                        kyc.status === 'APPROVED'
                          ? 'bg-accent/15 text-accent border-accent/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}>
                        {kyc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {kyc.status === 'APPROVED' ? (
                        <button
                          onClick={() => {
                            setSelectedKyc(kyc);
                            setActionType('REJECT');
                          }}
                          className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-[11px] font-bold text-rose-400 hover:bg-rose-500/20 hover:border-rose-500 transition-all flex items-center gap-1 shadow-sm"
                        >
                          <XCircle size={13} /> Revoke / Reject
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedKyc(kyc);
                            setActionType('APPROVE');
                          }}
                          className="rounded-xl border border-accent/40 bg-accent/10 px-3 py-1.5 text-[11px] font-bold text-accent hover:bg-accent/20 hover:border-accent transition-all flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 size={13} /> Re-Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC ACTION MODAL */}
      {selectedKyc && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0c100e] p-6 sm:p-8 shadow-2xl space-y-6 relative font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black text-foreground font-sans">
                Confirm KYC {actionType}
              </h3>
              <button
                onClick={() => {
                  setSelectedKyc(null);
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
                    <strong className="text-foreground">{selectedKyc.user_email}</strong>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Document:</span>
                    <strong className="text-primary">{selectedKyc.document_type} ({selectedKyc.document_number})</strong>
                  </div>
                </div>

                {actionType === 'REJECT' && (
                  <div>
                    <label className="block text-xs font-bold text-rose-400 mb-2">Rejection Reason for User (Required)</label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder="e.g. Document image blurry or expired ID..."
                      className="w-full rounded-xl border border-rose-500/40 bg-white/[0.03] p-3 text-xs text-foreground outline-none focus:border-rose-500"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedKyc(null);
                      setActionType(null);
                    }}
                    className="w-1/2 rounded-xl border border-white/20 bg-white/5 py-3 font-bold text-muted-foreground hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    onClick={handleExecuteKycAction}
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
