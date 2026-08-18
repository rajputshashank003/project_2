import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    Menu,
    X,
    Leaf,
    LogOut,
    User,
    ChevronDown,
    ChevronRight,
    HeartHandshake,
    CreditCard,
    Calendar,
    Image as ImageIcon,
    Info,
    Shield,
    ArrowRight,
    ExternalLink,
    QrCode,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import ConfirmModal from "../ConfirmModal";
import MenuDropdown from "../MenuDropdown";

const WHATSAPP_SERVICE_URL =
    import.meta.env.VITE_WHATSAPP_SERVICE_URL ||
    (import.meta.env.VITE_API_BASE_URL
        ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/, "")}/qr`
        : "http://localhost:3000/qr");

const NAV_LINKS = [
    { to: "/", label: "Home", icon: Leaf },
    { to: "/donate", label: "Donate", icon: HeartHandshake },
    { to: "/id-generate", label: "Get ID Card", icon: CreditCard },
    { to: "/events", label: "Events", icon: Calendar },
    { to: "/gallery", label: "Gallery", icon: ImageIcon },
    { to: "/about", label: "About Us", icon: Info },
];

const ADMIN_LINKS = [
    { to: "/admin/request/donation", label: "Donation Requests" },
    { to: "/admin/request/id-card", label: "ID Card Requests" },
    { to: "/admin/users", label: "Users Management" },
    { to: "/admin/noticeboard", label: "Noticeboard" },
    { to: "/admin/gallery", label: "Photo Gallery" },
    { to: "/admin/events", label: "Events" },
    { to: "/admin/team", label: "Team Members" },
    { to: "/admin/settings", label: "Org Settings" },
];

const LogoBadge: React.FC<{
    logoUrl?: string;
    name: string;
    size?: "sm" | "md";
}> = ({ logoUrl, name, size = "md" }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [logoUrl]);

    if (logoUrl && !hasError) {
        return (
            <div
                className={`${
                    size === "sm" ? "h-8 w-8" : "h-10 w-10"
                } rounded-xl overflow-hidden bg-white border border-slate-100 shadow-sm group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center`}
            >
                <img
                    src={logoUrl}
                    alt={name}
                    onError={() => setHasError(true)}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    return (
        <div
            className={`${
                size === "sm" ? "h-8 w-8" : "h-10 w-10"
            } rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-emerald group-hover:scale-105 transition-transform shrink-0`}
        >
            <Leaf
                className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"} text-white`}
            />
        </div>
    );
};

