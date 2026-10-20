import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  Car, Menu, X, Heart, User, LogOut, Settings,
  LayoutDashboard, ChevronDown, Moon, Sun, Globe, MessageSquare, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/formatters';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { dark, toggle: toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setUserMenuOpen(false);
    setLangMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success(t('nav.logout_success', 'Logged out successfully'));
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/cars', label: t('nav.cars') },
    { path: '/reclamation', label: 'Support' },
  ];

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇲🇦' }
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 h-[var(--navbar-height)] flex items-center ${
          scrolled ? 'glass shadow-lg border-b' : 'bg-transparent'
        }`}
      >
        <div className="container-custom flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="LuxuryDrive"
              className="w-11 h-11 object-contain group-hover:scale-110 transition-all duration-500 drop-shadow-lg"
            />
            <span className="text-xl font-black uppercase tracking-tighter text-primary">LuxuryDrive</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-2/50 backdrop-blur-md p-1.5 rounded-2xl border border-border">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                  isActive(item.path) ? 'text-white' : 'text-secondary hover:text-primary'
                }`}
              >
                {isActive(item.path) && (
                  <span className="absolute inset-0 bg-accent rounded-xl shadow-lg shadow-accent/20 animate-fade-in" />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-xl glass hover:bg-surface-2 transition-all border border-border text-secondary"
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl glass hover:bg-surface-2 transition-all border border-border text-secondary"
                >
                  <Globe className="w-5 h-5" />
                </button>
                {langMenuOpen && (
                  <div className="absolute right-0 mt-4 w-48 glass rounded-2xl shadow-lg border border-border py-2 overflow-hidden animate-fade-in-up">
                    {languages.map((lng) => (
                      <button
                        key={lng.code}
                        onClick={() => i18n.changeLanguage(lng.code)}
                        className={`w-full flex items-center gap-3 px-6 py-3 text-xs font-bold transition-all ${
                          i18n.language === lng.code ? 'bg-accent/10 text-accent' : 'text-secondary hover:bg-surface-2'
                        }`}
                      >
                        <span>{lng.flag}</span>
                        <span className="uppercase tracking-widest">{lng.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="h-6 w-px bg-border mx-2 hidden lg:block" />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full glass border border-border hover:border-accent transition-all group shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-accent flex items-center justify-center shadow-md">
                    {user.avatar ? (
                      <img 
                        src={getImageUrl(user.avatar)} 
                        className="w-full h-full object-cover" 
                        alt="" 
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user.firstName}&background=random`; }}
                      />
                    ) : (
                      <span className="text-white font-black text-xs">{user.firstName?.[0]}</span>
                    )}
                  </div>
                  <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-primary">{user.firstName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-500 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-4 w-64 glass rounded-3xl shadow-lg border border-border py-4 overflow-hidden animate-fade-in-up">
                    <div className="px-6 py-4 border-b border-border mb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Signed in as</p>
                      <p className="text-xs font-black text-primary truncate">{user.email}</p>
                    </div>
                    <Link to="/dashboard" className="flex items-center gap-4 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-secondary hover:text-accent hover:bg-surface-2 transition-all">
                      <LayoutDashboard className="w-4.5 h-4.5" /> Dashboard
                    </Link>
                    <Link to="/reclamation" className="flex items-center gap-4 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-secondary hover:text-accent hover:bg-surface-2 transition-all">
                      <MessageSquare className="w-4.5 h-4.5" /> Support
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-4 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-secondary hover:text-accent hover:bg-surface-2 transition-all">
                        <Shield className="w-4.5 h-4.5" /> Admin Portal
                      </Link>
                    )}
                    <div className="mt-2 pt-2 border-t border-border px-4">
                      <button onClick={handleLogout} className="flex items-center gap-4 w-full px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/5 transition-all">
                        <LogOut className="w-4.5 h-4.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-secondary hover:text-accent px-4 py-2 transition-all">Login</Link>
                <Link to="/register" className="btn-premium !py-2.5 !px-6 !rounded-xl !text-[9px]">Join Now</Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center glass rounded-xl text-secondary border border-border shadow-sm"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm glass border-l border-border p-8 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-12">
              <span className="text-xl font-black uppercase tracking-tighter text-primary">LuxuryDrive</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 glass rounded-xl border border-border">
                <X className="w-6 h-6 text-primary" />
              </button>
            </div>

            <nav className="space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    isActive(item.path) ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-secondary hover:bg-surface-2'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-12 space-y-4">
              <button onClick={toggleTheme} className="w-full flex items-center justify-between px-6 py-4 rounded-2xl border border-border text-[11px] font-black uppercase tracking-widest text-primary">
                Theme
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {user ? (
                <button onClick={handleLogout} className="w-full py-4 rounded-2xl bg-rose-500/10 text-rose-500 text-[11px] font-black uppercase tracking-widest">Sign Out</button>
              ) : (
                <Link to="/login" className="btn-premium w-full">Sign In</Link>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
