export interface EventImage {
  id: string;
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

export interface CreateEventPayload {
  title: string;
  description: string;
  images: { imageBase64: string; caption?: string }[];
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  images?: { imageBase64: string; caption?: string }[];
}
