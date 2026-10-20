import { CheckCircle, Calendar, MapPin, User, Fuel, Zap, Download, X } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import api from '../services/api';

export default function ReceiptModal({ booking, user, onClose }) {
  if (!booking) return null;

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-background rounded-[3rem] border border-border shadow-3xl overflow-hidden animate-zoom-in">
        
        {/* Header */}
        <div className="bg-surface p-10 border-b border-border relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 w-12 h-12 rounded-full glass flex items-center justify-center text-theme-muted hover:text-theme-accent transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
             <div className="bg-theme-accent p-2.5 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-theme-accent">Official Reservation Receipt</span>
          </div>
          <h2 className="text-4xl font-black text-theme-primary tracking-tighter uppercase mb-2">
            Luxury<span className="text-theme-accent">Drive</span>
          </h2>
          <p className="text-theme-muted text-xs font-bold uppercase tracking-widest">Reservation ID: #LD-{booking.id.toString().padStart(6, '0')}</p>
        </div>

        {/* Content */}
        <div className="p-10 space-y-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted">Client Details</p>
              <div className="space-y-1">
                <p className="font-black text-theme-primary">{user.firstName} {user.lastName}</p>
                <p className="text-sm font-medium text-theme-secondary">{user.email}</p>
                <p className="text-sm font-medium text-theme-secondary">{user.phone || 'No phone provided'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted">Vehicle Selection</p>
              <div className="space-y-1">
                <p className="font-black text-theme-primary">{booking.car?.title}</p>
                <p className="text-sm font-medium text-theme-secondary">{booking.car?.category} • {booking.car?.transmission}</p>
                <p className="text-sm font-medium text-theme-secondary">{booking.car?.location}</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[2rem] bg-surface border border-border space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-theme-accent" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted">Pickup</p>
                  <p className="font-bold text-theme-primary">{new Date(booking.startDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
              </div>
              <div className="h-10 w-px bg-theme-border hidden sm:block" />
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-theme-accent" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted">Return</p>
                  <p className="font-bold text-theme-primary">{new Date(booking.endDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted">Price Breakdown</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold text-theme-secondary">
                <span>Daily Rate ({formatPrice(booking.car?.pricePerDay)} × {booking.totalDays} days)</span>
                <span>{formatPrice(booking.totalPrice - 50)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-theme-secondary">
                <span>Premium Protection & Concierge Fee</span>
                <span>{formatPrice(50)}</span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-border">
                <span className="font-black uppercase tracking-[0.2em] text-xs text-theme-primary">Grand Total Paid</span>
                <span className="text-4xl font-black gradient-text">{formatPrice(booking.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-10 bg-surface border-t border-border flex gap-4">
          <button 
            onClick={handleDownload}
            className="btn-premium flex-1 flex items-center justify-center gap-3 !py-5"
          >
            <Download className="w-5 h-5" />
            Download PDF Invoice
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-5 rounded-[1.5rem] border border-border font-black uppercase tracking-widest text-[10px] text-theme-secondary hover:bg-background transition-all"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
