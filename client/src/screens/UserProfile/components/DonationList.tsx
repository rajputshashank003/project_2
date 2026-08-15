import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserProfileContext } from '../context';
import type { Donation } from '../../../types/donation';

const STATUS_CONFIG = {
    approved: { label: 'Approved', icon: CheckCircle, className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    rejected: { label: 'Rejected', icon: XCircle,     className: 'bg-red-50 text-red-600 border border-red-200' },
    pending:  { label: 'Pending',  icon: Clock,        className: 'bg-amber-50 text-amber-600 border border-amber-200' },
} as const;

const DonationRow: React.FC<{ donation: Donation }> = ({ donation }) => {
    const status = STATUS_CONFIG[donation.status] ?? STATUS_CONFIG.pending;
    const Icon   = status.icon;

    return (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">₹{donation.amount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(donation.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {donation.certificateNumber && (
                            <span className="ml-2 text-slate-400">#{donation.certificateNumber}</span>
                        )}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                    <Icon className="h-3 w-3" />
                    {status.label}
                </span>
                {donation.status === 'approved' && donation.id && (
                    <Link
                        to={`/certificate/${donation.id}`}
                        className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
                    >
                        View Certificate →
                    </Link>
                )}
            </div>
        </div>
    );
};

export const DonationList: React.FC = () => {
    const ctx = useContext(UserProfileContext);
    if (!ctx) return null;
    const { donations, donationLoading, donationPage, donationTotalPages, loadDonations } = ctx;

    if (donationLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                ))}
            </div>
        );
    }

    if (donations.length === 0) {
        return (
            <div className="text-center py-16">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No donations yet</p>
                <p className="text-slate-400 text-sm mt-1">Your donation history will appear here</p>
                <Link to="/donate" className="inline-block mt-4 btn-primary text-sm">
                    Make a Donation
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {donations.map((d) => <DonationRow key={d.id} donation={d} />)}

            {/* Pagination */}
            {donationTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        onClick={() => loadDonations(donationPage - 1)}
                        disabled={donationPage <= 1}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-slate-600 font-medium">
                        {donationPage} / {donationTotalPages}
                    </span>
                    <button
                        onClick={() => loadDonations(donationPage + 1)}
                        disabled={donationPage >= donationTotalPages}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
};