const Navbar: React.FC = () => {
    const { isAuthenticated, isAdmin, user, logout } = useAuth();
    const { ngoConfig, isConfigLoading } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [adminOpen, setAdminOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Close mobile drawer on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

    return (
        <React.Fragment>
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link
                            to="/"
                            className="flex items-center gap-3 group focus:outline-none min-h-[40px]"
                        >
                            {isConfigLoading ? (
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-slate-200 animate-pulse shrink-0" />
                                    <div className="flex flex-col gap-1.5 py-0.5">
                                        <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                                        <div className="h-2.5 w-40 bg-slate-200 rounded animate-pulse hidden sm:block" />
                                    </div>
                                </div>
                            ) : (
                                <React.Fragment>
                                    <LogoBadge
                                        logoUrl={ngoConfig.logoUrl}
                                        name={ngoConfig.name}
                                        size="md"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-extrabold text-slate-900 text-base leading-tight tracking-tight">
                                            {ngoConfig.name || "NGO Platform"}
                                        </span>
                                        {ngoConfig.tagline && (
                                            <span className="text-[11px] font-medium text-emerald-700 hidden sm:block truncate max-w-[240px]">
                                                {ngoConfig.tagline}
                                            </span>
                                        )}
                                    </div>
                                </React.Fragment>
                            )}
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden min-[1200px]:flex items-center gap-1">
                            {NAV_LINKS.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                                            isActive
                                                ? "bg-emerald-50 text-emerald-700 font-semibold shadow-xs"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                        }`
                                    }
                                    end={link.to === "/"}
                                >
                                    {link.label}
                                </NavLink>
                            ))}

                            {/* Admin Dropdown */}
                            {isAdmin && (
                                <MenuDropdown
                                    isOpen={adminOpen}
                                    onClose={() => setAdminOpen(false)}
                                    trigger={
                                        <button
                                            onClick={() =>
                                                setAdminOpen(!adminOpen)
                                            }
                                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                                                adminOpen
                                                    ? "bg-emerald-100/70 text-emerald-900 shadow-xs"
                                                    : "text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100/50"
                                            }`}
                                        >
                                            <Shield className="h-4 w-4 text-emerald-600" />
                                            Admin
                                            <ChevronDown
                                                className={`h-3.5 w-3.5 text-emerald-700 transition-transform duration-200 ${adminOpen ? "rotate-180" : ""}`}
                                            />
                                        </button>
                                    }
                                    align="right"
                                    className="w-56 py-2"
                                >
                                    <div className="px-3 py-1.5 mb-1 border-b border-slate-100">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Admin Control
                                        </span>
                                    </div>
                                    {ADMIN_LINKS.map((link) => (
                                        <NavLink
                                            key={link.to}
                                            to={link.to}
                                            onClick={() => setAdminOpen(false)}
                                            className={({ isActive }) =>
                                                `block px-4 py-2 text-sm transition-colors duration-100 ${
                                                    isActive
                                                        ? "text-emerald-700 bg-emerald-50 font-semibold"
                                                        : "text-slate-700 hover:bg-slate-50"
                                                }`
                                            }
                                        >
                                            {link.label}
                                        </NavLink>
                                    ))}
                                    <div className="pt-1 mt-1 border-t border-slate-100">
                                        <a
                                            href={WHATSAPP_SERVICE_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setAdminOpen(false)}
                                            className="flex items-center justify-between px-4 py-2 text-sm text-emerald-800 hover:bg-emerald-50/80 transition-colors font-medium group"
                                        >
                                            <span className="flex items-center gap-2">
                                                <QrCode className="h-4 w-4 text-emerald-600" />
                                                Verify WhatsApp
                                            </span>
                                            <ExternalLink className="h-3.5 w-3.5 text-emerald-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </div>
                                </MenuDropdown>
                            )}
                        </nav>

                        {/* Desktop Auth Section */}
                        <div className="hidden min-[1200px]:flex items-center gap-3">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/profile"
                                        id="desktop-user-profile-btn"
                                        className="flex items-center gap-2.5 pl-2.5 pr-4 py-1.5 rounded-full bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 shadow-xs transition-all group"
                                        title="View My Profile, Certificates & ID Cards"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                                            {userInitial}
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 leading-tight max-w-[130px] truncate">
                                                {user?.name || user?.phone}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-400 group-hover:text-emerald-700 leading-none">
                                                View Profile →
                                            </span>
                                        </div>
                                    </Link>

                                    <button
                                        onClick={() =>
                                            setShowLogoutConfirm(true)
                                        }
                                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                        title="Logout"
                                        aria-label="Logout"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="btn-primary py-2 px-5 text-sm flex items-center gap-1.5 shadow-emerald"
                                >
                                    <User className="h-4 w-4" />
                                    Login / Join
                                </Link>
                            )}
                        </div>

                        {/* Mobile Hamburger Button */}
                        <div className="flex items-center gap-2 min-[1200px]:hidden">
                            {isAuthenticated && (
                                <Link
                                    to="/profile"
                                    className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-xs"
                                    title="My Profile"
                                >
                                    {userInitial}
                                </Link>
                            )}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                                aria-label="Toggle menu"
                                aria-expanded={menuOpen}
                            >
                                {menuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Drawer via Portal */}
                {menuOpen &&
                    createPortal(
                        <div
                            className="min-[1200px]:hidden fixed inset-0 z-50 flex justify-end"
                            role="dialog"
                            aria-modal="true"
                        >
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs animate-backdrop-fade"
                                onClick={() => setMenuOpen(false)}
                                aria-hidden="true"
                            />

                            {/* Drawer panel */}
                            <div className="relative w-full max-w-sm bg-white h-[100dvh] shadow-2xl flex flex-col z-10 animate-drawer-slide border-l border-slate-200">
                                {/* Drawer header */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
                                    {isConfigLoading ? (
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-8 w-8 rounded-xl bg-slate-200 animate-pulse shrink-0" />
                                            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2.5">
                                            <LogoBadge
                                                logoUrl={ngoConfig.logoUrl}
                                                name={ngoConfig.name}
                                                size="sm"
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-sm leading-tight truncate max-w-[190px]">
                                                    {ngoConfig.name ||
                                                        "NGO Platform"}
                                                </span>
                                                {ngoConfig.tagline && (
                                                    <span className="text-[10px] text-emerald-700 font-medium truncate max-w-[190px]">
                                                        {ngoConfig.tagline}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setMenuOpen(false)}
                                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                                        aria-label="Close menu"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Drawer body */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                                    {/* User profile card / Login */}
                                    {isAuthenticated ? (
                                        <Link
                                            to="/profile"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-100 rounded-2xl group shadow-xs hover:border-emerald-300 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                                                    {userInitial}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-800">
                                                        {user?.name ||
                                                            user?.phone}
                                                    </div>
                                                    <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 mt-0.5">
                                                        <span>
                                                            {user?.phone}
                                                        </span>
                                                        <span className="inline-block w-1 h-1 rounded-full bg-emerald-400" />
                                                        <span className="capitalize">
                                                            {user?.role ||
                                                                "Member"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                                        </Link>
                                    ) : (
                                        <Link
                                            to="/login"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center justify-between p-4 bg-emerald-600 text-white rounded-2xl shadow-emerald hover:bg-emerald-700 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <User className="h-5 w-5" />
                                                <div>
                                                    <div className="font-bold text-sm">
                                                        Login / Register
                                                    </div>
                                                    <div className="text-xs text-emerald-100">
                                                        Access ID cards &amp;
                                                        receipts
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    )}

                                    {/* Primary Nav Links */}
                                    <div>
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                                            Menu Navigation
                                        </div>
                                        <div className="space-y-1">
                                            {NAV_LINKS.map((link) => {
                                                const Icon = link.icon;
                                                return (
                                                    <NavLink
                                                        key={link.to}
                                                        to={link.to}
                                                        onClick={() =>
                                                            setMenuOpen(false)
                                                        }
                                                        className={({
                                                            isActive,
                                                        }) =>
                                                            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                                isActive
                                                                    ? "bg-emerald-50 text-emerald-800 font-bold shadow-xs"
                                                                    : "text-slate-700 hover:bg-slate-50"
                                                            }`
                                                        }
                                                        end={link.to === "/"}
                                                    >
                                                        <Icon className="h-4 w-4 text-emerald-600" />
                                                        <span>
                                                            {link.label}
                                                        </span>
                                                    </NavLink>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Admin Links (if admin) */}
                                    {isAdmin && (
                                        <div>
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 px-3 mb-2">
                                                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                                                <span>Admin Management</span>
                                            </div>
                                            <div className="space-y-1 bg-slate-50/80 p-2 rounded-2xl border border-slate-100">
                                                {ADMIN_LINKS.map((link) => (
                                                    <NavLink
                                                        key={link.to}
                                                        to={link.to}
                                                        onClick={() =>
                                                            setMenuOpen(false)
                                                        }
                                                        className={({
                                                            isActive,
                                                        }) =>
                                                            `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                                                                isActive
                                                                    ? "bg-emerald-600 text-white font-semibold shadow-xs"
                                                                    : "text-slate-700 hover:bg-slate-200/70"
                                                            }`
                                                        }
                                                    >
                                                        <span>
                                                            {link.label}
                                                        </span>
                                                        <ChevronRight className="h-3 w-3 opacity-50" />
                                                    </NavLink>
                                                ))}
                                                <div className="pt-1 mt-1 border-t border-slate-200/60">
                                                    <a
                                                        href={WHATSAPP_SERVICE_URL}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() =>
                                                            setMenuOpen(false)
                                                        }
                                                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <QrCode className="h-3.5 w-3.5 text-emerald-600" />
                                                            Verify WhatsApp
                                                        </span>
                                                        <ExternalLink className="h-3 w-3 text-emerald-600 opacity-60" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Drawer footer */}
                                {isAuthenticated && (
                                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                                        <button
                                            onClick={() => {
                                                setShowLogoutConfirm(true);
                                                setMenuOpen(false);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-100 hover:border-red-200 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Logout from Account
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>,
                        document.body,
                    )}
            </header>

            <ConfirmModal
                isOpen={showLogoutConfirm}
                title="Logout?"
                message="Are you sure you want to logout from your account?"
                confirmText="Logout"
                onConfirm={() => {
                    setShowLogoutConfirm(false);
                    handleLogout();
                }}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </React.Fragment>
    );
};

export default Navbar;
