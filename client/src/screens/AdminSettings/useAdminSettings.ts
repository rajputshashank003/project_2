import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';
import { updateNgoConfig, uploadLogo, deleteLogo, uploadSignature, deleteSignature } from '../../utils/api_request/ngo';
import { validateImageFile } from '../../utils/helpers';
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
      const updated = await uploadLogo(file);
      setNgoConfig(updated);
      setForm(updated);
      toast.success('Organization logo updated successfully!');
    } catch {
      toast.error('Failed to upload logo image.');
    }
  };

  const handleDeleteLogo = async () => {
    try {
      const updated = await deleteLogo();
      setNgoConfig(updated);
      setForm(updated);
      toast.success('Organization logo removed.');
    } catch {
      toast.error('Failed to remove logo.');
    }
  };

  const handleSignatureUpload = async (file: File) => {
    const error = validateImageFile(file);
    if (error) { toast.error(error); return; }
    try {
      const updated = await uploadSignature(file);
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
    handleDeleteLogo,
    handleSignatureUpload,
    handleDeleteSignature,
    handleSaveSettings,
  };
};

export type ReturnTypeOfUseAdminSettings = ReturnType<typeof useAdminSettings>;
