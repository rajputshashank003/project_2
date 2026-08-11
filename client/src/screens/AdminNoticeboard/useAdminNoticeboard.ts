import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getNotices, createNotice, toggleNoticeActive, deleteNotice } from '../../utils/api_request/notices';
import { fileToBase64, validateImageFile } from '../../utils/helpers';
import type { Notice, CreateNoticePayload } from '../../types/notice';

const EMPTY_FORM = { title: '', content: '', isActive: true };

export const useAdminNoticeboard = () => {
    const [notices, setNotices]           = useState<Notice[]>([]);
    const [isLoading, setIsLoading]       = useState(true);
    const [form, setForm]                 = useState(EMPTY_FORM);
    const [imageFile, setImageFile]       = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors]             = useState<{ title?: string; content?: string }>({});

    useEffect(() => { loadNotices(); }, []);

    const loadNotices = async () => {
        setIsLoading(true);
        try {
            const data = await getNotices();
            setNotices(data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormChange = (field: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleImageUpload = async (file: File) => {
        const error = validateImageFile(file);
        if (error) { toast.error(error); return; }
        setImageFile(file);
        setImagePreview(await fileToBase64(file));
    };

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!form.title.trim())   newErrors.title   = 'Title is required';
        if (!form.content.trim()) newErrors.content = 'Content is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = useCallback(async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const payload: CreateNoticePayload = {
                title:       form.title.trim(),
                content:     form.content.trim(),
                imageBase64: imagePreview || undefined,
                isActive:    form.isActive,
            };
            const newNotice = await createNotice(payload);
            setNotices((prev) => [newNotice, ...prev]);
            setForm(EMPTY_FORM);
            setImageFile(null);
            setImagePreview('');
            toast.success('Notice published!');
        } finally {
            setIsSubmitting(false);
        }
    }, [form, imagePreview]);

    const handleToggleActive = useCallback(async (id: string, current: boolean) => {
        // Optimistic
        setNotices((prev) => prev.map((n) => n.id === id ? { ...n, isActive: !current } : n));
        await toggleNoticeActive(id, !current);
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        setNotices((prev) => prev.filter((n) => n.id !== id));
        await deleteNotice(id);
        toast.success('Notice deleted');
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

export type ReturnTypeOfUseAdminNoticeboard = ReturnType<typeof useAdminNoticeboard>;
