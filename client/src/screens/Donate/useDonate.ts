import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { createDonation } from '../../utils/api_request/donations';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { validateImageFile, isValidEmail, isValidPhone } from '../../utils/helpers';
import type { CreateDonationPayload } from '../../types/donation';

interface DonationFormData {
  donorName: string;
  phone: string;
  email: string;
  amount: string;
  utrNumber: string;
}

const EMPTY_FORM: DonationFormData = {
  donorName: '',
  phone: '',
  email: '',
  amount: '',
  utrNumber: '',
};

export const useDonate = () => {
  const { ngoConfig }  = useApp();
  const { user }       = useAuth();

  const [form, setForm]                         = useState<DonationFormData>({ ...EMPTY_FORM, donorName: user?.name || '', phone: user?.phone || '' });
  const [screenshotFile, setScreenshotFile]     = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [errors, setErrors]                     = useState<Partial<DonationFormData & { screenshot: string }>>({});
  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [isSuccess, setIsSuccess]               = useState(false);
  const [submittedId, setSubmittedId]           = useState('');
  const [copied, setCopied]                     = useState(false);
  const [copiedPhone, setCopiedPhone]           = useState(false);
  const [copiedAccount, setCopiedAccount]       = useState(false);
  const [copiedIfsc, setCopiedIfsc]             = useState(false);

  const handleFormChange = (field: keyof DonationFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleScreenshotUpload = (file: File) => {
    const error = validateImageFile(file);
    if (error) { toast.error(error); return; }
    setScreenshotFile(file);
    const preview = URL.createObjectURL(file);
    setScreenshotPreview(preview);
    if (errors.screenshot) setErrors((prev) => ({ ...prev, screenshot: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<DonationFormData & { screenshot: string }> = {};
    if (!form.donorName.trim())         newErrors.donorName  = 'Name is required';
    if (!isValidPhone(form.phone))      newErrors.phone      = 'Enter a valid 10-digit number';
    if (!isValidEmail(form.email))      newErrors.email      = 'Enter a valid email address';
    if (!form.amount || Number(form.amount) <= 0) newErrors.amount = 'Enter a valid donation amount';
    if (!screenshotFile)                newErrors.screenshot = 'Please upload a payment screenshot';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(ngoConfig.upiId).then(() => {
      setCopied(true);
      toast.success('UPI ID copied!');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(ngoConfig.phone).then(() => {
      setCopiedPhone(true);
      toast.success('Phone number copied!');
      setTimeout(() => setCopiedPhone(false), 2500);
    });
  };

  const handleCopyAccount = () => {
    if (!ngoConfig.accountNumber) return;
    navigator.clipboard.writeText(ngoConfig.accountNumber).then(() => {
      setCopiedAccount(true);
      toast.success('Account number copied!');
      setTimeout(() => setCopiedAccount(false), 2500);
    });
  };

  const handleCopyIfsc = () => {
    if (!ngoConfig.ifscCode) return;
    navigator.clipboard.writeText(ngoConfig.ifscCode).then(() => {
      setCopiedIfsc(true);
      toast.success('IFSC Code copied!');
      setTimeout(() => setCopiedIfsc(false), 2500);
    });
  };

  const handleSubmit = useCallback(async () => {
    if (!validate() || !screenshotFile) return;
    setIsSubmitting(true);
    try {
      const payload: CreateDonationPayload = {
        donorName:    form.donorName.trim(),
        phone:        form.phone,
        email:        form.email,
        amount:       Number(form.amount),
        paymentProof: screenshotFile,
        utrNumber:    form.utrNumber.trim() || undefined,
      };
      const result = await createDonation(payload);
      setSubmittedId(result.id);
      setIsSuccess(true);
      toast.success('Donation submitted! Admin will verify your payment shortly.');
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, screenshotFile, validate]);

  const handleReset = () => {
    setForm({ ...EMPTY_FORM, donorName: user?.name || '', phone: user?.phone || '' });
    setScreenshotFile(null);
    setScreenshotPreview('');
    setErrors({});
    setIsSuccess(false);
    setSubmittedId('');
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
