import { useState, useEffect } from "react";
import { getNotices } from "../../utils/api_request/notices";
import { getGalleryImages } from "../../utils/api_request/gallery";
import filter from "lodash/filter";
import type { Notice } from "../../types/notice";
import type { GalleryImage } from "../../types/ngo";

export const useHome = () => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [galleryImages, setGallery] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeNoticeIndex, setActiveNoticeIndex] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    // Auto-advance noticeboard carousel every 5 s
    useEffect(() => {
        if (notices.length <= 1) return;
        const timer = setInterval(() => {
            setActiveNoticeIndex((prev) => (prev + 1) % notices.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [notices.length]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [noticeResult, galleryResult] = await Promise.allSettled([
                getNotices(),
                getGalleryImages(),
            ]);

            if (noticeResult.status === "fulfilled") {
                const active = filter(
                    noticeResult.value.data,
                    (n) => n.isActive,
                );
                setNotices(active);
            }

            if (galleryResult.status === "fulfilled") {
                setGallery(galleryResult.value.data);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const goToNotice = (index: number) => setActiveNoticeIndex(index);

    return {
        notices,
        galleryImages,
        isLoading,
        activeNoticeIndex,
        goToNotice,
        loadData,
    };
};

export type ReturnTypeOfUseHome = ReturnType<typeof useHome>;
