import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useApp } from "../../context/AppContext";
import { updateNgoConfig } from "../../utils/api_request/ngo";
import { validateImageFile } from "../../utils/helpers";
import type { NgoConfig } from "../../types/ngo";

export const useAdminSettings = () => {
    const { ngoConfig, setNgoConfig } = useApp();
    const [form, setForm] = useState<NgoConfig>({ ...ngoConfig });
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        ngoConfig.logoUrl || null,
    );
    const [removeLogo, setRemoveLogo] = useState(false);

    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(
        ngoConfig.signatureUrl || null,
    );
    const [removeSignature, setRemoveSignature] = useState(false);

    useEffect(() => {
        setForm({ ...ngoConfig });
        setLogoPreview(ngoConfig.logoUrl || null);
        setSignaturePreview(ngoConfig.signatureUrl || null);
        setLogoFile(null);
        setSignatureFile(null);
        setRemoveLogo(false);
        setRemoveSignature(false);
    }, [ngoConfig]);

    const handleFormChange = (field: keyof NgoConfig, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSelectLogo = (file: File) => {
        const error = validateImageFile(file);
        if (error) {
            toast.error(error);
            return;
        }
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
        setRemoveLogo(false);
        setIsDirty(true);
        toast.success(
            'Logo selected. Click "Save All Settings" below to apply.',
        );
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        setRemoveLogo(true);
        setIsDirty(true);
    };

    const handleSelectSignature = (file: File) => {
        const error = validateImageFile(file);
        if (error) {
            toast.error(error);
            return;
        }
        setSignatureFile(file);
        setSignaturePreview(URL.createObjectURL(file));
        setRemoveSignature(false);
        setIsDirty(true);
        toast.success(
            'Signature selected. Click "Save All Settings" below to apply.',
        );
    };

    const handleRemoveSignature = () => {
        setSignatureFile(null);
        setSignaturePreview(null);
        setRemoveSignature(true);
        setIsDirty(true);
    };

    const handleSaveSettings = useCallback(async () => {
        if (!form.name.trim()) {
            toast.error("NGO Name is required");
            return;
        }
        if (!form.presidentName.trim()) {
            toast.error("President Name is required");
            return;
        }
        if (!form.address.trim()) {
            toast.error("Address is required");
            return;
        }

        setIsSaving(true);
        try {
            const updated = await updateNgoConfig({
                ...form,
                logoFile: logoFile || undefined,
                signatureFile: signatureFile || undefined,
                removeLogo: removeLogo || undefined,
                removeSignature: removeSignature || undefined,
            });
            setNgoConfig(updated);
            setForm(updated);
            setLogoFile(null);
            setSignatureFile(null);
            setRemoveLogo(false);
            setRemoveSignature(false);
            setIsDirty(false);
            toast.success(
                "Organization settings and assets updated successfully!",
            );
        } catch {
            toast.error("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    }, [
        form,
        logoFile,
        signatureFile,
        removeLogo,
        removeSignature,
        setNgoConfig,
    ]);

    return {
        form,
        isSaving,
        isDirty,
        logoPreview,
        signaturePreview,
        handleFormChange,
        handleSelectLogo,
        handleRemoveLogo,
        handleSelectSignature,
        handleRemoveSignature,
        handleSaveSettings,
    };
};

export type ReturnTypeOfUseAdminSettings = ReturnType<typeof useAdminSettings>;
