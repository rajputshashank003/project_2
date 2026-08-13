import React, { useContext } from 'react';
import { ChevronLeft, ChevronRight, Calendar, ImageOff } from 'lucide-react';
import { EventsContext } from '../context';
import { formatDate } from '../../../utils/helpers';

export const EventCard: React.FC<{ eventId: string }> = ({ eventId }) => {
  const ctx = useContext(EventsContext);
  if (!ctx) return null;
  const { events, slideIndexes, goToSlide } = ctx;
  const event = events.find((e) => e.id === eventId);
  if (!event) return null;

  const currentIndex = slideIndexes[event.id] ?? 0;
  const images = event.images;
  const hasMultiple = images.length > 1;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-slate-100 flex flex-col">
      {/* Image carousel */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        {images.length > 0 ? (
          <img
            src={images[currentIndex].imageUrl}
            alt={images[currentIndex].caption || event.title}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="h-12 w-12 text-slate-300" />
          </div>
        )}

        {hasMultiple && (
          <>
            <button
              onClick={() => goToSlide(event.id, (currentIndex - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => goToSlide(event.id, (currentIndex + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(event.id, i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}

        {images[currentIndex]?.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-6">
            <span className="text-white text-xs">{images[currentIndex].caption}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(event.createdAt)}
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{event.title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed flex-1">{event.description}</p>
      </div>
    </div>
  );
};
