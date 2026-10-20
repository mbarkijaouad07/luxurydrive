import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Star, Shield, Clock, ArrowRight, ChevronDown, Zap, Award, Users } from 'lucide-react';
import api from '../services/api';
import CarCard from '../components/CarCard';
import { CarCardSkeleton } from '../components/Skeleton';

const TESTIMONIALS = [
  { name: 'Karim Benali', city: 'Casablanca', rating: 5, text: 'Absolutely incredible experience! The Tesla Model S was in perfect condition. Will definitely book again!', avatar: 'K' },
  { name: 'Sarah El Mansouri', city: 'Marrakech', rating: 5, text: 'LuxuryDrive exceeded all my expectations. The Ferrari was a dream come true for my anniversary trip.', avatar: 'S' },
  { name: 'Omar Tazi', city: 'Rabat', rating: 5, text: 'Professional service from start to finish. The Range Rover was spotless and delivery was on time.', avatar: 'O' },
];

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès',
  'Oujda', 'Tétouan', 'Safi', 'Mohammedia', 'El Jadida', 'Béni Mellal',
  'Nador', 'Kenitra', 'Essaouira', 'Laâyoune', 'Dakhla', 'Ouarzazate',
  'Ifrane', 'Chefchaouen', 'Errachidia', 'Taroudant', 'Tiznit'
];

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [cities, setCities] = useState([]);

  const STATS = [
    { icon: <Zap />, value: '500+', label: t('stats.cars', 'Premium Cars') },
    { icon: <MapPin />, value: '15+', label: t('stats.cities', 'Cities') },
    { icon: <Star />, value: '4.9', label: t('stats.rating', 'Average Rating') },
    { icon: <Users />, value: '10K+', label: t('stats.clients', 'Happy Clients') },
  ];

  useEffect(() => {
    document.title = `LuxuryDrive — ${t('hero.title_span', 'Dream Car')}`;
    Promise.all([
      api.get('/cars?featured=true&limit=6'),
      api.get('/cars/locations')
    ]).then(([carsRes, locRes]) => {
      setFeaturedCars(carsRes.data.data);
      const apiCities = Array.isArray(locRes.data.data) ? locRes.data.data : [];
      const merged = [...new Set([...MOROCCAN_CITIES, ...apiCities])].sort();
      setCities(merged);
    }).catch(() => {
      setCities([...MOROCCAN_CITIES]);
    }).finally(() => setLoading(false));
  }, [t]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('location', city);
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <div className="bg-background">
      {/* ─── Hero Section ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlays */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50" />
        </div>

        <div className="container-custom relative z-10 pt-20">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 glass px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-8 animate-fade-in-up">
              <Award className="w-4 h-4" />
              {t('hero.badge', "Morocco's #1 Luxury Fleet")}
            </div>

            <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-black leading-[0.85] tracking-tighter text-primary mb-8 animate-fade-in-up uppercase">
              {t('hero.title_part1', 'Elite Car')}
              <span className="block text-accent">{t('hero.title_span', 'Experiences')}</span>
            </h1>

            <p className="text-lg md:text-2xl text-secondary max-w-2xl mx-auto mb-16 font-medium animate-fade-in-up delay-100">
              {t('hero.subtitle', "Access Morocco's finest collection of luxury vehicles. From iconic sports cars to refined SUVs, your perfect drive awaits.")}
            </p>

            {/* Premium Search Bar */}
            <div className="animate-fade-in-up delay-200">
              <form onSubmit={handleSearch} className="glass rounded-[3rem] p-3 md:p-4 max-w-4xl mx-auto border-white/10 shadow-2xl flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
                  <input
                    type="text"
                    placeholder="Search brand, model..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-premium !bg-transparent border-none pl-14 font-black uppercase tracking-widest text-[11px]"
                  />
                </div>
                <div className="w-px bg-border my-2 hidden md:block" />
                <div className="flex-1 relative group">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
                  <select 
                    value={city} 
                    onChange={e => setCity(e.target.value)} 
                    className="input-premium !bg-transparent border-none pl-14 font-black uppercase tracking-widest text-[11px] appearance-none cursor-pointer text-primary"
                  >
                    <option value="" className="bg-surface text-primary">{t('filters.all_cities')}</option>
                    {cities.map(c => <option key={c} value={c} className="bg-surface text-primary">{c}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-premium !rounded-2xl !px-12 !py-4.5">
                  Explore Fleet
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <ChevronDown className="w-10 h-10 text-primary" />
        </div>
      </section>

      {/* ─── Stats Section ────────────────────────────────────────────────── */}
      <section className="py-24 bg-surface-2 border-y border-border">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {STATS.map(({ icon, value, label }, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6 text-accent group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-lg border border-accent/20">
                  {icon}
                </div>
                <div className="text-4xl font-black text-primary mb-2 tracking-tighter uppercase">{value}</div>
                <div className="text-[9px] text-muted font-black uppercase tracking-[0.3em]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Collection ─────────────────────────────────────────── */}
      <section className="py-32">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <p className="text-accent text-[10px] font-black uppercase tracking-[0.4em] mb-4">Elite Selection</p>
              <h2 className="text-4xl md:text-7xl font-black text-primary uppercase leading-[0.9] tracking-tighter">
                Most <span className="text-accent">Popular</span> Fleet
              </h2>
            </div>
            <button 
              onClick={() => navigate('/cars')}
              className="group flex items-center gap-3 px-8 py-4 glass rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-accent hover:text-white transition-all border-border"
            >
              View Full Fleet
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading
              ? Array(6).fill(0).map((_, i) => <CarCardSkeleton key={i} />)
              : featuredCars.map(car => <CarCard key={car.id} car={car} />)
            }
          </div>
        </div>
      </section>

      {/* ─── Why LuxuryDrive ─────────────────────────────────────────────── */}
      <section className="py-32 bg-surface-2 border-y border-border">
        <div className="container-custom">
          <div className="text-center mb-20">
            <p className="text-accent text-[10px] font-black uppercase tracking-[0.4em] mb-4">The Standard</p>
            <h2 className="text-4xl md:text-7xl font-black text-primary uppercase leading-[0.9] tracking-tighter">
              Why <span className="luxury-text lowercase italic">Choose</span> Excellence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Total Security', desc: 'Comprehensive insurance and 24/7 roadside assistance for complete peace of mind.', color: 'text-emerald-500' },
              { icon: Award, title: 'Vetted Fleet', desc: 'Every vehicle is meticulously inspected and maintained to showroom standards.', color: 'text-blue-500' },
              { icon: Users, title: 'VIP Concierge', desc: 'Personalized service that handles every detail of your journey.', color: 'text-amber-500' },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <div key={i} className="premium-card p-10 group hover:border-accent/40 transition-all duration-500">
                <div className={`w-14 h-14 rounded-xl bg-background border border-border flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
                <h3 className="text-xl font-black text-primary uppercase mb-4 tracking-tight">{title}</h3>
                <p className="text-sm font-medium leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ───────────────────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="glass rounded-[4rem] p-16 md:p-32 border-white/10 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-accent/5 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <h2 className="text-5xl md:text-9xl font-black text-primary uppercase leading-[0.85] tracking-tighter mb-12 relative z-10">
              Ready for the <span className="text-accent">Experience?</span>
            </h2>
            <p className="text-lg md:text-2xl text-secondary max-w-2xl mx-auto mb-16 font-medium relative z-10">
              Unlock the keys to Morocco's most exclusive automotive collection today.
            </p>
            <button 
              onClick={() => navigate('/cars')}
              className="btn-premium !px-16 !py-6 !text-sm !rounded-2xl relative z-10"
            >
              Start Reservation <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
