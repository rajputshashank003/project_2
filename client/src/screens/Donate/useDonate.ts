import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { createDonation } from "../../utils/api_request/donations";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import {
    validateImageFile,
    isValidEmail,
    isValidPhone,
    copyToClipboard,
} from "../../utils/helpers";
import type { CreateDonationPayload } from "../../types/donation";

interface DonationFormData {
    donorName: string;
    phone: string;
    email: string;
    amount: string;
    utrNumber: string;
}

const EMPTY_FORM: DonationFormData = {
    donorName: "",
    phone: "",
    email: "",
    amount: "",
    utrNumber: "",
};

export const useDonate = () => {
    const { ngoConfig, isConfigLoading } = useApp();
    const { user } = useAuth();

    const [form, setForm] = useState<DonationFormData>({
        ...EMPTY_FORM,
        donorName: user?.name || "",
        phone: user?.phone || "",
        email: user?.email || "",
    });

    useEffect(() => {
        if (!user) return;
        setForm((prev) => ({
            ...prev,
            donorName: prev.donorName || user.name || "",
            phone: prev.phone || user.phone || "",
            email: prev.email || user.email || "",
        }));
    }, [user]);
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState("");
    const [errors, setErrors] = useState<
        Partial<DonationFormData & { screenshot: string }>
    >({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submittedId, setSubmittedId] = useState("");
    const [copied, setCopied] = useState(false);
    const [copiedPhone, setCopiedPhone] = useState(false);
    const [copiedAccount, setCopiedAccount] = useState(false);
    const [copiedIfsc, setCopiedIfsc] = useState(false);

    const handleFormChange = (field: keyof DonationFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const handleScreenshotUpload = (file: File) => {
        const error = validateImageFile(file);
        if (error) {
            toast.error(error);
            return;
        }
        setScreenshotFile(file);
        const preview = URL.createObjectURL(file);
        setScreenshotPreview(preview);
        if (errors.screenshot)
            setErrors((prev) => ({ ...prev, screenshot: "" }));
    };

    const validate = (): boolean => {
        const newErrors: Partial<DonationFormData & { screenshot: string }> =
            {};
        if (!form.donorName.trim()) newErrors.donorName = "Name is required";
        if (!isValidPhone(form.phone))
            newErrors.phone = "Enter a valid 10-digit number";
        if (!isValidEmail(form.email))
            newErrors.email = "Enter a valid email address";
        if (!form.amount || Number(form.amount) <= 0)
            newErrors.amount = "Enter a valid donation amount";
        if (!screenshotFile)
            newErrors.screenshot = "Please upload a payment screenshot";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCopyUpi = async () => {
        const textToCopy = ngoConfig.upiId || "ngo@upi";
        const ok = await copyToClipboard(textToCopy);
        if (ok) {
            setCopied(true);
            toast.success("UPI ID copied!");
            setTimeout(() => setCopied(false), 2500);
        } else {
            toast.error("Failed to copy UPI ID");
        }
    };

    const handleCopyPhone = async () => {
        if (!ngoConfig.phone) return;
        const ok = await copyToClipboard(ngoConfig.phone);
        if (ok) {
            setCopiedPhone(true);
            toast.success("Phone number copied!");
            setTimeout(() => setCopiedPhone(false), 2500);
        } else {
            toast.error("Failed to copy phone number");
        }
    };

    const handleCopyAccount = async () => {
        if (!ngoConfig.accountNumber) return;
        const ok = await copyToClipboard(ngoConfig.accountNumber);
        if (ok) {
            setCopiedAccount(true);
            toast.success("Account number copied!");
            setTimeout(() => setCopiedAccount(false), 2500);
        } else {
            toast.error("Failed to copy account number");
        }
    };

    const handleCopyIfsc = async () => {
        if (!ngoConfig.ifscCode) return;
        const ok = await copyToClipboard(ngoConfig.ifscCode);
        if (ok) {
            setCopiedIfsc(true);
            toast.success("IFSC Code copied!");
            setTimeout(() => setCopiedIfsc(false), 2500);
        } else {
            toast.error("Failed to copy IFSC code");
        }
    };

    const handleSubmit = useCallback(async () => {
        if (!validate() || !screenshotFile) return;
        setIsSubmitting(true);
        try {
            const payload: CreateDonationPayload = {
                donorName: form.donorName.trim(),
                phone: form.phone,
                email: form.email,
                amount: Number(form.amount),
                paymentProof: screenshotFile,
                utrNumber: form.utrNumber.trim() || undefined,
            };
            const result = await createDonation(payload);
            setSubmittedId(result.id);
            setIsSuccess(true);
            toast.success(
                "Donation submitted! Admin will verify your payment shortly.",
            );
        } catch {
            toast.error("Submission failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }, [form, screenshotFile, validate]);

    const handleReset = () => {
        setForm({
            ...EMPTY_FORM,
            donorName: user?.name || "",
            phone: user?.phone || "",
        });
        setScreenshotFile(null);
        setScreenshotPreview("");
        setErrors({});
        setIsSuccess(false);
        setSubmittedId("");
    };

    return {
        form,
        screenshotFile,
        screenshotPreview,
        errors,
        isSubmitting,
        isSuccess,
        submittedId,
        copied,
        copiedPhone,
        copiedAccount,
        copiedIfsc,
        ngoConfig,
        isConfigLoading,
        handleFormChange,
        handleScreenshotUpload,
        handleCopyUpi,
        handleCopyPhone,
        handleCopyAccount,
        handleCopyIfsc,
        handleSubmit,
        handleReset,
    };
};

export type ReturnTypeOfUseDonate = ReturnType<typeof useDonate>;
