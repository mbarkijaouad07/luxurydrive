import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X, ChevronLeft, ChevronRight, SlidersHorizontal, MapPin, Tag, Fuel, Settings2, RotateCcw } from 'lucide-react';
import api from '../services/api';
import CarCard from '../components/CarCard';
import { CarCardSkeleton } from '../components/Skeleton';

const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid'];
const TRANSMISSIONS = ['automatic', 'manual'];
const CATEGORIES = ['sedan', 'suv', 'sports', 'luxury', 'electric', 'convertible', 'pickup'];

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès',
  'Oujda', 'Tétouan', 'Safi', 'Mohammedia', 'El Jadida', 'Béni Mellal',
  'Nador', 'Kenitra', 'Essaouira', 'Laâyoune', 'Dakhla', 'Ouarzazate',
  'Ifrane', 'Chefchaouen', 'Errachidia', 'Taroudant', 'Tiznit'
];

export default function CarsPage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [locations, setLocations] = useState([]);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    brand: searchParams.get('brand') || '',
    category: searchParams.get('category') || '',
    transmission: searchParams.get('transmission') || '',
    fuelType: searchParams.get('fuelType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    document.title = `${t('nav.cars')} — LuxuryDrive`;
    Promise.all([api.get('/cars/brands'), api.get('/cars/locations')]).then(([b, l]) => {
      setBrands(b.data.data);
      const apiCities = Array.isArray(l.data.data) ? l.data.data : [];
      const merged = [...new Set([...MOROCCAN_CITIES, ...apiCities])].sort();
      setLocations(merged);
    }).catch(() => {
      setLocations([...MOROCCAN_CITIES]);
    });
  }, [t]);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      params.set('limit', 9);
      const { data } = await api.get(`/cars?${params.toString()}`);
      setCars(data.data);
      setPagination(data.pagination);
    } catch { setCars([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchCars(); }, [fetchCars]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, ...(key !== 'page' ? { page: 1 } : {}) }));
    setSearchParams(prev => {
      if (value) prev.set(key, value);
      else prev.delete(key);
      if (key !== 'page') prev.set('page', '1');
      return prev;
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '', location: '', brand: '', category: '', transmission: '', fuelType: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1
    });
    setSearchParams({});
  };

  const activeFilterCount = Object.entries(filters)
    .filter(([k, v]) => k !== 'page' && v)
    .length;

  const FilterSidebar = () => (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <h3 className="text-primary font-black text-xs uppercase tracking-[0.2em]">{t('filters.title')}</h3>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-[10px] text-accent hover:underline flex items-center gap-1.5 font-black transition-all">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Location */}
      <div className="space-y-3">
        <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-1">{t('filters.city')}</label>
        <div className="relative group">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
          <select value={filters.location} onChange={e => updateFilter('location', e.target.value)} className="input-premium pl-12 !py-3 uppercase tracking-widest text-[10px] font-black appearance-none">
            <option value="">{t('filters.all_cities')}</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Brand */}
      <div className="space-y-3">
        <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-1">{t('filters.brand')}</label>
        <div className="relative group">
          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
          <select value={filters.brand} onChange={e => updateFilter('brand', e.target.value)} className="input-premium pl-12 !py-3 uppercase tracking-widest text-[10px] font-black appearance-none">
            <option value="">{t('filters.all_brands')}</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-3">
        <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-1">{t('filters.category')}</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => updateFilter('category', filters.category === c ? '' : c)}
              className={`px-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${filters.category === c
                ? 'bg-accent border-accent text-white shadow-md'
                : 'bg-surface-2 border-border text-secondary hover:border-accent/40'
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-1">{t('filters.price')}</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={e => updateFilter('minPrice', e.target.value)}
            className="input-premium !py-3 text-center text-xs"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={e => updateFilter('maxPrice', e.target.value)}
            className="input-premium !py-3 text-center text-xs"
          />
        </div>
      </div>

      {/* Transmission */}
      <div className="space-y-3">
        <label className="text-muted font-black text-[9px] uppercase tracking-widest ml-1">{t('filters.transmission')}</label>
        <div className="flex gap-2">
          {TRANSMISSIONS.map(tOption => (
            <button
              key={tOption}
              onClick={() => updateFilter('transmission', filters.transmission === tOption ? '' : tOption)}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${filters.transmission === tOption
                ? 'bg-accent border-accent text-white shadow-md'
                : 'bg-surface-2 border-border text-secondary hover:border-accent/40'
                }`}
            >
              {tOption}
            </button>
          ))}
        </div>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-16">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 border-b border-border pb-12 animate-fade-in-up">
          <div className="max-w-2xl">
            <p className="text-accent font-black text-[10px] uppercase tracking-[0.4em] mb-4">Elite Fleet</p>
            <h1 className="text-5xl md:text-8xl font-black text-primary tracking-tighter leading-none uppercase">
              The <span className="text-accent">Collection</span>
            </h1>
            <p className="mt-6 text-secondary text-lg md:text-xl font-medium leading-relaxed max-w-lg">
              Explore our curated selection of high-performance automotive masterpieces.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative group flex-1 md:w-80">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
                className="input-premium pl-14 font-black uppercase text-xs !py-4 shadow-lg"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-14 w-14 flex items-center justify-center glass rounded-2xl text-secondary border border-border shadow-lg"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* Main Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-12 lg:gap-20 items-start">

          {/* Sidebar Desktop */}
          <aside className="hidden lg:block w-full sticky top-[calc(var(--navbar-height)+2rem)]">
            <div className="glass p-8 rounded-[2rem] border border-border shadow-md">
              <FilterSidebar />
            </div>
          </aside>

          {/* Mobile Sidebar */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-[200] lg:hidden">
              <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={() => setSidebarOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm glass border-l border-border p-8 shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-primary">Filters</h2>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 glass rounded-xl border border-border">
                    <X className="w-6 h-6 text-primary" />
                  </button>
                </div>
                <FilterSidebar />
                <button onClick={() => setSidebarOpen(false)} className="btn-premium w-full mt-10 !py-4">Show Results</button>
              </div>
            </div>
          )}

          {/* Grid Area */}
          <div className="flex-1 w-full min-w-0">
            <div className="flex items-center justify-between mb-8 animate-fade-in-up">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-primary tracking-tighter leading-none">{loading ? '...' : pagination.total}</span>
                <span className="text-[10px] text-muted font-black uppercase tracking-widest leading-none">Vehicles Found</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted">Sort:</span>
                <select 
                  value={filters.sort} 
                  onChange={e => updateFilter('sort', e.target.value)}
                  className="bg-transparent border-none text-[9px] font-black uppercase tracking-widest text-accent p-0 cursor-pointer focus:ring-0"
                >
                  <option value="newest" className="bg-surface">Newest</option>
                  <option value="price_low" className="bg-surface">Price Low</option>
                  <option value="price_high" className="bg-surface">Price High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {loading
                ? Array(6).fill(0).map((_, i) => <CarCardSkeleton key={i} />)
                : cars.length === 0
                  ? (
                    <div className="col-span-full py-32 glass rounded-[3rem] text-center border-border">
                      <Search className="w-16 h-16 text-muted mx-auto mb-6 opacity-20" />
                      <h3 className="text-2xl font-black text-primary uppercase mb-2">No results</h3>
                      <p className="text-secondary text-sm mb-8">Try adjusting your filters or search terms.</p>
                      <button onClick={clearFilters} className="btn-premium !py-3 !px-8">Reset All</button>
                    </div>
                  )
                  : cars.map((car) => <CarCard key={car.id} car={car} />)
              }
            </div>

            {/* Pagination */}
            {!loading && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-20">
                <button
                  onClick={() => updateFilter('page', filters.page - 1)}
                  disabled={filters.page === 1}
                  className="w-12 h-12 rounded-xl flex items-center justify-center glass border border-border disabled:opacity-20 transition-all hover:bg-accent hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => updateFilter('page', p)}
                      className={`w-12 h-12 rounded-xl text-[10px] font-black transition-all border ${filters.page === p
                        ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20'
                        : 'glass border-border text-secondary hover:bg-surface-2'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => updateFilter('page', filters.page + 1)}
                  disabled={filters.page === pagination.pages}
                  className="w-12 h-12 rounded-xl flex items-center justify-center glass border border-border disabled:opacity-20 transition-all hover:bg-accent hover:text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
