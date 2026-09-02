import React from 'react';
import { ShieldCheck, Clock, UserCheck, AlertTriangle } from 'lucide-react';

interface AdminAuditLogsProps {
  auditLogs: any[];
}

export function AdminAuditLogs({ auditLogs }: AdminAuditLogsProps) {
  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-black font-sans tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="text-primary" size={24} /> Administrative Audit Logs
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Cryptographic audit trail recording all administrative approvals, rejections, and financial adjustments.
          </p>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0c100e] p-6 backdrop-blur-2xl shadow-xl overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground text-[11px] uppercase">
              <th className="pb-3 px-4">Date & Time</th>
              <th className="pb-3 px-4">Admin Email</th>
              <th className="pb-3 px-4">Action Executed</th>
              <th className="pb-3 px-4">Target User</th>
              <th className="pb-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  No administrative actions logged in database yet.
                </td>
              </tr>
            ) : (
              auditLogs.map((log, idx) => (
                <tr key={log.id || idx} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-primary">{log.admin_email}</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-2.5 py-1 text-[10px] font-bold uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-foreground font-bold">{log.target_user}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
