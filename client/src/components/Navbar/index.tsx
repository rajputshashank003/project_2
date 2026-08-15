import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import ConfirmModal from '../ConfirmModal';
import MenuDropdown from '../MenuDropdown';

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
  { to: '/admin/settings',          label: 'Organization Settings' },
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
    <React.Fragment>
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

              {/* Admin dropdown with backdrop overlay & outside click close */}
              {isAdmin && (
                <MenuDropdown
                  isOpen={adminOpen}
                  onClose={() => setAdminOpen(false)}
                  trigger={
                    <button
                      onClick={() => setAdminOpen(!adminOpen)}
                      className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                        adminOpen
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Admin
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${adminOpen ? 'rotate-180' : ''}`} />
                    </button>
                  }
                  align="right"
                  className="w-52"
                >
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
                </MenuDropdown>
              )}
            </nav>

            {/* Auth actions */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <React.Fragment>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 transition-colors group"
                    title="View Profile"
                  >
                    <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <User className="h-3.5 w-3.5 text-emerald-700" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-800">{user?.name || user?.phone}</span>
                  </Link>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </React.Fragment>
              ) : (
                <Link to="/login" className="btn-primary text-sm">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors z-50"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu backdrop overlay */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] md:hidden cursor-default"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile menu content */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white relative z-50 animate-slide-up">
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
                <React.Fragment>
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
                </React.Fragment>
              )}
              <div className="pt-2 border-t border-slate-100">
                {isAuthenticated ? (
                  <React.Fragment>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="h-4 w-4 text-emerald-600" />
                      My Profile
                    </Link>
                    <button
                      onClick={() => { setShowLogoutConfirm(true); setMenuOpen(false); }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </React.Fragment>
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
    </React.Fragment>
  );
};

export default Navbar;
