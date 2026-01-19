import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Plane,
  MapPin,
  Sparkles,
  Calendar,
  ChevronDown,
  Map
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Avatar } from '../ui';
import { cn } from '../../utils/helpers';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: '/packages', label: 'Utazások', icon: MapPin },
    { href: '/ai-planner', label: 'AI Tervező', icon: Sparkles },
    { href: '/about', label: 'Rólunk', icon: Plane },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-soft border-b border-primary-100/50'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg group-hover:scale-105 transition-all duration-300">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold">
              <span className="text-gray-900">Utazz</span>
              <span className="gradient-text-static">Velünk</span>
            </span>
          </Link>


          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200',
                  location.pathname === link.href
                    ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50/50'
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>


          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary-50/50 transition-colors"
                >
                  <Avatar name={user.name} size="sm" />
                  <span className="font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                  <ChevronDown className={cn(
                    'w-4 h-4 text-gray-400 transition-transform',
                    isUserMenuOpen && 'rotate-180'
                  )} />
                </button>


                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-primary-100 py-2 animate-slide-down">
                    <div className="px-4 py-3 border-b border-primary-100">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profilom
                    </Link>
                    <Link
                      to="/bookings"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Foglalásaim
                    </Link>
                    <Link
                      to="/itineraries"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      <Map className="w-4 h-4" />
                      Mentett útiterveim
                    </Link>
                    
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    
                    <div className="border-t border-primary-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Kijelentkezés
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Bejelentkezés</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Regisztráció</Button>
                </Link>
              </>
            )}
          </div>


          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl font-medium',
                  location.pathname === link.href
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
            
            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Avatar name={user.name} size="md" />
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
                  >
                    <User className="w-5 h-5" />
                    Profilom
                  </Link>
                  <Link
                    to="/bookings"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
                  >
                    <Calendar className="w-5 h-5" />
                    Foglalásaim
                  </Link>
                  <Link
                    to="/itineraries"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
                  >
                    <Map className="w-5 h-5" />
                    Mentett útiterveim
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
                    >
                      <Settings className="w-5 h-5" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    Kijelentkezés
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block">
                    <Button variant="secondary" className="w-full">
                      Bejelentkezés
                    </Button>
                  </Link>
                  <Link to="/register" className="block">
                    <Button variant="primary" className="w-full">
                      Regisztráció
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
