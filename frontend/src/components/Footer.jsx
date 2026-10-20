import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Car, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-surface border-t border-border mt-32">
      <div className="container-custom py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 lg:gap-24">
          {/* Brand Identity */}
          <div className="col-span-1 md:col-span-2 space-y-10">
            <div className="flex items-center gap-4">
              <div className="bg-accent p-3 rounded-2xl shadow-xl shadow-accent/20">
                <Car className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-black uppercase tracking-tighter text-primary">
                Luxury<span className="text-accent">Drive</span>
              </span>
            </div>
            <p className="text-secondary text-lg leading-relaxed max-w-sm font-medium">
              Morocco's premier luxury car rental service. Experience the zenith of automotive excellence with our curated elite fleet.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-secondary hover:bg-accent hover:text-white transition-all group">
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-primary font-black mb-10 uppercase tracking-[0.4em] text-[10px]">Fleet Access</h4>
            <ul className="space-y-5">
              {[
                { to: '/', label: 'Home' },
                { to: '/cars', label: 'Discover Fleet' },
                { to: '/login', label: 'Resident Login' },
                { to: '/register', label: 'Join the Fleet' },
                { to: '/support', label: 'Concierge' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-secondary hover:text-accent text-sm font-black uppercase tracking-widest transition-all flex items-center gap-4 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent scale-0 group-hover:scale-100 transition-all duration-300" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-primary font-black mb-10 uppercase tracking-[0.4em] text-[10px]">Concierge</h4>
            <ul className="space-y-6">
              {[
                { Icon: Mail, text: 'hello@luxurydrive.ma' },
                { Icon: Phone, text: '+212 522 000 000' },
                { Icon: MapPin, text: 'Casablanca, Morocco' },
              ].map(({ Icon, text }, i) => (
                <li key={i} className="flex items-center gap-5 text-sm text-secondary font-bold">
                  <div className="w-10 h-10 glass rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="truncate">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-24 pt-12 flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-muted text-[10px] font-black uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} LUXURYDRIVE. ESTABLISHED IN MOROCCO.
          </p>
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.3em]">
            <a href="#" className="text-muted hover:text-accent transition-all">Privacy Protocol</a>
            <a href="#" className="text-muted hover:text-accent transition-all">Service Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
