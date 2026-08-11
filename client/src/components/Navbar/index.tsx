import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import ConfirmModal from '../ConfirmModal';

const NAV_LINKS = [
  { to: '/',            label: 'Home' },
  { to: '/donate',      label: 'Donate' },
  { to: '/id-generate', label: 'Get ID Card' },
  { to: '/events',      label: 'Events' },
  { to: '/about',       label: 'About' },
];

const ADMIN_LINKS = [
  { to: '/admin/request/donation',  label: 'Donation Requests' },
  { to: '/admin/request/id-card',   label: 'ID Card Requests' },
  { to: '/admin/users',             label: 'Users' },
  { to: '/admin/noticeboard',       label: 'Noticeboard' },
  { to: '/admin/gallery',           label: 'Gallery' },
  { to: '/admin/events',            label: 'Events' },
  { to: '/admin/team',              label: 'Team Members' },
];

const Navbar: React.FC = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { ngoConfig } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]           = useState(false);
  const [adminOpen, setAdminOpen]         = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            {ngoConfig.logoUrl ? (
              <img src={ngoConfig.logoUrl} alt={ngoConfig.name} className="h-9 w-9 rounded-lg object-contain" />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-emerald">
                <Leaf className="h-5 w-5 text-white" />
              </div>
            )}
            <span className="font-bold text-slate-900 text-base leading-tight hidden sm:block">
              {ngoConfig.name}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}

            {/* Admin dropdown */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setAdminOpen(!adminOpen)}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-150"
                >
                  Admin
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${adminOpen ? 'rotate-180' : ''}`} />
                </button>
                {adminOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-card-md py-1.5 animate-fade-in">
                    {ADMIN_LINKS.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setAdminOpen(false)}
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm transition-colors duration-100 ${
                            isActive
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`
                        }
                      >
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Auth actions */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-emerald-700" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user?.name || user?.phone}</span>
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm">
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <>
                <div className="pt-2 pb-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">Admin</span>
                </div>
                {ADMIN_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </>
            )}
            <div className="pt-2 border-t border-slate-100">
              {isAuthenticated ? (
                <button
                  onClick={() => { setShowLogoutConfirm(true); setMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white text-center"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>

    <ConfirmModal
      isOpen={showLogoutConfirm}
      title="Logout?"
      message="Are you sure you want to logout?"
      confirmText="Logout"
      onConfirm={() => { setShowLogoutConfirm(false); handleLogout(); }}
      onCancel={() => setShowLogoutConfirm(false)}
    />
    </>
  );
};

export default Navbar;
