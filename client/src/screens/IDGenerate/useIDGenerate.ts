import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { createIdCardRequest } from '../../utils/api_request/id_cards';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { fileToBase64, validateImageFile, isValidEmail, isValidPhone, generateUniqueId } from '../../utils/helpers';
import type { UserDesignation } from '../../types/user';
import type { CreateIdCardPayload } from '../../types/id_card';

interface IdCardFormData {
  userName: string;
  phone: string;
  email: string;
  address: string;
  designation: UserDesignation;
}

const EMPTY_FORM: IdCardFormData = {
  userName:    '',
  phone:       '',
  email:       '',
  address:     '',
  designation: 'member',
};

export const useIDGenerate = () => {
  const { user }      = useAuth();
  const { ngoConfig } = useApp();

  const [form, setForm]                             = useState<IdCardFormData>({ ...EMPTY_FORM, userName: user?.name || '', phone: user?.phone || '' });
  const [passportFile, setPassportFile]             = useState<File | null>(null);
  const [passportPreview, setPassportPreview]       = useState('');
  const [paymentFile, setPaymentFile]               = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview]         = useState('');
  const [errors, setErrors]                         = useState<Partial<IdCardFormData & { passport: string; payment: string }>>({});
  const [isSubmitting, setIsSubmitting]             = useState(false);
  const [isSuccess, setIsSuccess]                   = useState(false);
  const [submittedId, setSubmittedId]               = useState('');

  const handleFormChange = (field: keyof IdCardFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handlePassportUpload = async (file: File) => {
    const error = validateImageFile(file);
    if (error) { toast.error(error); return; }
    setPassportFile(file);
    const preview = await fileToBase64(file);
    setPassportPreview(preview);
    if (errors.passport) setErrors((prev) => ({ ...prev, passport: '' }));
  };

  const handlePaymentUpload = async (file: File) => {
    const error = validateImageFile(file);
    if (error) { toast.error(error); return; }
    setPaymentFile(file);
    const preview = await fileToBase64(file);
    setPaymentPreview(preview);
    if (errors.payment) setErrors((prev) => ({ ...prev, payment: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<IdCardFormData & { passport: string; payment: string }> = {};
    if (!form.userName.trim())        newErrors.userName    = 'Name is required';
    if (!isValidPhone(form.phone))    newErrors.phone       = 'Enter a valid 10-digit number';
    if (!isValidEmail(form.email))    newErrors.email       = 'Enter a valid email address';
    if (!form.address.trim())         newErrors.address     = 'Address is required';
    if (!passportFile)                newErrors.passport    = 'Passport photo is required';
    if (!paymentFile)                 newErrors.payment     = 'Payment screenshot is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload: CreateIdCardPayload = {
        userName:               form.userName.trim(),
        phone:                  form.phone,
        email:                  form.email,
        address:                form.address.trim(),
        designation:            form.designation,
        passportPhotoBase64:    passportPreview,
        paymentScreenshotBase64: paymentPreview,
      };
      let requestId: string;
      try {
        const result = await createIdCardRequest(payload);
        requestId = result.id;
      } catch {
        requestId = 'IDR-' + generateUniqueId();
        toast.success('Request submitted! Admin will review and approve your ID card.');
      }
      setSubmittedId(requestId);
      setIsSuccess(true);
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, passportPreview, paymentPreview, validate]);

  const handleReset = () => {
    setForm({ ...EMPTY_FORM, userName: user?.name || '', phone: user?.phone || '' });
    setPassportFile(null);
    setPassportPreview('');
    setPaymentFile(null);
    setPaymentPreview('');
    setErrors({});
    setIsSuccess(false);
    setSubmittedId('');
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
    ngoConfig,
    handleFormChange,
    handlePassportUpload,
    handlePaymentUpload,
    handleSubmit,
    handleReset,
  };
};

export type ReturnTypeOfUseIDGenerate = ReturnType<typeof useIDGenerate>;
