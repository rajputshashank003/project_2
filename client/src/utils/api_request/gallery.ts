/**
 * gallery.ts — API module for gallery images.
 */
import { request, unwrap } from "./utils";
import type { ApiResponse, PaginatedResponse } from "./utils";
import type { GalleryImage } from "../../types/ngo";

export const getGalleryImages = async (
    page = 1,
    limit = 50,
): Promise<PaginatedResponse<GalleryImage>> => {
    return request<PaginatedResponse<GalleryImage>>({
        url: "/gallery",
        method: "GET",
        params: { page, limit },
    });
};

export const uploadGalleryImage = async (
    data:
        | {
              image: File;
              caption?: string;
          }
        | FormData,
): Promise<GalleryImage> => {
    let body: FormData;
    if (data instanceof FormData) {
        body = data;
    } else {
        body = new FormData();
        body.append("image", data.image);
        if (data.caption) body.append("caption", data.caption);
    }
    const res = await request<ApiResponse<GalleryImage>>({
        url: "/gallery",
        method: "POST",
        data: body,
    });
    return unwrap(res);
};

export const deleteGalleryImage = async (id: string): Promise<void> => {
    await request<unknown>({ url: `/gallery/${id}`, method: "DELETE" });
};
