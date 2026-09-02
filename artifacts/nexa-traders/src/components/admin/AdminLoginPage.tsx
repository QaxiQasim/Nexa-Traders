import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Verify credentials
    if (cleanEmail === 'link2blove@gmail.com' && password === 'Qasim@2155') {
      const adminSession = {
        email: 'Link2blove@gmail.com',
        role: 'SUPER_ADMIN',
        loginTime: new Date().toISOString(),
        token: `ADMIN-SESSION-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      };
      localStorage.setItem('nexa_admin_session', JSON.stringify(adminSession));
      setTimeout(() => {
        setLoading(false);
        window.location.href = '/admin';
      }, 600);
    } else {
      setTimeout(() => {
        setLoading(false);
        setError('Invalid Admin Email or Password. Authorization Failed.');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a09] text-foreground flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary mb-4">
            <ShieldCheck size={14} /> SECURE INSTITUTIONAL PORTAL
          </div>
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Nexa Trades Logo" className="h-9 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-black tracking-tight font-mono text-foreground">
            Nexa Trader Control Center
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Enter authorized administrator credentials to manage platform operations.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0c100e]/90 p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6">
          {error && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-400 font-mono flex items-center gap-3">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-muted-foreground mb-2 font-bold uppercase text-[10px]">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Link2blove@gmail.com"
                  className="w-full rounded-xl border border-white/15 bg-white/[0.03] pl-11 pr-4 py-3.5 text-foreground text-xs outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground mb-2 font-bold uppercase text-[10px]">
                Admin Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-white/15 bg-white/[0.03] pl-11 pr-4 py-3.5 text-foreground text-xs outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-primary via-[#f5c542] to-primary py-4 font-mono text-xs font-black uppercase tracking-wider text-primary-foreground shadow-[0_0_30px_rgba(232,185,73,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <span>Authenticating Admin...</span>
              ) : (
                <>
                  Authenticate & Login <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-white/5 pt-4 text-center">
            <span className="text-[10px] text-muted-foreground font-mono">
              Protected by Nexa Trader Cryptographic Audit Governance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
