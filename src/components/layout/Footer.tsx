import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plane, 
  Mail, 
  Phone, 
  MapPin

} from 'lucide-react';

const Footer: React.FC = () => {


  const footerLinks = {
    company: [
      { label: 'Rólunk', href: '/about' },
      { label: 'Kapcsolat', href: '/contact' },
      { label: 'Karrier', href: '/careers' },
      { label: 'Blog', href: '/blog' },
    ],
    services: [
      { label: 'Utazási csomagok', href: '/packages' },
      { label: 'AI Útitervező', href: '/ai-planner' },
      { label: 'Csoportos utak', href: '/group-tours' },
      { label: 'Egyedi tervezés', href: '/custom' },
    ],
    support: [
      { label: 'GYIK', href: '/faq' },
      { label: 'Utazási feltételek', href: '/terms' },
      { label: 'Adatvédelem', href: '/privacy' },
      { label: 'Lemondási szabályzat', href: '/cancellation' },
    ],
  };


  return (
    <footer className="bg-gradient-to-b from-primary-950 to-gray-950 text-gray-300">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-gradient-to-br from-primary-400 via-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-glow">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Utazz<span className="bg-gradient-to-r from-primary-300 to-secondary-300 bg-clip-text text-transparent">Velünk</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Fedezze fel a világ csodáit velünk! Személyre szabott utazási élmények, 
              AI-alapú tervezés és megbízható szolgáltatás.
            </p>
            

            <div className="space-y-3">
              <a href="tel:+3612345678" className="flex items-center gap-3 text-gray-400 hover:text-primary-300 transition-colors">
                <Phone className="w-5 h-5 text-primary-400" />
                +36 1 234 5678
              </a>
              <a href="mailto:info@utazzvelunk.hu" className="flex items-center gap-3 text-gray-400 hover:text-primary-300 transition-colors">
                <Mail className="w-5 h-5 text-primary-400" />
                info@utazzvelunk.hu
              </a>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-primary-400" />
                6800 Hódmezővásárhely, Munkácsy Mihály utca 4.
              </div>
            </div>
          </div>


          <div>
            <h3 className="text-white font-semibold mb-4">Cégünk</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          <div>
            <h3 className="text-white font-semibold mb-4">Szolgáltatások</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          <div>
            <h3 className="text-white font-semibold mb-4">Támogatás</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>


    </footer>
  );
};

export default Footer;
