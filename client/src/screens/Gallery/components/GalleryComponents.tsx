import React from "react";
import {
    Image as ImageIcon,
    Sparkles,
    X,
    ZoomIn,
    Calendar,
} from "lucide-react";
import type { GalleryImage } from "../../../types/ngo";
import { formatDateShort } from "../../../utils/helpers";

interface GalleryHeroProps {
    count: number;
}

export const GalleryHero: React.FC<GalleryHeroProps> = ({ count }) => {
    return (
        <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                Photo Memories
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                Our Impact In Pictures
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Glimpses of community drives, outreach initiatives, relief
                programs, and moments of joy made possible by your support.
            </p>
            {count > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs">
                    <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                        {count} {count === 1 ? "Photo" : "Photos"} in Archive
                    </span>
                </div>
            )}
        </div>
    );
};

interface GalleryCardProps {
    image: GalleryImage;
    onClick: () => void;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({ image, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="group relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col aspect-4/3 sm:aspect-square"
        >
            <img
                src={image.imageUrl}
                alt={image.caption || "NGO Activity"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
            />
            {/* Gradient overlay: visible on mobile, hover on desktop */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5 sm:p-4 text-white">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] sm:text-xs text-emerald-300 font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {image.uploadedAt
                            ? formatDateShort(image.uploadedAt)
                            : "Photo"}
                    </span>
                    <span className="p-1 sm:p-1.5 rounded-full bg-white/20 backdrop-blur-xs text-white">
                        <ZoomIn className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </span>
                </div>
                {image.caption ? (
                    <p className="text-xs sm:text-sm font-semibold line-clamp-2 text-slate-100 leading-snug">
                        {image.caption}
                    </p>
                ) : (
                    <p className="text-[11px] sm:text-xs text-slate-300">
                        View photo
                    </p>
                )}
            </div>
        </div>
    );
};

interface GalleryLightboxProps {
    image: GalleryImage | null;
    onClose: () => void;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
    image,
    onClose,
}) => {
    if (!image) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                aria-label="Close image viewer"
            >
                <X className="h-6 w-6" />
            </button>

            <div
                className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={image.imageUrl}
                    alt={image.caption || "NGO Memory"}
                    className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
                />
                {image.caption && (
                    <div className="mt-4 bg-slate-900/90 border border-slate-800 rounded-xl px-5 py-3 text-center max-w-2xl">
                        <p className="text-white text-sm sm:text-base font-medium leading-relaxed">
                            {image.caption}
                        </p>
                        {image.uploadedAt && (
                            <span className="text-xs text-slate-400 mt-1 block">
                                Uploaded on {formatDateShort(image.uploadedAt)}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
