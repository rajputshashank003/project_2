import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { createIdCardRequest } from "../../utils/api_request/id_cards";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import {
    validateImageFile,
    isValidEmail,
    isValidPhone,
    copyToClipboard,
} from "../../utils/helpers";
import type { UserDesignation } from "../../types/user";
import type { CreateIdCardPayload } from "../../types/id_card";

interface IdCardFormData {
    userName: string;
    phone: string;
    email: string;
    amount: string;
    address: string;
    designation: UserDesignation;
}

const EMPTY_FORM: IdCardFormData = {
    userName: "",
    phone: "",
    email: "",
    amount: "",
    address: "",
    designation: "member",
};

export const useIDGenerate = () => {
    const { user } = useAuth();
    const { ngoConfig, isConfigLoading } = useApp();

    const [form, setForm] = useState<IdCardFormData>({
        ...EMPTY_FORM,
        userName: user?.name || "",
        phone: user?.phone || "",
        email: user?.email || "",
    });

    useEffect(() => {
        if (!user) return;
        setForm((prev) => ({
            ...prev,
            userName: prev.userName || user.name || "",
            phone: prev.phone || user.phone || "",
            email: prev.email || user.email || "",
        }));
    }, [user]);
    const [passportFile, setPassportFile] = useState<File | null>(null);
    const [passportPreview, setPassportPreview] = useState("");
    const [paymentFile, setPaymentFile] = useState<File | null>(null);
    const [paymentPreview, setPaymentPreview] = useState("");
    const [errors, setErrors] = useState<
        Partial<IdCardFormData & { passport: string; payment: string }>
    >({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submittedId, setSubmittedId] = useState("");
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedPhone, setCopiedPhone] = useState(false);
    const [copiedAccount, setCopiedAccount] = useState(false);
    const [copiedIfsc, setCopiedIfsc] = useState(false);

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

    const handleFormChange = (field: keyof IdCardFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const handlePassportUpload = (file: File) => {
        const error = validateImageFile(file);
        if (error) {
            toast.error(error);
            return;
        }
        setPassportFile(file);
        const preview = URL.createObjectURL(file);
        setPassportPreview(preview);
        if (errors.passport) setErrors((prev) => ({ ...prev, passport: "" }));
    };

    const handlePaymentUpload = (file: File) => {
        const error = validateImageFile(file);
        if (error) {
            toast.error(error);
            return;
        }
        setPaymentFile(file);
        const preview = URL.createObjectURL(file);
        setPaymentPreview(preview);
        if (errors.payment) setErrors((prev) => ({ ...prev, payment: "" }));
    };

    const validate = (): boolean => {
        const newErrors: Partial<
            IdCardFormData & { passport: string; payment: string }
        > = {};
        if (!form.userName.trim()) newErrors.userName = "Name is required";
        if (!isValidPhone(form.phone))
            newErrors.phone = "Enter a valid 10-digit number";
        if (!isValidEmail(form.email))
            newErrors.email = "Enter a valid email address";
        const numAmount = Number(form.amount);
        if (!form.amount || isNaN(numAmount) || numAmount <= 0)
            newErrors.amount = "Enter a valid contribution amount (min ₹1)";
        if (!form.address.trim()) newErrors.address = "Address is required";
        if (!passportFile) newErrors.passport = "Passport photo is required";
        if (!paymentFile) newErrors.payment = "Payment screenshot is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = useCallback(async () => {
        if (!validate() || !passportFile || !paymentFile) return;
        setIsSubmitting(true);
        try {
            const payload: CreateIdCardPayload = {
                userName: form.userName.trim(),
                phone: form.phone,
                email: form.email,
                amount: Number(form.amount),
                address: form.address.trim(),
                designation: form.designation,
                passportPhoto: passportFile,
                paymentProof: paymentFile,
            };
            const result = await createIdCardRequest(payload);
            setSubmittedId(result.id);
            setIsSuccess(true);
            toast.success(
                "Request submitted! Admin will review and approve your ID card.",
            );
        } catch {
            toast.error("Submission failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }, [form, passportFile, paymentFile, validate]);

    const handleReset = () => {
        setForm({
            ...EMPTY_FORM,
            userName: user?.name || "",
            phone: user?.phone || "",
        });
        setPassportFile(null);
        setPassportPreview("");
        setPaymentFile(null);
        setPaymentPreview("");
        setErrors({});
        setIsSuccess(false);
        setSubmittedId("");
    };

    return {
        form,
        passportFile,
        passportPreview,
        paymentFile,
        paymentPreview,
        errors,
        isSubmitting,
        isSuccess,
        submittedId,
        isNoteModalOpen,
        setIsNoteModalOpen,
        copied,
        copiedPhone,
        copiedAccount,
        copiedIfsc,
        ngoConfig,
        isConfigLoading,
        handleFormChange,
        handlePassportUpload,
        handlePaymentUpload,
        handleCopyUpi,
        handleCopyPhone,
        handleCopyAccount,
        handleCopyIfsc,
        handleSubmit,
        handleReset,
    };
};

export type ReturnTypeOfUseIDGenerate = ReturnType<typeof useIDGenerate>;
