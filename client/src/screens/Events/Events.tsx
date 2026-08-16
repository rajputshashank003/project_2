import React from "react";
import { useEvents } from "./useEvents";
import { EventsContext } from "./context";
import { EventCard } from "./components/EventComponents";
import { CalendarDays } from "lucide-react";

const EventsContent: React.FC = () => {
    const ctx = React.useContext(EventsContext);
    if (!ctx) return null;
    const { events, isLoading } = ctx;

    return (
        <div className="page-wrapper">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Our Events
                </div>
                <h1 className="section-heading mb-2">
                    Events &amp; Activities
                </h1>
                <p className="section-subheading text-base max-w-xl mx-auto">
                    Follow our journey — from community drives to awareness
                    campaigns, every event makes a difference.
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
                </div>
            ) : events.length === 0 ? (
                <div className="card text-center text-slate-400 py-20">
                    <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No events yet. Check back soon!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {events.map((e) => (
                        <EventCard key={e.id} eventId={e.id} />
                    ))}
                </div>
            )}
        </div>
    );
};

const Events: React.FC = () => {
    const state = useEvents();
    return (
        <EventsContext.Provider value={state}>
            <EventsContent />
        </EventsContext.Provider>
    );
};

export default Events;
