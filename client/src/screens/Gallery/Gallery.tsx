import React from "react";
import { Image as ImageIcon } from "lucide-react";
import { useGallery } from "./useGallery";
import {
    GalleryHero,
    GalleryCard,
    GalleryLightbox,
} from "./components/GalleryComponents";

const Gallery: React.FC = () => {
    const { images, isLoading, activeImage, setActiveImage } = useGallery();

    return (
        <div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <GalleryHero count={images.length} />

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="aspect-square bg-slate-200/80 rounded-2xl"
                        />
                    ))}
                </div>
            ) : images.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-xl mx-auto px-6">
                    <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                        No Gallery Photos Yet
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Our team will be uploading photos from recent NGO events
                        and field drives soon.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {images.map((image) => (
                        <GalleryCard
                            key={image.id}
                            image={image}
                            onClick={() => setActiveImage(image)}
                        />
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            <GalleryLightbox
                image={activeImage}
                onClose={() => setActiveImage(null)}
            />
        </div>
    );
};

export default Gallery;
