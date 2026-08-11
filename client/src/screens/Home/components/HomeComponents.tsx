import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, CreditCard, ArrowRight, Users, Leaf } from 'lucide-react';
import { HomeContext } from '../context';
import { useApp } from '../../../context/AppContext';

export const Noticeboard: React.FC = () => {
  const ctx = useContext(HomeContext);
  if (!ctx) return null;
  const { notices, activeNoticeIndex, goToNotice } = ctx;

  if (!notices.length) return null;
  const active = notices[activeNoticeIndex];

  return (
    <div className="relative bg-emerald-700 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {active.imageUrl && (
            <div className="w-full md:w-80 h-48 rounded-2xl overflow-hidden shrink-0">
              <img src={active.imageUrl} alt={active.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
              📌 Notice
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight break-words">{active.title}</h2>
            <p className="text-emerald-100 text-base leading-relaxed break-words">{active.content}</p>
          </div>
        </div>

        {notices.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => goToNotice((activeNoticeIndex - 1 + notices.length) % notices.length)}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {notices.map((_, i) => (
              <button
                key={i}
                onClick={() => goToNotice(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === activeNoticeIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
              />
            ))}
            <button
              onClick={() => goToNotice((activeNoticeIndex + 1) % notices.length)}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const Hero: React.FC = () => {
  const { ngoConfig } = useApp();

  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-20 sm:py-28 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl opacity-60 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <Leaf className="h-3.5 w-3.5" />
          Est. {ngoConfig.foundedYear}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
          Empowering Communities,
          <br />
          <span className="text-emerald-600">Changing Lives</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Join {ngoConfig.name} in making a meaningful difference. Every donation, every volunteer matters.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/donate" className="btn-primary text-base px-8 py-3 rounded-xl">
            <Heart className="h-5 w-5" />
            Donate Now
          </Link>
          <Link to="/id-generate" className="btn-outline text-base px-8 py-3 rounded-xl">
            <CreditCard className="h-5 w-5" />
            Get Volunteer ID
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { label: 'Lives Impacted',    value: '10,000+' },
            { label: 'Active Volunteers', value: '500+' },
            { label: 'Donations Received', value: '₹50L+' },
            { label: 'Years of Service',  value: `${new Date().getFullYear() - ngoConfig.foundedYear}+` },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const GallerySection: React.FC = () => {
  const ctx = useContext(HomeContext);
  if (!ctx) return null;
  const { galleryImages } = ctx;

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-heading mb-2">Our Impact in Pictures</h2>
          <p className="section-subheading text-base">Moments from our journey of service and compassion</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {galleryImages.slice(0, 6).map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-2xl aspect-square bg-slate-100">
              <img
                src={img.imageUrl}
                alt={img.caption || 'Gallery image'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {img.caption && (
                <div className="gallery-overlay absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white text-sm font-medium">{img.caption}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const QuickDonateCta: React.FC = () => (
  <section className="bg-emerald-700 py-16">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
        <Users className="h-7 w-7 text-white" />
      </div>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Become a Volunteer</h2>
      <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
        Get your official volunteer ID card and join our mission to create lasting change in communities.
      </p>
      <Link to="/id-generate" className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors text-base">
        Apply for ID Card
        <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  </section>
);
