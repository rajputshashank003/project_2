import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import filter from 'lodash/filter';
import { getIdCardRequests, updateIdCardStatus } from '../../utils/api_request/id_cards';
import { uploadSignature, deleteSignature } from '../../utils/api_request/ngo';
import { useApp } from '../../context/AppContext';
import { validateImageFile } from '../../utils/helpers';
import type { IdCard, IdCardStatus } from '../../types/id_card';

type FilterStatus = 'all' | IdCardStatus;

export const useAdminRequestIdCard = () => {
  const { ngoConfig, setNgoConfig } = useApp();
  const [requests, setRequests]           = useState<IdCard[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [filterStatus, setFilterStatus]   = useState<FilterStatus>('all');
  const [actionItem, setActionItem]       = useState<IdCard | null>(null);
  const [actionType, setActionType]       = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason]   = useState('');
  const [validityYears, setValidityYears] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewItem, setPreviewItem]     = useState<IdCard | null>(null);

  // Digital Signature Modal state
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureUploading, setSignatureUploading] = useState(false);

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const result = await getIdCardRequests();
      setRequests(result.data);
    } catch {
      // error toast already shown by axiosInstance interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = filterStatus === 'all'
    ? requests
    : filter(requests, (r) => r.status === filterStatus);

  const openApprove = (item: IdCard) => {
    if (!ngoConfig.signatureUrl) {
      toast.error('Please upload your digital signature first before approving ID cards.');
      setSignatureModalOpen(true);
      return;
    }
    setActionItem(item);
    setActionType('approve');
    setRejectReason('');
    setValidityYears(0);
  };

  const openReject  = (item: IdCard) => { setActionItem(item); setActionType('reject');  setRejectReason(''); };
  const closeAction = () => { setActionItem(null); setActionType(null); setRejectReason(''); setValidityYears(0); };

  const handleSignatureUpload = async (file: File) => {
    const error = validateImageFile(file);
    if (error) { toast.error(error); return; }
    setSignatureUploading(true);
    try {
      const updated = await uploadSignature(file);
      setNgoConfig(updated);
      toast.success('Digital signature uploaded successfully!');
    } catch {
      toast.error('Failed to upload digital signature.');
    } finally {
      setSignatureUploading(false);
    }
  };

  const handleDeleteSignature = async () => {
    setSignatureUploading(true);
    try {
      const updated = await deleteSignature();
      setNgoConfig(updated);
      toast.success('Digital signature removed.');
    } catch {
      toast.error('Failed to delete digital signature.');
    } finally {
      setSignatureUploading(false);
    }
  };

  const handleApprove = useCallback(async () => {
    if (!actionItem) return;
    if (!ngoConfig.signatureUrl) {
      toast.error('Please upload your digital signature first before approving ID cards.');
      closeAction();
      setSignatureModalOpen(true);
      return;
    }

    setActionLoading(true);
    try {
      // Backend auto-generates uniqueCardNumber and issueDate on approval
      const updated = await updateIdCardStatus(actionItem.id, {
        status: 'approved',
        validityYears,
      });

      // Update local state with the full record returned by backend
      setRequests((prev) =>
        prev.map((r) => r.id === actionItem.id ? updated : r)
      );
      toast.success(`ID card approved for ${actionItem.userName}`);
      closeAction();
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }, [actionItem, ngoConfig, validityYears]);

  const handleReject = useCallback(async () => {
    if (!actionItem) return;
    if (!rejectReason.trim()) { toast.error('Please enter a rejection reason'); return; }
    setActionLoading(true);
    try {
      const updated = await updateIdCardStatus(actionItem.id, {
        status: 'rejected',
        rejectionReason: rejectReason,
      });

      setRequests((prev) =>
        prev.map((r) => r.id === actionItem.id ? updated : r)
      );
      toast.success(`Request rejected for ${actionItem.userName}`);
      closeAction();
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }, [actionItem, rejectReason]);

  return {
    requests,
    filteredRequests,
    isLoading,
    filterStatus,
    actionItem,
    actionType,
    rejectReason,
    validityYears,
    actionLoading,
    previewItem,
    signatureModalOpen,
    signatureUploading,
    ngoConfig,
    setFilterStatus,
    setRejectReason,
    setValidityYears,
    setPreviewItem,
    setSignatureModalOpen,
    handleSignatureUpload,
    handleDeleteSignature,
    openApprove,
    openReject,
    closeAction,
    handleApprove,
    handleReject,
    loadRequests,
  };
};

export type ReturnTypeOfUseAdminRequestIdCard = ReturnType<typeof useAdminRequestIdCard>;
