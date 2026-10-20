import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard, Car, Calendar, Users, BarChart2,
  Plus, Pencil, Trash2, CheckCircle, XCircle, RefreshCw,
  DollarSign, TrendingUp, Clock, Eye, ArrowLeft, ChevronRight, ChevronLeft,
  MessageSquare, Filter, Shield, Settings, LogOut, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProfileAvatar from '../components/ProfileAvatar';
import { formatPrice, getImageUrl } from '../utils/formatters';

// ─── Stats Dashboard ─────────────────────────────────────────────────────────
function AdminStats() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-accent" /></div>;
  if (!stats) return <div className="py-20 text-center text-secondary font-black uppercase tracking-widest">Failed to load system data</div>;

  const cards = [
    { icon: Users, label: 'Total Residents', value: stats.totalUsers, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+12%' },
    { icon: Car, label: 'Fleet Inventory', value: stats.totalCars, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: 'Stable' },
    { icon: Calendar, label: 'Active Bookings', value: stats.totalBookings, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: '+8%' },
    { icon: DollarSign, label: 'Total Revenue', value: formatPrice(stats.totalRevenue || 0), color: 'text-indigo-500', bg: 'bg-indigo-500/10', trend: '+24%' },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <p className="text-accent font-black text-[10px] uppercase tracking-[0.4em] mb-2">{t('admin.systemsOverview')}</p>
          <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">{t('admin.controlCenter')}</h2>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 glass rounded-xl border-border flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-primary">{t('admin.systemLive')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map(({ icon: Icon, label, value, color, bg, trend }, i) => (
          <div key={i} className="premium-card p-6 group relative overflow-hidden">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-muted font-black text-[9px] uppercase tracking-widest mb-1 truncate">{label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-primary text-2xl font-black tracking-tighter whitespace-nowrap">{value}</p>
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded whitespace-nowrap ${trend.startsWith('+') ? 'text-emerald-500 bg-emerald-500/10' : 'text-muted bg-surface-2'}`}>{trend}</span>
            </div>
            {/* Subtle background decoration */}
            <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <Icon className="w-24 h-24 rotate-12" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Popular Assets */}
        <div className="lg:col-span-8 premium-card p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <h3 className="text-xl font-black text-primary uppercase tracking-tight mb-8 relative z-10 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-accent" /> High-Performance Assets
          </h3>
          <div className="space-y-4 relative z-10">
            {stats.popularCars?.map((car, i) => (
              <div key={car.id} className="flex items-center gap-6 p-5 rounded-2xl bg-surface-2 border border-border group hover:border-accent/30 transition-all">
                <span className="text-accent font-black text-xl opacity-20 w-8">0{i + 1}</span>
                <img 
                  src={getImageUrl(car.images)} 
                  className="w-24 h-16 object-cover rounded-xl shadow-md border border-border/50" 
                  alt="" 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'; }}
                />
                <div className="flex-1">
                  <p className="text-primary font-black text-sm uppercase group-hover:text-accent transition-colors">{car.title}</p>
                  <p className="text-[9px] text-muted font-bold uppercase tracking-widest">{car.brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-accent font-black text-lg leading-none">{car.bookingCount || 0}</p>
                  <p className="text-[8px] text-muted font-black uppercase tracking-widest mt-1">Reservations</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution / Quick Actions */}
        <div className="lg:col-span-4 space-y-8">
          <div className="premium-card p-10 bg-surface-2/50">
            <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-primary">{t('admin.bookingPipeline')}</h3>
            <div className="space-y-6">
              {[
                { label: 'Confirmed', val: stats.confirmedBookings, color: 'bg-emerald-500', total: stats.totalBookings },
                { label: 'Pending', val: stats.pendingBookings, color: 'bg-amber-500', total: stats.totalBookings },
                { label: 'Cancelled', val: stats.cancelledBookings, color: 'bg-rose-500', total: stats.totalBookings },
              ].map((s, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted">{s.label}</span>
                    <span className="text-primary">{s.val}</span>
                  </div>
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} transition-all duration-1000`} style={{ width: `${(s.val / s.total * 100) || 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card p-8 bg-accent text-white group overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-2">{t('admin.internalProtocol')}</p>
              <h4 className="text-xl font-black uppercase tracking-tight mb-6 leading-tight">{t('admin.generateReport')}</h4>
              <button className="px-6 py-2.5 bg-white text-accent rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                Execute Data Export
              </button>
            </div>
            <BarChart2 className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Cars Management ─────────────────────────────────────────────────────────
function AdminCars() {
  const { t } = useTranslation();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCar, setEditCar] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, car: null });
  const [form, setForm] = useState({
    title: '', brand: '', model: '', year: 2024, pricePerDay: '',
    fuelType: 'petrol', transmission: 'automatic', location: '', category: 'luxury',
    seats: 5, doors: 4, horsepower: '', description: '', availability: true, featured: false,
    images: [] // Changed from string to array for File objects
  });

  const load = () => {
    setLoading(true);
    api.get('/cars?limit=50').then(r => setCars(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const confirmDelete = async () => {
    if (!deleteModal.car) return;
    try {
      await api.delete(`/cars/${deleteModal.car.id}`);
      toast.success('Vehicle deleted successfully');
      load();
    } catch (err) {
      toast.error('Failed to delete vehicle');
    } finally {
      setDeleteModal({ show: false, car: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'images') {
          form.images.forEach(file => formData.append('images', file));
        } else {
          formData.append(key, form[key]);
        }
      });

      if (editCar) await api.put(`/cars/${editCar.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/cars', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      toast.success(editCar ? 'Updated' : 'Added');
      setShowForm(false); load();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Action failed'); 
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-10">
        <div>
          <p className="text-accent font-black text-[10px] uppercase tracking-[0.4em] mb-2">{t('admin.inventoryControl')}</p>
          <h2 className="text-4xl font-black text-primary uppercase tracking-tighter leading-none">{t('admin.fleetManager')}</h2>
        </div>
        <button onClick={() => { setEditCar(null); setForm({ title: '', brand: '', model: '', year: 2024, pricePerDay: '', fuelType: 'petrol', transmission: 'automatic', location: '', category: 'luxury', seats: 5, doors: 4, horsepower: '', description: '', availability: true, featured: false, images: [] }); setShowForm(true); }} className="btn-premium !py-3 !px-8">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {showForm && (
        <div className="premium-card p-10 mb-12 animate-fade-in">
          <h3 className="text-2xl font-black uppercase mb-8">{editCar ? 'Specifications' : 'New Intake'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input placeholder="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input-premium" required />
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Brand" value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} className="input-premium" required />
              <input placeholder="Model" value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} className="input-premium" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Year" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} className="input-premium" required />
              <input type="number" placeholder="Price / Day" value={form.pricePerDay} onChange={e => setForm(p => ({ ...p, pricePerDay: e.target.value }))} className="input-premium" required />
            </div>
            <input placeholder="Location" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="input-premium" required />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-premium md:col-span-2 min-h-[100px]" />
            <div className="md:col-span-2 space-y-4">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted ml-4">Vehicle Images (Select up to 10)</label>
              <div className="flex flex-wrap gap-4">
                <label className="w-32 h-32 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all group">
                  <Plus className="w-8 h-8 text-muted group-hover:text-accent mb-2" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted group-hover:text-accent">Upload</span>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={e => setForm(p => ({ ...p, images: [...p.images, ...Array.from(e.target.files)] }))} 
                  />
                </label>
                {form.images.map((img, i) => (
                  <div key={i} className="w-32 h-32 rounded-2xl border border-border relative overflow-hidden group">
                    <img 
                      src={img instanceof File ? URL.createObjectURL(img) : img} 
                      className="w-full h-full object-cover" 
                      alt="" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex gap-4">
              <button type="submit" className="btn-premium flex-1">Authorize Vehicle</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3 rounded-2xl border border-border font-black uppercase text-[10px] tracking-widest">Discard</button>
            </div>
          </form>
        </div>
      )}

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-2 border-b border-border text-[9px] font-black uppercase tracking-[0.2em] text-muted">
                <th className="px-8 py-5 text-left">{t('admin.identity')}</th>
                <th className="px-8 py-5 text-left">{t('admin.manufacturer')}</th>
                <th className="px-8 py-5 text-left">{t('admin.dailyRate')}</th>
                <th className="px-8 py-5 text-left">{t('admin.status')}</th>
                <th className="px-8 py-5 text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cars.map(car => (
                <tr key={car.id} className="hover:bg-accent/[0.02] transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img 
                        src={getImageUrl(car.images)} 
                        className="w-16 h-11 object-cover rounded-lg border border-border" 
                        alt="" 
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'; }}
                      />
                      <span className="font-black text-primary uppercase text-xs">{car.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-muted font-black text-[10px] uppercase tracking-widest">{car.brand}</td>
                  <td className="px-8 py-5 font-black text-accent">{formatPrice(car.pricePerDay)}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${car.availability ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {car.availability ? t('admin.active') : t('admin.inactive')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/cars/${car.id}`} target="_blank" className="p-2.5 rounded-xl glass border border-border hover:bg-emerald-500 hover:text-white transition-all"><Eye className="w-4 h-4" /></Link>
                      <button onClick={() => { 
                        let imgs = car.images;
                        if (typeof imgs === 'string') {
                          try { imgs = JSON.parse(imgs); } catch { imgs = [imgs]; }
                        }
                        setEditCar(car); 
                        setForm({ ...car, images: Array.isArray(imgs) ? imgs : [] }); 
                        setShowForm(true); 
                      }} className="p-2.5 rounded-xl glass border border-border hover:bg-accent hover:text-white transition-all"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteModal({ show: true, car: car })} className="p-2.5 rounded-xl glass border border-border hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" style={{ margin: 0, padding: 0 }}>
          <div className="premium-card max-w-md w-full p-8 border-rose-500/20 shadow-2xl shadow-rose-500/10" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 flex items-center justify-center mb-6 mx-auto">
              <Trash2 className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-2xl font-black text-center uppercase tracking-tight mb-2 text-primary">{t('admin.confirmDeletion')}</h3>
            <p className="text-center text-secondary text-sm font-medium mb-8">
              Are you sure you want to permanently remove <span className="text-primary font-black uppercase">{deleteModal.car?.title}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteModal({ show: false, car: null })}
                className="flex-1 px-6 py-3 rounded-2xl border border-border font-black uppercase text-[10px] tracking-widest hover:bg-surface-2 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 rounded-2xl bg-rose-500 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:-translate-y-1 transition-all"
              >
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Bookings Management ─────────────────────────────────────────────────────
function AdminBookings() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/bookings').then(r => setBookings(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/admin/bookings/${id}/status`, { status });
      toast.success('Status updated');
      load();
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-accent" /></div>;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-10">
        <p className="text-accent font-black text-[10px] uppercase tracking-[0.4em] mb-2">{t('admin.reservationLogistics')}</p>
        <h2 className="text-4xl font-black text-primary uppercase tracking-tighter">{t('admin.bookingControl')}</h2>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-2 border-b border-border text-[9px] font-black uppercase tracking-[0.2em] text-muted">
                <th className="px-8 py-5 text-left">{t('admin.reference')}</th>
                <th className="px-8 py-5 text-left">{t('admin.resident')}</th>
                <th className="px-8 py-5 text-left">{t('admin.asset')}</th>
                <th className="px-8 py-5 text-left">{t('admin.period')}</th>
                <th className="px-8 py-5 text-left">{t('admin.status')}</th>
                <th className="px-8 py-5 text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-accent/[0.02] transition-all">
                  <td className="px-8 py-5 font-black text-xs">#LD-{String(b.id).padStart(6, '0').toUpperCase()}</td>
                  <td className="px-8 py-5">
                    <p className="font-black text-primary text-xs uppercase">{b.user?.firstName || '—'} {b.user?.lastName || ''}</p>
                    <p className="text-[9px] text-muted font-bold">{b.user?.email || 'N/A'}</p>
                  </td>
                  <td className="px-8 py-5 text-xs font-black uppercase text-secondary">{b.car?.title || 'Unknown Vehicle'}</td>
                  <td className="px-8 py-5">
                    <p className="text-[10px] font-black text-primary">{new Date(b.startDate).toLocaleDateString()}</p>
                    <p className="text-[10px] font-black text-muted">{new Date(b.endDate).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' :
                      b.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {b.status === 'pending' && (
                        <button onClick={() => handleStatus(b.id, 'confirmed')} className="p-2 rounded-xl glass border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle className="w-4 h-4" /></button>
                      )}
                      {b.status !== 'cancelled' && (
                        <button onClick={() => handleStatus(b.id, 'cancelled')} className="p-2 rounded-xl glass border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><XCircle className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Users Management ────────────────────────────────────────────────────────
function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModal, setUserModal] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/users').then(r => setUsers(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleViewDetails = async (id) => {
    setUserModal(true);
    setLoadingUser(true);
    try {
      const { data } = await api.get('/admin/users/' + id);
      setSelectedUser(data.data);
    } catch (err) {
      toast.error('Failed to load user details');
      setUserModal(false);
    } finally {
      setLoadingUser(false);
    }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-accent" /></div>;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-10">
        <p className="text-accent font-black text-[10px] uppercase tracking-[0.4em] mb-2">{t('admin.memberDirectory')}</p>
        <h2 className="text-4xl font-black text-primary uppercase tracking-tighter">{t('admin.residentRegistry')}</h2>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-2 border-b border-border text-[9px] font-black uppercase tracking-[0.2em] text-muted">
                <th className="px-8 py-5 text-left">{t('admin.identity')}</th>
                <th className="px-8 py-5 text-left">{t('admin.location')}</th>
                <th className="px-8 py-5 text-left">{t('admin.privilege')}</th>
                <th className="px-8 py-5 text-left">{t('admin.memberSince')}</th>
                <th className="px-8 py-5 text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-accent/[0.02] transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-black uppercase shadow-sm border border-accent/10">
                        {u.firstName?.[0]}
                      </div>
                      <div>
                        <p className="font-black text-primary text-xs uppercase">{u.firstName} {u.lastName}</p>
                        <p className="text-[9px] text-muted font-bold">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-black uppercase text-secondary">{u.city || 'Not Specified'}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-accent/10 text-accent'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-[10px] font-black text-muted uppercase">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => handleViewDetails(u.id)} className="p-2.5 rounded-xl glass border border-border hover:bg-accent hover:text-white transition-all"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {userModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setUserModal(false)} />
          <div className="relative bg-surface border border-border rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-fade-in-up">
            <button onClick={() => setUserModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-2 transition-all">
              <XCircle className="w-6 h-6 text-muted" />
            </button>
            <h3 className="text-2xl font-black text-primary uppercase tracking-tight mb-6">Resident Details</h3>
            {loadingUser ? (
              <div className="py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
            ) : selectedUser ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-border pb-6">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent font-black uppercase text-2xl">
                    {selectedUser.firstName?.[0]}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-primary uppercase">{selectedUser.firstName} {selectedUser.lastName}</h4>
                    <p className="text-secondary font-medium text-sm">{selectedUser.email}</p>
                    <p className="text-muted text-[10px] font-black uppercase tracking-widest mt-1">Role: {selectedUser.role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-2 p-4 rounded-xl border border-border">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">Phone</p>
                    <p className="font-bold text-sm">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div className="bg-surface-2 p-4 rounded-xl border border-border">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">City</p>
                    <p className="font-bold text-sm">{selectedUser.city || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Recent Reservations</h5>
                  {selectedUser.bookings && selectedUser.bookings.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedUser.bookings.map(b => (
                        <div key={b.id} className="flex justify-between items-center bg-surface-2 p-3 rounded-xl border border-border text-xs">
                          <span className="font-bold text-primary">{b.car?.title}</span>
                          <span className="text-muted">{b.startDate} → {b.endDate}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted font-medium">No reservations found.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center py-4 text-rose-500">Could not load details.</p>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function AdminMessages() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/messages').then(r => setMessages(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAcknowledge = async (id) => {
    try {
      await api.put(`/admin/messages/${id}/acknowledge`);
      toast.success('Message acknowledged');
      load();
    } catch (err) {
      toast.error('Failed to acknowledge message');
    }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return toast.error('Reply cannot be empty');
    try {
      await api.put(`/admin/messages/${id}/reply`, { reply: replyText });
      toast.success('Reply sent successfully');
      setReplyingTo(null);
      setReplyText('');
      load();
    } catch (err) {
      toast.error('Failed to send reply');
    }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-accent" /></div>;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-10">
        <p className="text-accent font-black text-[10px] uppercase tracking-[0.4em] mb-2">{t('admin.communicationsHub')}</p>
        <h2 className="text-4xl font-black text-primary uppercase tracking-tighter">{t('admin.supportInbox')}</h2>
      </div>

      <div className="space-y-6">
        {messages.map(msg => (
          <div key={msg.id} className="premium-card p-10 flex flex-col md:flex-row gap-10 group hover:border-accent/50 transition-all">
            <div className="md:w-1/4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-black uppercase text-xs">
                  {msg.sender?.firstName?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-primary font-black text-xs uppercase truncate">{msg.sender?.firstName} {msg.sender?.lastName}</p>
                  <p className="text-[9px] text-muted font-bold truncate">{msg.sender?.email}</p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-surface-2 border border-border inline-block">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted mb-1">{t('admin.received')}</p>
                <p className="text-[10px] font-black text-primary">{new Date(msg.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex-1 md:border-l md:border-border md:pl-10">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-black text-primary uppercase tracking-tight">{msg.subject}</h4>
                <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-accent/10 text-accent">{msg.category || 'Support'}</span>
              </div>
              <p className="text-secondary font-medium leading-relaxed text-sm mb-8">
                {msg.body}
              </p>
              
              {msg.status && msg.status !== 'unread' && (
                <div className="mb-6 p-4 rounded-xl bg-surface-2 border border-border">
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">Status: {msg.status}</p>
                  {msg.adminReply && (
                    <p className="text-xs text-secondary font-medium">Your reply: {msg.adminReply}</p>
                  )}
                </div>
              )}
              {replyingTo === msg.id ? (
                <div className="mt-4 space-y-4">
                  <textarea
                    className="w-full bg-surface-2 border border-border rounded-xl p-4 text-sm focus:border-accent outline-none min-h-[100px]"
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  ></textarea>
                  <div className="flex gap-4">
                    <button onClick={() => handleReply(msg.id)} className="btn-premium !py-2.5 !px-8 !text-[8px]">{t('admin.sendReply', 'Send Reply')}</button>
                    <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="px-8 py-2.5 rounded-xl border border-border text-[8px] font-black uppercase tracking-widest hover:bg-surface-2 transition-all">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  {msg.status !== 'acknowledged' && msg.status !== 'replied' && (
                    <button onClick={() => handleAcknowledge(msg.id)} className="btn-premium !py-2.5 !px-8 !text-[8px]">{t('admin.acknowledge')}</button>
                  )}
                  <button onClick={() => setReplyingTo(msg.id)} className="px-8 py-2.5 rounded-xl border border-border text-[8px] font-black uppercase tracking-widest hover:bg-surface-2 transition-all">{t('admin.directReply')}</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="glass rounded-[3rem] p-24 text-center border border-border opacity-50">
            <MessageSquare className="w-16 h-16 mx-auto mb-6 text-muted opacity-20" />
            <p className="font-black uppercase tracking-[0.3em] text-xs">{t('admin.inboxCleared')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Admin Component ───────────────────────────────────────────────────
export default function AdminPage() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/admin/messages').then(r => {
      const unread = r.data.data.filter(m => m.status === 'unread').length;
      setUnreadCount(unread);
    }).catch(console.error);
  }, []);

  const NAV = [
    { path: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { path: '/admin/cars', icon: Car, label: 'Fleet' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/users', icon: Users, label: 'Residents' },
    { path: '/admin/messages', icon: MessageSquare, label: 'Inbox' },
  ];

  return (
    <div className="flex min-h-screen bg-background pt-[var(--navbar-height)] overflow-x-hidden">
      
      {/* Sidebar Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed top-32 z-50 p-1.5 glass rounded-full border border-border shadow-2xl transition-all duration-500 hover:scale-110 ${
          i18n.language === 'ar' 
            ? (isCollapsed ? 'right-20' : 'right-[19rem]') 
            : (isCollapsed ? 'left-20' : 'left-[19rem]')
        } -translate-x-1/2`}
      >
        <ChevronLeft className={`w-5 h-5 text-accent transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Sidebar */}
      <aside className={`fixed top-[var(--navbar-height)] bottom-0 bg-surface border-r border-border py-8 z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
        isCollapsed ? 'w-24 px-4' : 'w-80 px-8'
      } ${i18n.language === 'ar' ? 'right-0' : 'left-0'}`}>
        
        {/* Profile */}
        <div className={`flex items-center gap-4 rounded-2xl bg-surface-2 border border-border mb-10 transition-all duration-500 ${isCollapsed ? 'p-2 justify-center' : 'p-4'}`}>
          {user?.avatar ? (
            <img src={getImageUrl(user.avatar)} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 shadow-lg shadow-accent/20" alt="Admin" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-black uppercase shadow-lg shadow-accent/20 flex-shrink-0">
              {user?.firstName?.[0]}
            </div>
          )}
          {!isCollapsed && (
            <div className="min-w-0 animate-fade-in">
              <p className="font-black text-primary text-xs truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-accent text-[9px] font-black uppercase tracking-widest">Administrator</p>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5 flex-1">
          {NAV.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center rounded-xl font-black uppercase tracking-widest transition-all duration-300 group relative ${
                isCollapsed ? 'justify-center p-4' : 'gap-4 px-6 py-4 text-[10px]'
              } ${location.pathname === path ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-secondary hover:bg-surface-2 hover:text-accent'}`}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 flex justify-between items-center animate-fade-in">
                  <span>{label}</span>
                  {label === 'Inbox' && unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </div>
              )}
              {isCollapsed && label === 'Inbox' && unreadCount > 0 && (
                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-surface" />
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-surface border border-border rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {label}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className={`space-y-2 mt-auto transition-all duration-500 ${isCollapsed ? 'px-0' : ''}`}>
          <Link to="/dashboard" className={`flex items-center rounded-xl font-black uppercase tracking-widest text-secondary hover:bg-surface-2 transition-all group relative ${isCollapsed ? 'justify-center p-4' : 'gap-4 px-6 py-4 text-[10px]'}`}>
            <ArrowLeft className="w-4.5 h-4.5 flex-shrink-0" /> 
            {!isCollapsed && <span className="animate-fade-in">Portal</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-surface border border-border rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Portal
              </div>
            )}
          </Link>
          <button onClick={logout} className={`w-full flex items-center rounded-xl font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/5 transition-all group relative ${isCollapsed ? 'justify-center p-4' : 'gap-4 px-6 py-4 text-[10px]'}`}>
            <LogOut className="w-4.5 h-4.5 flex-shrink-0" /> 
            {!isCollapsed && <span className="animate-fade-in">Sign Out</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-surface border border-border rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Sign Out
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] p-12 overflow-y-auto ${
        i18n.language === 'ar' ? (isCollapsed ? 'mr-24' : 'mr-80') : (isCollapsed ? 'ml-24' : 'ml-80')
      }`}>
        <div className="max-w-6xl mx-auto">
          <Routes>
            <Route index element={<AdminStats />} />
            <Route path="cars" element={<AdminCars />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="*" element={<AdminStats />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
