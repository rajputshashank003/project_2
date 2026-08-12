import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';
import { updateNgoConfig, uploadSignature, deleteSignature } from '../../utils/api_request/ngo';
import { fileToBase64, validateImageFile } from '../../utils/helpers';
import type { NgoConfig } from '../../types/ngo';

export const useAdminSettings = () => {
  const { ngoConfig, setNgoConfig } = useApp();
  const [form, setForm]               = useState<NgoConfig>({ ...ngoConfig });
  const [isSaving, setIsSaving]       = useState(false);
  const [isDirty, setIsDirty]         = useState(false);

  useEffect(() => {
    setForm({ ...ngoConfig });
  }, [ngoConfig]);

  const handleFormChange = (field: keyof NgoConfig, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleLogoUpload = async (file: File) => {
    const error = validateImageFile(file);
    if (error) { toast.error(error); return; }
    try {
      const b64 = await fileToBase64(file);
      setForm((prev) => ({ ...prev, logoUrl: b64 }));
      setIsDirty(true);
      toast.success('Logo selected');
    } catch {
      toast.error('Failed to process logo image.');
    }
  };

  const handleSignatureUpload = async (file: File) => {
    const error = validateImageFile(file);
    if (error) { toast.error(error); return; }
    try {
      const b64 = await fileToBase64(file);
      const updated = await uploadSignature(b64);
      setNgoConfig(updated);
      setForm(updated);
      toast.success('Digital signature updated successfully!');
    } catch {
      toast.error('Failed to upload digital signature.');
    }
  };

  const handleDeleteSignature = async () => {
    try {
      const updated = await deleteSignature();
      setNgoConfig(updated);
      setForm(updated);
      toast.success('Digital signature deleted.');
    } catch {
      toast.error('Failed to delete digital signature.');
    }
  };

  const handleSaveSettings = useCallback(async () => {
    if (!form.name.trim()) { toast.error('NGO Name is required'); return; }
    if (!form.presidentName.trim()) { toast.error('President Name is required'); return; }
    if (!form.address.trim()) { toast.error('Address is required'); return; }

    setIsSaving(true);
    try {
      const updated = await updateNgoConfig(form);
      setNgoConfig(updated);
      setForm(updated);
      setIsDirty(false);
      toast.success('Organization settings updated globally across website!');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  }, [form, setNgoConfig]);

  return {
    form,
    isSaving,
    isDirty,
    handleFormChange,
    handleLogoUpload,
    handleSignatureUpload,
    handleDeleteSignature,
    handleSaveSettings,
  };
};

export type ReturnTypeOfUseAdminSettings = ReturnType<typeof useAdminSettings>;
