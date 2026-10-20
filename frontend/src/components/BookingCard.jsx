import { Calendar, Clock, MapPin, FileText, Download, XCircle, Info, Shield } from 'lucide-react';
import { formatPrice, getImageUrl } from '../utils/formatters';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  confirmed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

export default function BookingCard({ booking, onDetails, onCancel }) {
  const { user } = useAuth();

  const handleDownload = async () => {
    try {
      const response = await api.get(`/bookings/${booking.id}/receipt`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${booking.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  return (
    <div className="premium-card group hover:shadow-2xl hover:shadow-accent/5 transition-all duration-700 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row min-h-[320px]">

        {/* Left: Visual Context */}
        <div className="lg:w-80 relative overflow-hidden shrink-0">
          <img
            src={getImageUrl(booking.car?.images)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
            alt={booking.car?.title}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-black/40 lg:to-transparent" />

          <div className="absolute top-6 left-6">
            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-xl border shadow-xl ${statusColors[booking.status]}`}>
              {booking.status}
            </span>
          </div>

          <div className="absolute bottom-6 left-6 text-white lg:hidden">
            <h3 className="text-2xl font-black tracking-tight uppercase mb-1">{booking.car?.title}</h3>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{booking.car?.brand}</p>
          </div>
        </div>

        {/* Right: Rich Information */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-between">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">

            {/* Asset Identity */}
            <div className="hidden lg:block space-y-2">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-accent font-black text-[10px] uppercase tracking-[0.4em] leading-none">Vehicle ID: #LD-{booking.car?.id}</span>
              </div>
              <h3 className="text-4xl font-black text-primary uppercase tracking-tighter leading-none group-hover:text-accent transition-colors">
                {booking.car?.title}
              </h3>
              <p className="text-muted font-bold text-[10px] uppercase tracking-[0.3em]">{booking.car?.brand}</p>
            </div>

            {/* Price Identity */}
            <div className="text-left md:text-right bg-surface-2/50 lg:bg-transparent p-6 lg:p-0 rounded-3xl w-full md:w-auto">
              <p className="text-muted font-black text-[9px] uppercase tracking-[0.2em] mb-2">Total Transaction</p>
              <div className="flex flex-col">
                <span className="text-4xl font-black text-primary tracking-tighter leading-none">{formatPrice(booking.totalPrice)}</span>
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-2">
                  {booking.totalDays} {booking.totalDays > 1 ? 'Days' : 'Day'} @ {formatPrice(booking.car?.pricePerDay)}
                </span>
              </div>
            </div>
          </div>

          {/* Logistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10 py-8 border-y border-border">
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center border border-border group-hover:border-accent/20 transition-all">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-muted font-black text-[9px] uppercase tracking-widest mb-1">Commencement</p>
                  <p className="text-primary font-black text-sm">{new Date(booking.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center border border-border group-hover:border-accent/20 transition-all">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-muted font-black text-[9px] uppercase tracking-widest mb-1">Retrieval Hub</p>
                  <p className="text-primary font-black text-sm uppercase tracking-tight truncate max-w-[200px]">{booking.pickupLocation || booking.car?.location}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center border border-border group-hover:border-accent/20 transition-all">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-muted font-black text-[9px] uppercase tracking-widest mb-1">Termination</p>
                  <p className="text-primary font-black text-sm">{new Date(booking.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center border border-border group-hover:border-accent/20 transition-all">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-muted font-black text-[9px] uppercase tracking-widest mb-1">Protection Tier</p>
                  <p className="text-primary font-black text-sm uppercase">Elite Comprehensive</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => onDetails(booking)}
              className="flex-1 md:flex-none md:min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-accent text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-accent-hover transition-all shadow-xl shadow-accent/20"
            >
              <FileText className="w-4 h-4" /> Comprehensive Info
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 md:flex-none md:min-w-[180px] flex items-center justify-center gap-3 px-8 py-4 rounded-2xl glass border border-border text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:border-accent hover:text-accent transition-all"
            >
              <Download className="w-4 h-4" /> PDF Manifest
            </button>
            {(() => {
              const start = new Date(booking.startDate);
              const deadline = new Date(start);
              deadline.setDate(deadline.getDate() - 1);
              deadline.setHours(0, 0, 0, 0);
              const today = new Date();
              const canCancel = (booking.status === 'confirmed' || booking.status === 'pending') && today < deadline;
              return canCancel && onCancel ? (
                <button
                  onClick={() => onCancel(booking.id)}
                  className="flex-1 md:flex-none md:min-w-[180px] flex items-center justify-center gap-3 px-8 py-4 rounded-2xl glass border border-rose-500/30 text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all"
                >
                  <XCircle className="w-4 h-4" /> Cancel Reservation
                </button>
              ) : null;
            })()}
            <div className="hidden sm:flex items-center gap-3 ml-auto px-6 py-4 rounded-2xl bg-surface-2 border border-border">
              <Info className="w-4 h-4 text-accent" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted">Auto-Confirmed Transaction</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
