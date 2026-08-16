import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
    getNotices,
    createNotice,
    toggleNoticeActive,
    deleteNotice,
} from "../../utils/api_request/notices";
import { validateImageFile } from "../../utils/helpers";
import type { Notice, CreateNoticePayload } from "../../types/notice";

const EMPTY_FORM = { title: "", content: "", isActive: true };

export const useAdminNoticeboard = () => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState(EMPTY_FORM);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ title?: string; content?: string }>(
        {},
    );

    useEffect(() => {
        loadNotices();
    }, []);

    const loadNotices = async () => {
        setIsLoading(true);
        try {
            const result = await getNotices();
            setNotices(result.data);
        } catch {
            // error toast already shown by axiosInstance interceptor
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormChange = (field: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleImageUpload = (file: File) => {
        const error = validateImageFile(file);
        if (error) {
            toast.error(error);
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!form.title.trim()) newErrors.title = "Title is required";
        if (!form.content.trim()) newErrors.content = "Content is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = useCallback(async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const payload: CreateNoticePayload = {
                title: form.title.trim(),
                content: form.content.trim(),
                image: imageFile || undefined,
                isActive: form.isActive,
            };
            const newNotice = await createNotice(payload);
            setNotices((prev) => [newNotice, ...prev]);
            setForm(EMPTY_FORM);
            setImageFile(null);
            setImagePreview("");
            toast.success("Notice published!");
        } catch {
            // error toast already shown by axiosInstance interceptor
        } finally {
            setIsSubmitting(false);
        }
    }, [form, imageFile]);

    const handleToggleActive = useCallback(
        async (id: string, current: boolean) => {
            // Optimistic update
            setNotices((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, isActive: !current } : n,
                ),
            );
            try {
                const updated = await toggleNoticeActive(id, !current);
                // Sync with actual server response
                setNotices((prev) =>
                    prev.map((n) => (n.id === updated.id ? updated : n)),
                );
            } catch {
                // Revert optimistic update on failure
                setNotices((prev) =>
                    prev.map((n) =>
                        n.id === id ? { ...n, isActive: current } : n,
                    ),
                );
            }
        },
        [],
    );

    const handleDelete = useCallback(async (id: string) => {
        setNotices((prev) => prev.filter((n) => n.id !== id));
        try {
            await deleteNotice(id);
            toast.success("Notice deleted");
        } catch {
            // Revert optimistic delete on failure
            await loadNotices();
        }
    }, []);

    return {
        notices,
        isLoading,
        form,
        imageFile,
        imagePreview,
        isSubmitting,
        errors,
        handleFormChange,
        handleImageUpload,
        handleSubmit,
        handleToggleActive,
        handleDelete,
        loadNotices,
    };
};

export type ReturnTypeOfUseAdminNoticeboard = ReturnType<
    typeof useAdminNoticeboard
>;
