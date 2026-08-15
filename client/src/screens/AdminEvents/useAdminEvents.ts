import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../utils/api_request/events';
import { validateImageFile } from '../../utils/helpers';
import type { NGOEvent, EventImageItem } from '../../types/event';

type PendingImage =
  | { type: 'existing'; id: string; imageUrl: string; caption?: string }
  | { type: 'new'; file: File; previewUrl: string; caption?: string };

interface EventForm {
  title: string;
  description: string;
}

const EMPTY_FORM: EventForm = { title: '', description: '' };
const MAX_IMAGES = 3;

export const useAdminEvents = () => {
  const [events, setEvents]         = useState<NGOEvent[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<NGOEvent | null>(null);
  const [form, setForm]             = useState<EventForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<EventForm & { images: string }>>({});
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [isSaving, setIsSaving]     = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const result = await getEvents();
      setEvents(result.data);
    } catch {
      // error toast already shown by axiosInstance interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const openAdd = useCallback(() => {
    setForm(EMPTY_FORM);
    setPendingImages([]);
    setFormErrors({});
    setEditTarget(null);
    setIsModalOpen(true);
  }, []);

  const openEdit = useCallback((event: NGOEvent) => {
    setForm({ title: event.title, description: event.description });
    setPendingImages(event.images.map((img) => ({ type: 'existing' as const, id: img.id, imageUrl: img.imageUrl, caption: img.caption })));
    setFormErrors({});
    setEditTarget(event);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => { setIsModalOpen(false); setEditTarget(null); }, []);

  const handleFormChange = (field: keyof EventForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleAddImage = useCallback((file: File) => {
    if (pendingImages.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed per event`);
      return;
    }
    const error = validateImageFile(file);
    if (error) { toast.error(error); return; }
    const previewUrl = URL.createObjectURL(file);
    setPendingImages((prev) => [...prev, { type: 'new', file, previewUrl }]);
    if (formErrors.images) setFormErrors((prev) => ({ ...prev, images: '' }));
  }, [pendingImages.length, formErrors.images]);

  const handleRemoveImage = useCallback((index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const validate = (): boolean => {
    const errs: Partial<EventForm & { images: string }> = {};
    if (!form.title.trim())       errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (pendingImages.length === 0) errs.images = 'Please add at least one image';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const images: EventImageItem[] = pendingImages.map((img) =>
        img.type === 'new'
          ? { type: 'new', file: img.file, caption: img.caption }
          : { type: 'existing', url: img.imageUrl, caption: img.caption }
      );
      if (editTarget) {
        const updated = await updateEvent(editTarget.id, { title: form.title.trim(), description: form.description.trim(), images });
        setEvents((prev) => prev.map((e) => e.id === updated.id ? updated : e));
        toast.success('Event updated!');
      } else {
        const created = await createEvent({ title: form.title.trim(), description: form.description.trim(), images });
        setEvents((prev) => [created, ...prev]);
        toast.success('Event created!');
      }
      closeModal();
    } catch {
      toast.error('Failed to save event. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [form, pendingImages, editTarget]);

  const openDeleteConfirm  = useCallback((id: string) => setDeleteTargetId(id), []);
  const cancelDelete       = useCallback(() => setDeleteTargetId(null), []);
  const confirmDelete      = useCallback(async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteEvent(deleteTargetId);
      setEvents((prev) => prev.filter((e) => e.id !== deleteTargetId));
      toast.success('Event deleted');
      setDeleteTargetId(null);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTargetId]);

  return {
    events, isLoading, isModalOpen, editTarget, form, formErrors,
    pendingImages, isSaving, deleteTargetId, isDeleting,
    openAdd, openEdit, closeModal, handleFormChange,
    handleAddImage, handleRemoveImage, handleSave,
    openDeleteConfirm, cancelDelete, confirmDelete,
    MAX_IMAGES,
  };
};

export type ReturnTypeOfUseAdminEvents = ReturnType<typeof useAdminEvents>;
