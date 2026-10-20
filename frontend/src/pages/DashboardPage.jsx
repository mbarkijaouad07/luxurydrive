import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  User, Calendar, Heart, MessageSquare, Settings, LogOut,
  ChevronRight, CheckCircle, XCircle, Clock, MapPin,
  FileText, Download, Shield, Bell, CreditCard, Car, Lock, Eye, EyeOff, AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import CarCard from '../components/CarCard';
import ProfileAvatar from '../components/ProfileAvatar';
import toast from 'react-hot-toast';
import ReceiptModal from '../components/ReceiptModal';
import BookingCard from '../components/BookingCard';
import { formatPrice } from '../utils/formatters';

const statusColors = {
  confirmed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { user, updateUser, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'profile');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/messages/my').then(r => {
      const unread = r.data.data.filter(m => m.status === 'replied').length;
      setUnreadCount(unread);
    }).catch(console.error);
  }, []);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Profile form state
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
      });
    }
  }, [user]);

  useEffect(() => {
    document.title = `${t('nav.dashboard')} — LuxuryDrive`;
  }, [t]);

  // ── Fetch counts on first load so the header stats are immediately correct ──
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [bookingsRes, favoritesRes] = await Promise.all([
          api.get('/bookings/my'),
          api.get('/favorites/my'),
        ]);
        setBookings(bookingsRes.data.data);
        setFavorites(favoritesRes.data.data);
      } catch (err) {
        console.error('Failed to fetch counts:', err);
      }
    };
    fetchCounts();
  }, []); // runs once on mount

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        if (tab === 'bookings') {
          const { data } = await api.get('/bookings/my');
          setBookings(data.data);
        } else if (tab === 'favorites') {
          const { data } = await api.get('/favorites/my');
          setFavorites(data.data);
        } else if (tab === 'messages') {
          const { data } = await api.get('/messages/my');
          setMessages(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tab]);

  // Password change state
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, newPass: false, confirm: false });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      const { data } = await api.put('/auth/profile', profile);
      updateUser(data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? This action cannot be undone.')) return;
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      toast.success('Reservation cancelled successfully.');
      // Refresh bookings list
      const { data } = await api.get('/bookings/my');
      setBookings(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwords.newPass.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    try {
      setPwLoading(true);
      await api.put('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success('Password updated successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      setAvatarLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(data.user);
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setAvatarLoading(false);
    }
  };

  const TABS = [
    { id: 'profile', icon: User, label: 'Account' },
    { id: 'bookings', icon: Calendar, label: 'Reservations' },
    { id: 'favorites', icon: Heart, label: 'Collection' },
    { id: 'messages', icon: MessageSquare, label: 'Support' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="container-custom py-12">
        {/* Profile Header */}
        <div className="glass rounded-[3rem] p-10 mb-12 border border-border shadow-xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />

          <ProfileAvatar
            user={user}
            onUpload={handleAvatarUpload}
            loading={avatarLoading}
          />

          <div className="text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-primary tracking-tighter uppercase">
                {user?.firstName} {user?.lastName}
              </h1>
              <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-accent/10 text-accent border border-accent/20">
                Gold Member
              </span>
            </div>
            <p className="text-secondary font-medium mb-6">{user?.email}</p>

            {user?.role === 'admin' && (
              <Link to="/admin" className="inline-flex items-center gap-2 bg-text-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
                <Shield className="w-4 h-4" /> Admin Portal
              </Link>
            )}
          </div>

          <div className="hidden lg:flex ml-auto gap-12">
            <div className="text-center">
              <p className="text-muted text-[9px] font-black uppercase tracking-widest mb-1">Bookings</p>
              <p className="text-3xl font-black text-primary tracking-tighter">{bookings.length}</p>
            </div>
            <div className="text-center">
              <p className="text-muted text-[9px] font-black uppercase tracking-widest mb-1">Favorites</p>
              <p className="text-3xl font-black text-primary tracking-tighter">{favorites.length}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-12">
          {/* Nav Sidebar */}
          <aside className="w-full">
            <div className="glass rounded-[2rem] p-3 border border-border sticky top-32">
              <nav className="space-y-1">
                {TABS.map(({ id: tabId, icon: Icon, label }) => (
                  <button
                    key={tabId}
                    onClick={() => { setTab(tabId); setSearchParams({ tab: tabId }); }}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${tab === tabId ? 'bg-accent text-white shadow-lg' : 'text-secondary hover:text-accent hover:bg-accent/5'}`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {label}
                    <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-transform ${tab === tabId ? 'opacity-100' : 'opacity-0 -translate-x-2'}`} />
                  </button>
                ))}
              </nav>
              <div className="h-px bg-border my-4 mx-4" />
              <button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] text-rose-500 hover:bg-rose-500/5 transition-all">
                <LogOut className="w-4.5 h-4.5" /> {t('nav.logout')}
              </button>
            </div>
          </aside>

          {/* Content Area */}
          <main className="min-w-0">
            {tab === 'profile' && (
              <div className="premium-card animate-fade-in-up">
                <div className="p-8 border-b border-border bg-surface-2/30">
                  <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Identity & Security</h2>
                  <p className="text-muted text-[11px] font-medium mt-1">Manage your personal information and contact settings.</p>
                </div>
                <form onSubmit={handleProfileSave} className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-4">First Name</label>
                      <input type="text" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} className="input-premium" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-4">Last Name</label>
                      <input type="text" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} className="input-premium" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-4">Email Address</label>
                    <input type="email" value={profile.email} className="input-premium opacity-50 cursor-not-allowed" disabled />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-4">Phone</label>
                      <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="input-premium" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-4">City</label>
                      <input type="text" value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} className="input-premium" />
                    </div>
                  </div>
                  <div className="pt-4">
                    <button type="submit" disabled={profileLoading} className="btn-premium !px-12">
                      {profileLoading ? 'Processing...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {tab === 'bookings' && (
              <div className="space-y-8 animate-fade-in-up">
                <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Active Reservations</h2>
                {loading ? (
                  <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : bookings.length === 0 ? (
                  <div className="glass rounded-[2rem] p-20 text-center border border-border">
                    <Calendar className="w-16 h-16 text-muted mx-auto mb-6 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-xs text-secondary">No reservations found</p>
                    <Link to="/cars" className="btn-premium mt-8 !py-3 !px-10">Start Booking</Link>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {bookings.map(b => (
                      <BookingCard
                        key={b.id}
                        booking={b}
                        onDetails={setSelectedBooking}
                        onCancel={handleCancelBooking}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'favorites' && (
              <div className="animate-fade-in-up">
                <h2 className="text-2xl font-black text-primary uppercase tracking-tight mb-8">Personal Collection</h2>
                {favorites.length === 0 ? (
                  <div className="glass rounded-[2rem] p-20 text-center border border-border">
                    <Heart className="w-16 h-16 text-muted mx-auto mb-6 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-xs text-secondary">Your collection is empty</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {favorites.map(car => <CarCard key={car.id} car={car} />)}
                  </div>
                )}
              </div>
            )}

            {tab === 'messages' && (
              <div className="space-y-8 animate-fade-in-up">
                <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Support History</h2>
                {messages.length === 0 ? (
                  <div className="glass rounded-[2rem] p-20 text-center border border-border">
                    <MessageSquare className="w-16 h-16 text-muted mx-auto mb-6 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-xs text-secondary">No active tickets</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map(msg => (
                      <div key={msg.id} className="premium-card p-8">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-black text-primary uppercase tracking-tight">{msg.subject}</h4>
                            <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${msg.status === 'replied' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                              {msg.status}
                            </span>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted">{new Date(msg.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-medium text-secondary leading-relaxed mb-6">{msg.body}</p>

                        {msg.adminReply && (
                          <div className="mb-6 p-4 rounded-xl bg-surface-2 border border-accent/20 relative">
                            <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">Support Response</p>
                            <p className="text-sm font-medium text-primary leading-relaxed">{msg.adminReply}</p>
                          </div>
                        )}

                        {msg.car && (
                          <div className="flex items-center gap-4 p-3 rounded-xl bg-surface-2 border border-border w-fit">
                            <img src={msg.car.images?.[0]} className="w-12 h-8 object-cover rounded-lg" alt="" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{msg.car.title}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'settings' && (
              <div className="space-y-8 animate-fade-in-up">
                <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Settings</h2>

                {/* Account Summary */}
                <div className="premium-card p-8">
                  <div className="p-0 border-b border-border pb-6 mb-8">
                    <h3 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-3">
                      <User className="w-5 h-5 text-accent" /> Account Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Full Name', value: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '—' },
                      { label: 'Email Address', value: user?.email || '—' },
                      { label: 'Phone', value: user?.phone || 'Not provided' },
                      { label: 'City', value: user?.city || 'Not provided' },
                      { label: 'Account Role', value: user?.role === 'admin' ? 'Administrator' : 'Member' },
                      { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-5 rounded-2xl bg-surface-2 border border-border">
                        <p className="text-muted font-black text-[9px] uppercase tracking-widest mb-1">{label}</p>
                        <p className="text-primary font-bold text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Change Password */}
                <div className="premium-card">
                  <div className="p-8 border-b border-border bg-surface-2/30">
                    <h3 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-3">
                      <Lock className="w-5 h-5 text-accent" /> Change Password
                    </h3>
                    <p className="text-muted text-[11px] font-medium mt-1">Update your password to keep your account secure.</p>
                  </div>
                  <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
                    {[
                      { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                      { key: 'newPass', label: 'New Password', placeholder: 'Enter new password (min 6 chars)' },
                      { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key} className="space-y-2">
                        <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-4">{label}</label>
                        <div className="relative">
                          <input
                            type={showPw[key] ? 'text' : 'password'}
                            placeholder={placeholder}
                            value={passwords[key]}
                            onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                            className="input-premium pr-14"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
                          >
                            {showPw[key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4">
                      <button type="submit" disabled={pwLoading} className="btn-premium !px-12">
                        {pwLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Notification Preferences */}
                <div className="premium-card">
                  <div className="p-8 border-b border-border bg-surface-2/30">
                    <h3 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-3">
                      <Bell className="w-5 h-5 text-accent" /> Notification Preferences
                    </h3>
                  </div>
                  <div className="p-8 space-y-6">
                    {[
                      { label: 'Booking Confirmations', desc: 'Receive email when a booking is confirmed' },
                      { label: 'Promotional Offers', desc: 'Exclusive deals and new fleet additions' },
                      { label: 'Reservation Reminders', desc: 'Reminders before your reservation starts' },
                    ].map(({ label, desc }, i) => (
                      <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-surface-2 border border-border">
                        <div>
                          <p className="text-primary font-black text-sm">{label}</p>
                          <p className="text-muted text-[10px] font-medium mt-0.5">{desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={i === 0} className="sr-only peer" />
                          <div className="w-11 h-6 bg-border peer-focus:ring-2 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-accent after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="premium-card border-rose-500/20">
                  <div className="p-8 border-b border-rose-500/20 bg-rose-500/5">
                    <h3 className="text-lg font-black text-rose-500 uppercase tracking-tight flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5" /> Danger Zone
                    </h3>
                  </div>
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                      <div>
                        <p className="text-primary font-black text-sm">Delete Account</p>
                        <p className="text-muted text-[10px] font-medium mt-0.5">Permanently remove your account and all associated data. This cannot be undone.</p>
                      </div>
                      <button
                        onClick={() => toast.error('Please contact support to delete your account.')}
                        className="px-8 py-3 rounded-xl border border-rose-500/40 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all whitespace-nowrap"
                      >
                        Request Deletion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {selectedBooking && (
        <ReceiptModal
          booking={selectedBooking}
          user={user}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
