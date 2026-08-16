import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
    getGalleryImages,
    uploadGalleryImage,
    deleteGalleryImage,
} from "../../utils/api_request/gallery";
import { validateImageFile } from "../../utils/helpers";
import type { GalleryImage } from "../../types/ngo";

export const useAdminGallery = () => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [caption, setCaption] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        setIsLoading(true);
        try {
            const result = await getGalleryImages();
            setImages(result.data);
        } catch {
            // error toast already shown by axiosInstance interceptor
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectFile = useCallback((file: File) => {
        const error = validateImageFile(file);
        if (error) {
            toast.error(error);
            return;
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }, []);

    const handleClearSelectedFile = useCallback(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
    }, []);

    const handleSubmitUpload = useCallback(async () => {
        if (!selectedFile) {
            toast.error("Please select an image file first");
            return;
        }
        setUploading(true);
        try {
            const newImage = await uploadGalleryImage({
                image: selectedFile,
                caption: caption.trim() || undefined,
            });
            setImages((prev) => [newImage, ...prev]);
            setSelectedFile(null);
            setPreviewUrl(null);
            setCaption("");
            toast.success("Image uploaded to gallery successfully!");
        } catch {
            // error toast already shown by axiosInstance interceptor
        } finally {
            setUploading(false);
        }
    }, [selectedFile, caption]);

    const handleDelete = useCallback(async (id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
        await deleteGalleryImage(id);
        toast.success("Image removed");
    }, []);

    const openDeleteConfirm = useCallback(
        (id: string) => setDeleteTargetId(id),
        [],
    );
    const cancelDelete = useCallback(() => setDeleteTargetId(null), []);
    const confirmDelete = useCallback(async () => {
        if (!deleteTargetId) return;
        setIsDeleting(true);
        try {
            setImages((prev) =>
                prev.filter((img) => img.id !== deleteTargetId),
            );
            await deleteGalleryImage(deleteTargetId);
            toast.success("Image removed");
            setDeleteTargetId(null);
        } catch {
            // error toast already shown by axiosInstance interceptor
        } finally {
            setIsDeleting(false);
        }
    }, [deleteTargetId]);

    return {
        images,
        isLoading,
        uploading,
        caption,
        selectedFile,
        previewUrl,
        deleteTargetId,
        isDeleting,
        setCaption,
        handleSelectFile,
        handleClearSelectedFile,
        handleSubmitUpload,
        handleDelete,
        openDeleteConfirm,
        cancelDelete,
        confirmDelete,
        loadImages,
    };
};

export type ReturnTypeOfUseAdminGallery = ReturnType<typeof useAdminGallery>;
