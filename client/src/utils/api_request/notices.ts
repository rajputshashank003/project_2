/**
 * notices.ts — API module for noticeboard notices.
 */
import { request, unwrap } from "./utils";
import type { ApiResponse, PaginatedResponse } from "./utils";
import type { Notice, CreateNoticePayload } from "../../types/notice";

export const getNotices = async (
    page = 1,
    limit = 50,
): Promise<PaginatedResponse<Notice>> => {
    return request<PaginatedResponse<Notice>>({
        url: "/notices",
        method: "GET",
        params: { page, limit },
    });
};

export const createNotice = async (
    data: CreateNoticePayload | FormData,
): Promise<Notice> => {
    let body: FormData;
    if (data instanceof FormData) {
        body = data;
    } else {
        body = new FormData();
        body.append("title", data.title);
        body.append("content", data.content);
        body.append("isActive", String(data.isActive));
        if (data.image) body.append("image", data.image);
    }
    const res = await request<ApiResponse<Notice>>({
        url: "/notices",
        method: "POST",
        data: body,
    });
    return unwrap(res);
};

export const toggleNoticeActive = async (
    id: string,
    isActive: boolean,
): Promise<Notice> => {
    const res = await request<ApiResponse<Notice>>({
        url: `/notices/${id}`,
        method: "PATCH",
        data: { isActive },
    });
    return unwrap(res);
};

export const deleteNotice = async (id: string): Promise<void> => {
    await request<unknown>({ url: `/notices/${id}`, method: "DELETE" });
};
