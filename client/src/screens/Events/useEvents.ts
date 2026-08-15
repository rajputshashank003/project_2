import { useState, useEffect, useCallback } from 'react';
import { getEvents } from '../../utils/api_request/events';
import type { NGOEvent } from '../../types/event';

export const useEvents = () => {
    const [events, setEvents]       = useState<NGOEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [slideIndexes, setSlideIndexes] = useState<Record<string, number>>({});

    useEffect(() => {
        getEvents()
            .then((result) => {
                setEvents(result.data);
                const init: Record<string, number> = {};
                result.data.forEach((e) => { init[e.id] = 0; });
                setSlideIndexes(init);
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    const goToSlide = useCallback((eventId: string, index: number) => {
        setSlideIndexes((prev) => ({ ...prev, [eventId]: index }));
    }, []);

    return { events, isLoading, slideIndexes, goToSlide };
};

export type ReturnTypeOfUseEvents = ReturnType<typeof useEvents>;
