export interface Notice {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    isActive: boolean;
    createdAt: string;
    createdBy: string;
}

export interface CreateNoticePayload {
    title: string;
    content: string;
    image?: File;
    isActive: boolean;
}
