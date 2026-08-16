export interface EventImage {
    id: string;
    eventId?: string;
    imageUrl: string;
    caption?: string;
}

export interface NGOEvent {
    id: string;
    title: string;
    description: string;
    images: EventImage[];
    createdAt: string;
    createdBy: string;
}

export type EventImageItem =
    | { type: "new"; file: File; caption?: string }
    | { type: "existing"; url: string; caption?: string };

export interface CreateEventPayload {
    title: string;
    description: string;
    images: EventImageItem[];
}

export interface UpdateEventPayload {
    title?: string;
    description?: string;
    images?: EventImageItem[];
}
