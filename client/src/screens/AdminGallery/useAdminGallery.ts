import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getGalleryImages, uploadGalleryImage, deleteGalleryImage } from '../../utils/api_request/gallery';
import { fileToBase64, validateImageFile } from '../../utils/helpers';
import type { GalleryImage } from '../../types/ngo';

export const useAdminGallery = () => {
    const [images, setImages]       = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [caption, setCaption]     = useState('');
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting]         = useState(false);

    useEffect(() => { loadImages(); }, []);

    const loadImages = async () => {
        setIsLoading(true);
        try {
            const data = await getGalleryImages();
            setImages(data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = useCallback(async (file: File) => {
        const error = validateImageFile(file);
        if (error) { toast.error(error); return; }
        setUploading(true);
        try {
            const base64   = await fileToBase64(file);
            const newImage = await uploadGalleryImage({
                imageBase64: base64,
                caption:     caption.trim() || undefined,
            });
            setImages((prev) => [newImage, ...prev]);
            setCaption('');
            toast.success('Image uploaded!');
        } finally {
            setUploading(false);
        }
    }, [caption]);

    const handleDelete = useCallback(async (id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
        await deleteGalleryImage(id);
        toast.success('Image removed');
    }, []);

    const openDeleteConfirm  = useCallback((id: string) => setDeleteTargetId(id), []);
    const cancelDelete       = useCallback(() => setDeleteTargetId(null), []);
    const confirmDelete      = useCallback(async () => {
        if (!deleteTargetId) return;
        setIsDeleting(true);
        try {
            setImages((prev) => prev.filter((img) => img.id !== deleteTargetId));
            await deleteGalleryImage(deleteTargetId);
            toast.success('Image removed');
            setDeleteTargetId(null);
        } finally {
            setIsDeleting(false);
        }
    }, [deleteTargetId]);

    return {
        images,
        isLoading,
        uploading,
        caption,
        deleteTargetId,
        isDeleting,
        setCaption,
        handleUpload,
        handleDelete,
        openDeleteConfirm,
        cancelDelete,
        confirmDelete,
        loadImages,
    };
};

export type ReturnTypeOfUseAdminGallery = ReturnType<typeof useAdminGallery>;
