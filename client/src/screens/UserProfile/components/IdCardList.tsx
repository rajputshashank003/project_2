import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserProfileContext } from '../context';
import type { IdCard } from '../../../types/id_card';

const STATUS_CONFIG = {
    approved: { label: 'Approved', icon: CheckCircle, className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    rejected: { label: 'Rejected', icon: XCircle,     className: 'bg-red-50 text-red-600 border border-red-200' },
    pending:  { label: 'Pending',  icon: Clock,        className: 'bg-amber-50 text-amber-600 border border-amber-200' },
} as const;

const IdCardRow: React.FC<{ card: IdCard }> = ({ card }) => {
    const status = STATUS_CONFIG[card.status] ?? STATUS_CONFIG.pending;
    const Icon   = status.icon;

    return (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                    <CreditCard className="h-5 w-5 text-slate-500" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate capitalize">{card.designation}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Applied {new Date(card.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {card.uniqueCardNumber && (
                            <span className="ml-2 text-slate-400">#{card.uniqueCardNumber}</span>
                        )}
                    </p>
                    {card.status === 'approved' && card.expiryDate && (
                        <p className="text-xs text-slate-400 mt-0.5">
                            Valid until {new Date(card.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                    <Icon className="h-3 w-3" />
                    {status.label}
                </span>
                {card.status === 'approved' && card.id && (
                    <Link
                        to={`/id-card/${card.id}`}
                        className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
                    >
                        View ID Card →
                    </Link>
                )}
            </div>
        </div>
    );
};

export const IdCardList: React.FC = () => {
    const ctx = useContext(UserProfileContext);
    if (!ctx) return null;
    const { idCards, idCardLoading, idCardPage, idCardTotalPages, loadIdCards } = ctx;

    if (idCardLoading) {
        return (
            <div className="space-y-3">
                {[1, 2].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                ))}
            </div>
        );
    }

    if (idCards.length === 0) {
        return (
            <div className="text-center py-16">
                <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No ID card requests yet</p>
                <p className="text-slate-400 text-sm mt-1">Your ID card requests will appear here</p>
                <Link to="/id-generate" className="inline-block mt-4 btn-primary text-sm">
                    Apply for ID Card
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {idCards.map((c) => <IdCardRow key={c.id} card={c} />)}

            {/* Pagination */}
            {idCardTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        onClick={() => loadIdCards(idCardPage - 1)}
                        disabled={idCardPage <= 1}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-slate-600 font-medium">
                        {idCardPage} / {idCardTotalPages}
                    </span>
                    <button
                        onClick={() => loadIdCards(idCardPage + 1)}
                        disabled={idCardPage >= idCardTotalPages}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
};
