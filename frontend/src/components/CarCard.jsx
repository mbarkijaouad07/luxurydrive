import { Link } from 'react-router-dom';
import { Heart, MapPin, Fuel, Settings2, Star, Users, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { formatPrice, getImageUrl } from '../utils/formatters';

/* ─── Fuel config ─────────────────────────────────────────────────────────── */
const fuelConfig = {
  electric: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', label: 'Electric' },
  petrol:   { color: 'text-amber-400',   bg: 'bg-amber-400/10  border-amber-400/20',    label: 'Petrol'   },
  diesel:   { color: 'text-slate-400',   bg: 'bg-slate-400/10  border-slate-400/20',    label: 'Diesel'   },
  hybrid:   { color: 'text-teal-400',    bg: 'bg-teal-400/10   border-teal-400/20',     label: 'Hybrid'   },
};

export default function CarCard({ car, onFavoriteToggle }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [favorited, setFavorited]   = useState(car.isFavorited || false);
  const [loadingFav, setLoadingFav] = useState(false);
  const [imgLoaded, setImgLoaded]   = useState(false);

  const image = getImageUrl(car.images);
  const fuel  = fuelConfig[car.fuelType?.toLowerCase()] || fuelConfig.petrol;

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Sign in to save favourites'); return; }
    try {
      setLoadingFav(true);
      const { data } = await api.post('/favorites/toggle', { carId: car.id });
      setFavorited(data.favorited);
      toast.success(data.message);
      onFavoriteToggle?.(car.id, data.favorited);
    } catch {
      toast.error('Failed to update favourites');
    } finally {
      setLoadingFav(false);
    }
  };

  /* ── Per-day label — always single line ─────────────────────────────────── */
  const perDayLabel = t('car.per_day', 'day');

  return (
    <Link to={`/cars/${car.id}`} className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl">
      <article className="relative h-full flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg hover:shadow-black/25 hover:-translate-y-0.5 transition-all duration-400">

        {/* ══════════════════════════════════════════════════════════
            IMAGE SECTION — no text overlaid in the centre
        ══════════════════════════════════════════════════════════ */}
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-2 shrink-0">

          {/* Shimmer while loading */}
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-2 via-border/40 to-surface-2" />
          )}

          <img
            src={image}
            alt={car.title}
            onLoad={()  => setImgLoaded(true)}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'; setImgLoaded(true); }}
            className={`w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-[1.04] ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Subtle bottom scrim — depth only, never covers car body */}
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

          {/* ── Corner badges (corners only, never centre) ── */}

          {/* Favourite — top-right */}
          <button
            onClick={handleFavorite}
            disabled={loadingFav}
            aria-label={favorited ? 'Remove from favourites' : 'Add to favourites'}
            className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md border shadow transition-all duration-300
              ${favorited
                ? 'bg-rose-500 border-rose-400 text-white'
                : 'bg-black/30 border-white/10 text-white hover:bg-black/50 hover:scale-110'
              }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
          </button>

          {/* Status Badge — top-left */}
          {car.isCurrentlyBooked ? (
            <span className="absolute top-2.5 left-2.5 z-10 bg-amber-500/90 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-md shadow">
              {t('car.reserved', 'Reserved')}
            </span>
          ) : !car.availability ? (
            <span className="absolute top-2.5 left-2.5 z-10 bg-rose-500/90 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-md shadow">
              {t('car.unavailable', 'Unavailable')}
            </span>
          ) : null}

          {/* Category — bottom-left, tiny */}
          {car.category && (
            <span className="absolute bottom-2.5 left-2.5 z-10 bg-black/50 backdrop-blur-md text-white/75 text-[8px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded">
              {car.category}
            </span>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            INFO SECTION
        ══════════════════════════════════════════════════════════ */}
        <div className="flex flex-col flex-1 p-4 gap-3">

          {/* ① Brand + Rating ─────────────────────────────────── */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="text-accent text-[8px] font-black uppercase tracking-[0.3em] leading-none truncate">
              {car.brand}
            </span>
            {car.rating > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-primary text-[10px] font-black tabular-nums leading-none">
                  {Number(car.rating).toFixed(1)} ({car.totalReviews || 0})
                </span>
              </div>
            )}
          </div>

          {/* ② Car Title ──────────────────────────────────────── */}
          <h3 className="text-primary font-black text-[1.05rem] leading-snug tracking-tight uppercase group-hover:text-accent transition-colors duration-300 line-clamp-1 min-w-0">
            {car.title}
          </h3>

          {/* ③ Spec Chips — flex-wrap so they never overflow ─── */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Fuel */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${fuel.bg} ${fuel.color}`}>
              <Fuel className="w-2.5 h-2.5 shrink-0" />
              {fuel.label}
            </span>
            {/* Transmission */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-accent/20 bg-accent/5 text-accent text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
              <Settings2 className="w-2.5 h-2.5 shrink-0" />
              {car.transmission}
            </span>
            {/* Seats */}
            {car.seats && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-surface-2 text-muted text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
                <Users className="w-2.5 h-2.5 shrink-0" />
                {car.seats} seats
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-border mt-auto" />

          {/* ④ Price row — SINGLE LINE, never wraps ──────────── */}
          <div className="flex items-center justify-between gap-2 min-w-0">

            {/* Price — always one line via whitespace-nowrap */}
            <div className="flex items-baseline gap-1 whitespace-nowrap min-w-0 overflow-hidden">
              <span className="text-primary font-black text-lg leading-none tracking-tight tabular-nums">
                {formatPrice(car.pricePerDay)}
              </span>
              <span className="text-muted text-[9px] font-semibold uppercase tracking-widest leading-none">
                / {perDayLabel}
              </span>
            </div>

            {/* Location + Arrow CTA */}
            <div className="flex items-center gap-1.5 shrink-0">
              {car.location && (
                <div className="hidden sm:flex items-center gap-1 text-muted min-w-0">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="text-[8px] font-bold uppercase tracking-widest truncate max-w-[60px]">
                    {car.location}
                  </span>
                </div>
              )}
              {/* Arrow button */}
              <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:border-accent transition-all duration-300">
                <ArrowRight className="w-3.5 h-3.5 text-accent group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
          </div>

        </div>
      </article>
    </Link>
  );
}
