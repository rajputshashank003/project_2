import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Heart, Phone, Mail, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Footer: React.FC = () => {
  const { ngoConfig } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white text-base">{ngoConfig.name}</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">{ngoConfig.tagline}</p>
            {ngoConfig.registrationNumber && (
              <p className="text-xs text-slate-500">Reg. No: {ngoConfig.registrationNumber}</p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/',            label: 'Home' },
                { to: '/donate',      label: 'Make a Donation' },
                { to: '/id-generate', label: 'Get Volunteer ID' },
                { to: '/login',       label: 'Login' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-emerald-400 transition-colors duration-150">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2.5">
              {ngoConfig.phone && (
                <li className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{ngoConfig.phone}</span>
                </li>
              )}
              {ngoConfig.email && (
                <li className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{ngoConfig.email}</span>
                </li>
              )}
              {ngoConfig.address && (
                <li className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{ngoConfig.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">
            © {new Date().getFullYear()} {ngoConfig.name}. All rights reserved.
          </p>
          <p className="text-xs flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-emerald-500" /> for a better world
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
