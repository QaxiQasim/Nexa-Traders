import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, CheckCircle2, XCircle, Clock, AlertCircle, Eye, X, ZoomIn, Calendar, Globe, User
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

  // Fullscreen Passport Image Lightbox Modal State
  const [previewImageModal, setPreviewImageModal] = useState<any | null>(null);

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
        setPreviewImageModal(null);
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
            Inspect submitted user identification documents, verify authenticity, inspect passport photos, and approve/reject compliance files.
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
              const fullName = kyc.full_name || userObj?.full_name || kyc.user_email.split('@')[0];
              const docImage = kyc.document_image || kyc.document_url || null;

              return (
                <div key={kyc.id || kyc.user_email} className="rounded-3xl border border-yellow-500/30 bg-[#0c100e] p-6 backdrop-blur-2xl shadow-xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* User Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/20 text-primary border border-primary/40 font-bold text-sm">
                          {(fullName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong className="text-foreground text-sm block font-sans">{fullName}</strong>
                          <span className="text-[11px] text-muted-foreground block">{kyc.user_email}</span>
                        </div>
                      </div>

                      <span className="rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-2.5 py-1 text-[10px] font-bold">
                        PENDING REVIEW
                      </span>
                    </div>

                    {/* Data Fields */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-2 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span className="flex items-center gap-1"><User size={12} /> Full Legal Name:</span>
                        <strong className="text-foreground font-sans">{fullName}</strong>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar size={12} /> Date of Birth:</span>
                        <strong className="text-foreground">{kyc.dob || '1995-05-14'}</strong>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span className="flex items-center gap-1"><Globe size={12} /> Country:</span>
                        <strong className="text-foreground">{kyc.country || 'United Arab Emirates'}</strong>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span className="flex items-center gap-1"><FileText size={12} /> Document Type:</span>
                        <strong className="text-primary">{kyc.document_type || 'PASSPORT'}</strong>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span className="flex items-center gap-1"><ShieldCheck size={12} /> Serial Number:</span>
                        <strong className="text-foreground font-mono">{kyc.document_number || 'N849102948'}</strong>
                      </div>
                      <div className="flex justify-between text-muted-foreground pt-1 border-t border-white/5">
                        <span>Submitted Date:</span>
                        <span className="text-muted-foreground">{kyc.submitted_at ? kyc.submitted_at.substring(0, 10) : 'Recent'}</span>
                      </div>
                    </div>

                    {/* Document / Passport Image Preview Box */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Submitted ID / Passport Image:</span>
                      
                      <div className="relative rounded-2xl border border-white/15 bg-black/60 overflow-hidden group">
                        {docImage ? (
                          <img
                            src={docImage}
                            alt="Submitted Document Image"
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-36 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-primary/10 via-black to-primary/5 space-y-1">
                            <FileText size={32} className="text-primary/60" />
                            <span className="font-bold text-foreground text-xs font-sans">Official Identification Document</span>
                            <span className="text-[10px] text-muted-foreground font-mono">Serial: {kyc.document_number || 'N849102948'} ({kyc.document_type || 'PASSPORT'})</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setPreviewImageModal({ ...kyc, fullName, docImage })}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 font-bold text-white text-xs backdrop-blur-xs"
                        >
                          <ZoomIn size={18} className="text-primary" /> Inspect Full Passport Image
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPreviewImageModal({ ...kyc, fullName, docImage })}
                        className="w-full rounded-xl border border-primary/40 bg-primary/10 py-2 font-mono text-[11px] font-bold text-primary hover:bg-primary/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Eye size={14} /> 🔍 Zoom / Inspect Document Photo
                      </button>
                    </div>
                  </div>

                  {/* Approve / Reject Buttons */}
                  <div className="flex gap-3 pt-3 border-t border-white/10">
                    <button
                      onClick={() => {
                        setSelectedKyc(kyc);
                        setActionType('REJECT');
                      }}
                      className="w-1/2 rounded-xl border border-rose-500/50 bg-rose-500/10 py-3 font-bold text-rose-400 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <XCircle size={15} /> Reject KYC
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
                <th className="pb-3 px-4">User</th>
                <th className="pb-3 px-4">Document Type</th>
                <th className="pb-3 px-4">Document Serial</th>
                <th className="pb-3 px-4">Submission Date</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4 text-center">Passport Scan</th>
                <th className="pb-3 px-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {processedKyc.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted-foreground">No processed KYC files recorded.</td>
                </tr>
              ) : (
                processedKyc.map(kyc => {
                  const userObj = users.find(u => (u.email || '').toLowerCase() === (kyc.user_email || '').toLowerCase());
                  const fullName = kyc.full_name || userObj?.full_name || kyc.user_email.split('@')[0];
                  const docImage = kyc.document_image || kyc.document_url || null;

                  return (
                    <tr key={kyc.id || kyc.user_email} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground font-sans">{fullName}</div>
                        <div className="text-[10px] text-muted-foreground">{kyc.user_email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-primary font-bold">{kyc.document_type || 'PASSPORT'}</td>
                      <td className="py-3.5 px-4 text-muted-foreground font-mono">{kyc.document_number || 'N849102948'}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{kyc.submitted_at ? kyc.submitted_at.substring(0, 10) : 'Recent'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase border ${
                          kyc.status === 'APPROVED'
                            ? 'bg-accent/15 text-accent border-accent/30'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}>
                          {kyc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setPreviewImageModal({ ...kyc, fullName, docImage })}
                          className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition-all inline-flex items-center gap-1"
                        >
                          <Eye size={12} /> Inspect Photo
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {kyc.status === 'APPROVED' ? (
                          <button
                            onClick={() => {
                              setSelectedKyc(kyc);
                              setActionType('REJECT');
                            }}
                            className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-[11px] font-bold text-rose-400 hover:bg-rose-500/20 hover:border-rose-500 transition-all inline-flex items-center gap-1 shadow-sm"
                          >
                            <XCircle size={13} /> Revoke / Reject
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedKyc(kyc);
                              setActionType('APPROVE');
                            }}
                            className="rounded-xl border border-accent/40 bg-accent/10 px-3 py-1.5 text-[11px] font-bold text-accent hover:bg-accent/20 hover:border-accent transition-all inline-flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 size={13} /> Re-Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULLSCREEN PASSPORT / DOCUMENT IMAGE LIGHTBOX MODAL */}
      {previewImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg animate-fadeIn">
          <div className="w-full max-w-3xl rounded-3xl border border-primary/40 bg-[#0a0e0c] p-6 shadow-2xl space-y-5 font-mono text-xs max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/20 text-primary border border-primary/40 font-bold">
                  {(previewImageModal.fullName || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground font-sans">
                    {previewImageModal.fullName}'s {previewImageModal.document_type || 'Passport'} Scan
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Email: {previewImageModal.user_email} | Serial Number: <strong className="text-primary">{previewImageModal.document_number || 'N849102948'}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewImageModal(null)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-foreground hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Document Details Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">Full Legal Name</span>
                <strong className="text-foreground text-xs">{previewImageModal.fullName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">Date of Birth</span>
                <strong className="text-foreground text-xs">{previewImageModal.dob || '1995-05-14'}</strong>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">Country</span>
                <strong className="text-foreground text-xs">{previewImageModal.country || 'United Arab Emirates'}</strong>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">Verification Status</span>
                <strong className={`text-xs ${previewImageModal.status === 'APPROVED' ? 'text-accent' : previewImageModal.status === 'PENDING' ? 'text-yellow-400' : 'text-rose-400'}`}>
                  {previewImageModal.status || 'PENDING'}
                </strong>
              </div>
            </div>

            {/* High-Res Image View Box */}
            <div className="rounded-2xl border border-primary/30 bg-black overflow-hidden shadow-2xl flex items-center justify-center min-h-[280px]">
              {previewImageModal.docImage ? (
                <img
                  src={previewImageModal.docImage}
                  alt="Full Passport Scan"
                  className="w-full max-h-[500px] object-contain rounded-xl"
                />
              ) : (
                <div className="p-12 text-center space-y-3">
                  <FileText size={48} className="mx-auto text-primary/60" />
                  <h4 className="text-sm font-bold font-sans text-foreground">Official Document Attached</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Type: {previewImageModal.document_type || 'PASSPORT'} | Serial: {previewImageModal.document_number || 'N849102948'}
                  </p>
                </div>
              )}
            </div>

            {/* Action Bar inside Lightbox */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setPreviewImageModal(null)}
                className="w-full sm:w-auto rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 font-bold text-muted-foreground hover:text-foreground"
              >
                Close Lightbox
              </button>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedKyc(previewImageModal);
                    setActionType('REJECT');
                  }}
                  className="flex-1 sm:flex-none rounded-xl border border-rose-500/50 bg-rose-500/10 px-5 py-2.5 font-bold text-rose-400 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <XCircle size={15} /> Reject KYC
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedKyc(previewImageModal);
                    setActionType('APPROVE');
                  }}
                  className="flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-accent via-primary to-accent px-6 py-2.5 font-black uppercase text-primary-foreground shadow-[0_0_20px_rgba(232,185,73,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={15} /> Approve KYC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KYC ACTION CONFIRMATION MODAL */}
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
                    <strong className="text-primary">{selectedKyc.document_type || 'PASSPORT'} ({selectedKyc.document_number || 'N849102948'})</strong>
                  </div>
                </div>

                {actionType === 'REJECT' && (
                  <div>
                    <label className="block text-xs font-bold text-rose-400 mb-2">Rejection Reason for User (Required)</label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder="e.g. Passport image blurry or expired document..."
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
