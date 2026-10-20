import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare, Send, Upload, Shield, AlertCircle,
  CheckCircle, FileText, Phone, Mail, Clock, HelpCircle, Loader2
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  'General Inquiry',
  'Technical Issue',
  'Billing/Payment',
  'Reservation Modification',
  'Vehicle Condition',
  'Insurance/Accident',
  'Feedback'
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-emerald-500 bg-emerald-500/10' },
  { value: 'medium', label: 'Medium', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'high', label: 'High', color: 'text-rose-500 bg-rose-500/10' }
];

export default function ReclamationPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    category: '',
    priority: 'medium',
    reservationId: '',
    phone: user?.phone || '',
    image: ''
  });

  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to submit a ticket');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.body || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await api.post('/messages', formData);
      toast.success('Your ticket has been submitted. Our concierge team will contact you shortly.');
      setFormData({
        subject: '',
        body: '',
        category: '',
        priority: 'medium',
        reservationId: '',
        phone: user?.phone || '',
        image: ''
      });
      setCharCount(0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container-custom py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-16">
            <div className="space-y-6">
              <p className="text-accent font-black text-[10px] uppercase tracking-[0.4em]">Support Concierge</p>
              <h1 className="text-4xl md:text-7xl font-black text-primary uppercase tracking-tighter leading-none">
                How can we <span className="text-accent">Assist</span> You?
              </h1>
              <p className="text-lg text-secondary font-medium leading-relaxed max-w-md">
                Experience unparalleled support. Our dedicated concierge team is available 24/7 to ensure your journey is flawless.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: Phone, title: 'Priority Line', info: '+212 522 000 000', sub: '24/7 Dedicated Support' },
                { icon: Mail, title: 'Direct Email', info: 'concierge@luxurydrive.ma', sub: 'Instant Response Team' },
              ].map((item, i) => (
                <div key={i} className="glass p-8 rounded-[2.5rem] border border-border flex items-center gap-8 group hover:border-accent transition-all duration-500 shadow-xl">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">{item.title}</p>
                    <p className="text-xl font-black text-primary tracking-tight">{item.info}</p>
                    <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="premium-card p-10 bg-accent/5 border-accent/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <HelpCircle className="w-12 h-12 text-accent mb-6" />
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">Visit Help Center</h3>
              <p className="text-sm font-medium text-secondary mb-8">Browse our frequently asked questions for instant solutions to common inquiries.</p>
              <button className="btn-premium !py-3 !px-8">Browse FAQs</button>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <div className="glass p-10 md:p-16 rounded-[4rem] border border-border shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-accent" />
              
              <div className="flex items-center gap-4 mb-12">
                <MessageSquare className="w-8 h-8 text-accent" />
                <h2 className="text-3xl font-black uppercase tracking-tight">Open Support Ticket</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted ml-4">Identity</label>
                    <input value={user?.firstName + ' ' + user?.lastName} disabled className="input-premium opacity-50 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted ml-4">Email</label>
                    <input value={user?.email} disabled className="input-premium opacity-50 cursor-not-allowed" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted ml-4">Category *</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="input-premium appearance-none"
                      required
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted ml-4">Reservation ID</label>
                    <input
                      placeholder="#LD-XXXX"
                      value={formData.reservationId}
                      onChange={e => setFormData({ ...formData, reservationId: e.target.value })}
                      className="input-premium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted ml-4">Subject *</label>
                  <input
                    placeholder="Briefly describe your request"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="input-premium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-4">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted">Detailed Description *</label>
                    <span className="text-[9px] font-black text-muted">{charCount} / 1000</span>
                  </div>
                  <textarea
                    placeholder="Provide as much detail as possible for a faster resolution..."
                    value={formData.body}
                    onChange={e => {
                      setFormData({ ...formData, body: e.target.value });
                      setCharCount(e.target.value.length);
                    }}
                    className="input-premium min-h-[200px] resize-none"
                    required
                    maxLength={1000}
                  />
                </div>

                <div className="pt-6">
                  <button type="submit" disabled={loading} className="btn-premium w-full !py-6 text-base shadow-2xl shadow-accent/20 flex items-center justify-center gap-4">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-6 h-6" /> Transmit Ticket</>}
                  </button>
                  <div className="flex items-center justify-center gap-3 mt-8 text-[9px] font-black uppercase tracking-widest text-muted opacity-60">
                    <AlertCircle className="w-4 h-4 text-accent" />
                    Priority processing for elite members
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
