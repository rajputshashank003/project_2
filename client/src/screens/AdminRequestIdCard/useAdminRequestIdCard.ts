import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import filter from 'lodash/filter';
import { getIdCardRequests, updateIdCardStatus } from '../../utils/api_request/id_cards';
import { notifyBoth, buildIdCardApprovalMessages, buildIdCardRejectionMessages } from '../../services/notification_service';
import { useApp } from '../../context/AppContext';
import { generateCardNumber } from '../../utils/helpers';
import type { IdCard, IdCardStatus } from '../../types/id_card';

type FilterStatus = 'all' | IdCardStatus;



export const useAdminRequestIdCard = () => {
  const { ngoConfig }     = useApp();
  const [requests, setRequests]         = useState<IdCard[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [actionItem, setActionItem]     = useState<IdCard | null>(null);
  const [actionType, setActionType]     = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [previewItem, setPreviewItem]   = useState<IdCard | null>(null);

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getIdCardRequests();
      setRequests(data);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = filterStatus === 'all'
    ? requests
    : filter(requests, (r) => r.status === filterStatus);

  const openApprove = (item: IdCard) => { setActionItem(item); setActionType('approve'); setRejectReason(''); };
  const openReject  = (item: IdCard) => { setActionItem(item); setActionType('reject');  setRejectReason(''); };
  const closeAction = () => { setActionItem(null); setActionType(null); setRejectReason(''); };

  const handleApprove = useCallback(async () => {
    if (!actionItem) return;
    setActionLoading(true);
    try {
      const cardNumber = generateCardNumber();
      await updateIdCardStatus(actionItem.id, { status: 'approved' });

      // Build & send dual notifications
      const msgs = buildIdCardApprovalMessages({
        userName:    actionItem.userName,
        cardNumber,
        designation: actionItem.designation,
      });
      await notifyBoth({
        user:      { phone: actionItem.phone, email: actionItem.email, name: actionItem.userName },
        admin:     { phone: ngoConfig.phone, email: ngoConfig.email, name: 'Admin' },
        userMsg:   msgs.userMsg,
        adminMsg:  msgs.adminMsg,
        subject:   msgs.subject,
        userHtml:  msgs.userHtml,
      });

      // Update local state
      setRequests((prev) =>
        prev.map((r) => r.id === actionItem.id ? { ...r, status: 'approved', uniqueCardNumber: cardNumber, reviewedAt: new Date().toISOString() } : r)
      );
      toast.success(`ID card approved for ${actionItem.userName}`);
      closeAction();
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }, [actionItem, ngoConfig]);

  const handleReject = useCallback(async () => {
    if (!actionItem) return;
    if (!rejectReason.trim()) { toast.error('Please enter a rejection reason'); return; }
    setActionLoading(true);
    try {
      await updateIdCardStatus(actionItem.id, { status: 'rejected', rejectionReason: rejectReason });

      const msgs = buildIdCardRejectionMessages({ userName: actionItem.userName, reason: rejectReason });
      await notifyBoth({
        user:    { phone: actionItem.phone, email: actionItem.email, name: actionItem.userName },
        admin:   { phone: ngoConfig.phone, email: ngoConfig.email, name: 'Admin' },
        userMsg:  msgs.userMsg,
        adminMsg: msgs.adminMsg,
        subject:  msgs.subject,
        userHtml: msgs.userHtml,
      });

      setRequests((prev) =>
        prev.map((r) => r.id === actionItem.id ? { ...r, status: 'rejected', rejectionReason: rejectReason, reviewedAt: new Date().toISOString() } : r)
      );
      toast.success(`Request rejected for ${actionItem.userName}`);
      closeAction();
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }, [actionItem, rejectReason, ngoConfig]);

  return {
    requests,
    filteredRequests,
    isLoading,
    filterStatus,
    actionItem,
    actionType,
    rejectReason,
    actionLoading,
    previewItem,
    ngoConfig,
    setFilterStatus,
    setRejectReason,
    setPreviewItem,
    openApprove,
    openReject,
    closeAction,
    handleApprove,
    handleReject,
    loadRequests,
  };
};

export type ReturnTypeOfUseAdminRequestIdCard = ReturnType<typeof useAdminRequestIdCard>;
