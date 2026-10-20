import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Car, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', city: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error('All required fields must be completed.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid luxury email address.');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters for security.');
      return;
    }

    try {
      setLoading(true);
      const data = await register(form);
      toast.success(`Welcome to the fleet, ${data.user.firstName}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration protocol failed.');
    } finally { setLoading(false); }
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-32 bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-accent/10 rounded-full blur-[180px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] animate-pulse pointer-events-none" />

      <div className="w-full max-w-[640px] relative z-10 animate-fade-in-up">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-[2rem] mb-8 border border-accent/20">
            <Car className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tighter mb-4">Join the Fleet</h1>
          <p className="text-muted font-black uppercase tracking-[0.3em] text-[10px]">MOROCCO'S PREMIER LUXURY RENTAL</p>
        </div>

        <div className="glass rounded-[3.5rem] p-10 md:p-12 border border-border shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-4">First Name</label>
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
                  <input type="text" value={form.firstName} onChange={set('firstName')} placeholder="Jaouad" className="input-premium pl-16" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-4">Last Name</label>
                <input type="text" value={form.lastName} onChange={set('lastName')} placeholder="Mbarki" className="input-premium" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-4">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className="input-premium pl-16" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-4">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min 6 characters"
                  className="input-premium pl-16 pr-16"
                  required minLength={6}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-6 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors">
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-4">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+212..." className="input-premium pl-16" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-4">Primary City</label>
                <div className="relative group">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
                  <input type="text" value={form.city} onChange={set('city')} placeholder="Casablanca" className="input-premium pl-16" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-premium w-full !py-6 text-base shadow-2xl shadow-accent/20 mt-4">
              {loading ? (
                <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-3">
                  Create Account <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-muted font-bold text-sm">
              Already a member?
              <Link to="/login" className="text-accent hover:underline font-black uppercase tracking-widest text-[11px] ml-3">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
