import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Leaf, Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { useApp } from "../../context/AppContext";

const Footer: React.FC = () => {
    const { ngoConfig, isConfigLoading } = useApp();
    const [logoError, setLogoError] = useState(false);

    useEffect(() => {
        setLogoError(false);
    }, [ngoConfig.logoUrl]);

    return (
        <footer className="bg-slate-900 text-slate-400 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            {isConfigLoading ? (
                                <div className="h-9 w-9 rounded-xl bg-slate-800 animate-pulse shrink-0" />
                            ) : ngoConfig.logoUrl && !logoError ? (
                                <div className="h-9 w-9 rounded-xl overflow-hidden bg-white border border-slate-700 shadow-sm shrink-0 flex items-center justify-center p-1">
                                    <img
                                        src={ngoConfig.logoUrl}
                                        alt={ngoConfig.name}
                                        onError={() => setLogoError(true)}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                                    <Leaf className="h-5 w-5 text-white" />
                                </div>
                            )}
                            {isConfigLoading ? (
                                <div className="h-5 w-28 bg-slate-800 rounded animate-pulse" />
                            ) : (
                                <span className="font-bold text-white text-base">
                                    {ngoConfig.name}
                                </span>
                            )}
                        </div>
                        {isConfigLoading ? (
                            <div className="h-4 w-48 bg-slate-800 rounded animate-pulse mb-4" />
                        ) : (
                            <p className="text-sm leading-relaxed mb-4">
                                {ngoConfig.tagline}
                            </p>
                        )}
                        {ngoConfig.registrationNumber && !isConfigLoading && (
                            <p className="text-xs text-slate-500">
                                Reg. No: {ngoConfig.registrationNumber}
                            </p>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                            Quick Links
                        </h3>
                        <ul className="space-y-2.5">
                            {[
                                { to: "/", label: "Home" },
                                { to: "/events", label: "Events & Activities" },
                                { to: "/gallery", label: "Photo Gallery" },
                                { to: "/donate", label: "Make a Donation" },
                                {
                                    to: "/id-generate",
                                    label: "Get Volunteer ID",
                                    },
                                { to: "/about", label: "About Us" },
                            ].map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-sm hover:text-emerald-400 transition-colors duration-150"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                            Contact
                        </h3>
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

                <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <p>
                        © {new Date().getFullYear()} {ngoConfig.name}. All
                        rights reserved.
                    </p>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <span>Designed &amp; Developed by</span>
                        <a
                            href="https://rajputshashank.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 group"
                        >
                            <span className="underline decoration-emerald-500/40 hover:decoration-emerald-400 underline-offset-2">
                                Shashank Rajput
                            </span>
                            <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
