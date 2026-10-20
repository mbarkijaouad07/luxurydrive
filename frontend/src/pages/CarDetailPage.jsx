import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin, Fuel, Settings2, Users, Calendar, Star, Heart,
  ChevronLeft, ChevronRight, Zap, MessageSquare, CheckCircle, XCircle, ArrowLeft, Share2, Shield, CreditCard
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StarRating, ReviewCard } from '../components/StarRating';
import CarCard from '../components/CarCard';
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination as SwiperPagination, Autoplay } from 'swiper/modules';
import { formatPrice, getImageUrl } from '../utils/formatters';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function CarDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [car, setCar] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);

  // Booking state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' });

  // Review/Message state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [msgLoading, setMsgLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setLoading(true);
    api.get(`/cars/${id}`)
      .then(({ data }) => {
        if (data && data.data) {
          setCar(data.data);
          setSimilar(data.similar || []);
          document.title = `${data.data.title} — LuxuryDrive`;
          if (user) {
            api.get(`/favorites/check/${id}`).then(r => setFavorited(r.data.favorited)).catch(() => { });
          }
        } else {
          toast.error('Car not found');
          navigate('/cars');
        }
      })
      .catch(() => navigate('/cars'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const totalDays = startDate && endDate
    ? Math.max(0, Math.round((new Date(endDate) - new Date(startDate)) / 86400000))
    : 0;
  const totalPrice = car && totalDays > 0 ? totalDays * parseFloat(car.pricePerDay) : 0;

  const handleProceed = (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!startDate || !endDate) { toast.error('Select dates'); return; }
    if (totalDays < 1) { toast.error('Invalid date range'); return; }
    setStep(2);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (card.number.replace(/\s/g, '').length !== 16) { toast.error('Invalid card number. Must be 16 digits.'); return; }
    if (!card.expiry || !card.cvc || !card.name) { toast.error('Please fill in all card details.'); return; }

    try {
      setBookingLoading(true);
      // Simulate secure bank payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      await api.post('/bookings', { carId: car.id, startDate, endDate, paymentMethod: 'credit_card' });
      toast.success('🎉 Payment successful! Booking confirmed.');
      navigate('/dashboard?tab=bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed');
    } finally { setBookingLoading(false); }
  };

  const handleFavorite = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await api.post('/favorites/toggle', { carId: car.id });
      setFavorited(data.favorited);
      toast.success(data.message);
    } catch { toast.error('Action failed'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!car) return null;

  const images = Array.isArray(car.images) && car.images.length > 0
    ? car.images
    : (typeof car.images === 'string' && car.images.startsWith('[') ? JSON.parse(car.images) : [getImageUrl(car.images)]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-background">
      <div className="container-custom py-12">
        {/* Navigation Actions */}
        <div className="flex items-center justify-between mb-12">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-secondary hover:text-accent font-black uppercase text-[10px] tracking-widest transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Fleet
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleFavorite}
              className={`w-11 h-11 rounded-xl glass border flex items-center justify-center transition-all ${favorited ? 'border-rose-500 text-rose-500' : 'border-border text-secondary hover:text-rose-500'}`}
            >
              <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
            </button>
            <button className="w-11 h-11 rounded-xl glass border border-border flex items-center justify-center text-secondary hover:text-accent transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* Hero Section: Title & Gallery */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-accent font-black text-[9px] uppercase tracking-[0.4em]">{car.brand}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${car.availability ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="text-muted font-black text-[9px] uppercase tracking-widest">{car.category}</span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-primary uppercase tracking-tighter leading-none mb-6">
                {car.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-secondary font-bold text-sm">
                  <MapPin className="w-4 h-4 text-accent" /> {car.location}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(car.rating) ? 'text-amber-500 fill-amber-500' : 'text-muted opacity-30'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">{Number(car.rating).toFixed(1)} / 5.0</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-primary tracking-tighter">{formatPrice(car.pricePerDay)}</span>
                <span className="text-muted font-bold text-sm">/ day</span>
              </div>
            </div>
          </div>

          <div className="rounded-[3rem] overflow-hidden shadow-2xl border border-border h-[400px] md:h-[650px] relative group">
            <Swiper
              modules={[Navigation, SwiperPagination, Autoplay]}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 6000 }}
              className="w-full h-full"
            >
              {images.map((img, i) => (
                <SwiperSlide key={i}>
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            
            {/* Tabs */}
            <div className="flex gap-2 p-1.5 glass border border-border rounded-2xl overflow-x-auto no-scrollbar">
              {['overview', 'reviews', 'contact'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-accent text-white shadow-lg' : 'text-secondary hover:text-primary'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="animate-fade-in-up">
              {activeTab === 'overview' && (
                <div className="space-y-16">
                  {/* Performance Specs */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[
                      { icon: Fuel, label: 'Engine', value: car.fuelType, color: 'text-emerald-500' },
                      { icon: Settings2, label: 'Gearbox', value: car.transmission, color: 'text-blue-500' },
                      { icon: Users, label: 'Capacity', value: `${car.seats} Seats`, color: 'text-amber-500' },
                      { icon: Zap, label: 'Horsepower', value: car.horsepower ? `${car.horsepower} HP` : '650 HP', color: 'text-rose-500' },
                      { icon: Calendar, label: 'Year', value: car.year, color: 'text-indigo-500' },
                      { icon: Shield, label: 'Insurance', value: 'Included', color: 'text-violet-500' },
                    ].map(({ icon: Icon, label, value, color }, i) => (
                      <div key={i} className="premium-card p-8 group">
                        <Icon className={`w-8 h-8 ${color} mb-6 group-hover:scale-110 transition-transform`} />
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">{label}</p>
                        <p className="text-lg font-black text-primary uppercase tracking-tight">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* About */}
                  <div className="space-y-6">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-primary">The Experience</h2>
                    <p className="text-lg text-secondary leading-relaxed font-medium">
                      {car.description || "Immerse yourself in unrivaled luxury and performance. This vehicle represents the zenith of automotive design, offering a driving experience that is as exhilarating as it is refined. Every detail has been meticulously crafted for those who accept nothing less than extraordinary."}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-12">
                  {car.reviews?.length > 0 ? (
                    <div className="space-y-8">
                      {car.reviews.map(r => <ReviewCard key={r.id} review={r} />)}
                    </div>
                  ) : (
                    <div className="py-20 text-center opacity-30">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                      <p className="font-black uppercase tracking-widest text-xs">No reviews yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="premium-card p-12">
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Direct Concierge</h3>
                  <form className="space-y-6">
                    <input type="text" placeholder="Subject" className="input-premium" />
                    <textarea placeholder="How can we assist you with this reservation?" className="input-premium min-h-[150px] resize-none" />
                    <button className="btn-premium w-full">Send Message</button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Reservation Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <div className="glass p-10 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-accent" />
                
                <h3 className="text-2xl font-black uppercase tracking-tight text-primary mb-8">Reservation</h3>
                
                {car.isCurrentlyBooked ? (
                  /* Car is ACTIVELY BOOKED right now — reserved state */
                  <div className="text-center py-10 space-y-4 animate-fade-in">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-black uppercase tracking-widest text-sm text-amber-500 mb-2">Currently Reserved</p>
                      <p className="text-[11px] text-secondary font-medium leading-relaxed">This vehicle is currently on an active reservation. Check back later or explore our available fleet.</p>
                    </div>
                    <Link to="/cars" className="inline-block mt-4 px-6 py-3 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-surface-2 transition-all">
                      Browse Fleet
                    </Link>
                  </div>
                ) : !car.availability ? (
                  /* Car is MANUALLY DISABLED by admin — unavailable state */
                  <div className="text-center py-10 space-y-4 animate-fade-in">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                      <XCircle className="w-8 h-8 text-rose-500" />
                    </div>
                    <div>
                      <p className="font-black uppercase tracking-widest text-sm text-rose-500 mb-2">Unavailable</p>
                      <p className="text-[11px] text-secondary font-medium leading-relaxed">This vehicle is currently unavailable for booking. Please browse our available fleet.</p>
                    </div>
                    <Link to="/cars" className="inline-block mt-4 px-6 py-3 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-surface-2 transition-all">
                      Browse Fleet
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={step === 1 ? handleProceed : handlePayment} className="space-y-8">
                    {step === 1 ? (
                      <div className="space-y-6 animate-fade-in">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-muted ml-4">Arrival Date</label>
                          <input type="date" value={startDate} min={today} onChange={e => setStartDate(e.target.value)} className="input-premium" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-muted ml-4">Departure Date</label>
                          <input type="date" value={endDate} min={startDate || today} onChange={e => setEndDate(e.target.value)} className="input-premium" required />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5 animate-fade-in">
                        <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                          <button type="button" onClick={() => setStep(1)} className="p-2 hover:bg-surface-2 rounded-xl transition-all"><ArrowLeft className="w-4 h-4" /></button>
                          <span className="font-black uppercase tracking-widest text-xs text-primary">{t('checkout.secureCheckout')}</span>
                        </div>
                        <div className="space-y-2">
                          <input type="text" placeholder={t('checkout.cardholderName')} value={card.name} onChange={e => setCard({...card, name: e.target.value})} className="input-premium" required />
                        </div>
                        <div className="space-y-2 relative">
                          <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                          <input type="text" placeholder={t('checkout.cardNumber')} maxLength="19" value={card.number} onChange={e => {
                            let val = e.target.value.replace(/\D/g, '');
                            val = val.replace(/(.{4})/g, '$1 ').trim();
                            setCard({...card, number: val});
                          }} className="input-premium font-mono text-sm" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder={t('checkout.expiry')} maxLength="5" value={card.expiry} onChange={e => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length > 2) val = val.substring(0,2) + '/' + val.substring(2,4);
                            setCard({...card, expiry: val});
                          }} className="input-premium text-center font-mono text-sm" required />
                          <input type="text" placeholder={t('checkout.cvc')} maxLength="3" value={card.cvc} onChange={e => setCard({...card, cvc: e.target.value.replace(/\D/g, '')})} className="input-premium text-center font-mono text-sm" required />
                        </div>
                      </div>
                    )}

                    {totalDays > 0 && (
                      <div className="p-6 rounded-2xl bg-surface-2 border border-border space-y-4 animate-fade-in">
                        <div className="flex justify-between text-xs font-bold text-secondary">
                          <span>{t('checkout.fare', { days: totalDays })}</span>
                          <span className="text-primary">{formatPrice(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-emerald-500">
                          <span>{t('checkout.insurance')}</span>
                          <span>{t('checkout.included')}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-border">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t('checkout.totalPrice')}</span>
                          <span className="text-3xl font-black text-accent">{formatPrice(totalPrice)}</span>
                        </div>
                      </div>
                    )}

                    <button type="submit" disabled={bookingLoading} className="btn-premium w-full !py-5 shadow-2xl shadow-accent/20 uppercase tracking-[0.2em] text-[10px]">
                      {bookingLoading ? 'Processing...' : (step === 1 ? 'Proceed to Payment' : `` + t('checkout.pay', { amount: formatPrice(totalPrice) }) + ``)}
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 opacity-40 grayscale group hover:grayscale-0 transition-all duration-500">
                      <Shield className="w-4 h-4 text-accent" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t('checkout.guaranteedSecure')}</span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Fleet */}
        {similar.length > 0 && (
          <div className="mt-32">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-12 text-primary">Alternative <span className="text-accent">Elite</span> Fleet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {similar.map(c => <CarCard key={c.id} car={c} />)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
