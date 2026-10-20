import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Car, ArrowRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      toast.error('Credentials required for access.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Invalid email format.');
      return;
    }

    try {
      setLoading(true);
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.firstName}! 👋`);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-32 bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />

      <div className="w-full max-w-[480px] relative z-10 animate-fade-in-up">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-[2rem] mb-8 border border-accent/20">
            <Car className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tighter mb-4">Elite Portal</h1>
          <p className="text-muted font-black uppercase tracking-[0.3em] text-[10px]">Access your luxury collection</p>
        </div>

        <div className="glass rounded-[3.5rem] p-10 md:p-12 border border-border shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-4">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="name@exclusive.com"
                  className="input-premium pl-16"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-4">Password</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="input-premium pl-16 pr-16"
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-6 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors">
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
               <button type="button" className="text-[10px] text-muted font-black uppercase tracking-widest hover:text-accent transition-colors">Recover Credentials</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full !py-6 text-base shadow-2xl shadow-accent/20"
            >
              {loading ? (
                <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-3">
                  Sign In <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-muted font-bold text-sm">
              New to LuxuryDrive?
              <Link to="/register" className="text-accent hover:underline font-black uppercase tracking-widest text-[11px] ml-3">
                Join the Fleet
              </Link>
            </p>
          </div>

          {/* Quick Access */}
          <div className="mt-10 p-6 rounded-3xl bg-surface-2 border border-border relative overflow-hidden group">
            <Zap className="absolute -right-4 -bottom-4 w-20 h-20 text-accent/5" />
            <p className="font-black text-accent uppercase tracking-widest text-[9px] mb-4 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> Rapid Access
            </p>
            <div className="space-y-2 relative z-10">
                <p className="text-[10px] text-secondary font-bold">Admin: <span className="text-primary">admin@luxurydrive.ma</span> / <span className="text-primary">admin123</span></p>
                <p className="text-[10px] text-secondary font-bold">Member: <span className="text-primary">youssef@demo.ma</span> / <span className="text-primary">user1234</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
