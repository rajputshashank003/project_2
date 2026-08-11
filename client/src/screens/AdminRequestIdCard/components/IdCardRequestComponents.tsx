import React, { useContext } from 'react';
import { Check, X, Eye } from 'lucide-react';
import { AdminRequestIdCardContext } from '../context';
import Modal from '../../../components/Modal';
import IDCardCanvas from '../../../components/IDCardCanvas';
import { formatDate, capitalize } from '../../../utils/helpers';

export const IdCardRequestTable: React.FC = () => {
  const ctx = useContext(AdminRequestIdCardContext);
  if (!ctx) return null;
  const { filteredRequests, isLoading, filterStatus, setFilterStatus, openApprove, openReject, setPreviewItem } = ctx;

  const FILTERS: Array<{ label: string; value: string }> = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value as any)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filterStatus === f.value
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No requests found.</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Phone</th>
                <th>Designation</th>
                <th>Requested On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div>
                      <div className="font-semibold text-slate-900">{req.userName}</div>
                      <div className="text-xs text-slate-400">{req.email}</div>
                    </div>
                  </td>
                  <td>{req.phone}</td>
                  <td>
                    <span className="badge bg-slate-100 text-slate-700 border border-slate-200">
                      {capitalize(req.designation)}
                    </span>
                  </td>
                  <td className="text-slate-500">{formatDate(req.requestedAt)}</td>
                  <td>
                    <span className={`badge ${
                      req.status === 'approved' ? 'badge-approved' :
                      req.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                    }`}>
                      {capitalize(req.status)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {req.status === 'pending' && (
                        <>
                          <button
                            id={`approve-id-${req.id}`}
                            onClick={() => openApprove(req)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            id={`reject-id-${req.id}`}
                            onClick={() => openReject(req)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {req.status === 'approved' && (
                        <button
                          onClick={() => setPreviewItem(req)}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                          title="Preview ID Card"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export const RequestActionModal: React.FC = () => {
  const ctx = useContext(AdminRequestIdCardContext);
  if (!ctx) return null;
  const { actionItem, actionType, rejectReason, actionLoading, setRejectReason, closeAction, handleApprove, handleReject } = ctx;

  const isOpen = !!actionItem && !!actionType;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAction}
      title={actionType === 'approve' ? 'Approve ID Card Request' : 'Reject ID Card Request'}
      size="sm"
      footer={
        <>
          <button onClick={closeAction} className="btn-outline py-2" disabled={actionLoading}>Cancel</button>
          {actionType === 'approve' ? (
            <button id="confirm-approve-id" onClick={handleApprove} disabled={actionLoading} className="btn-primary py-2">
              {actionLoading ? 'Processing…' : 'Approve & Notify'}
            </button>
          ) : (
            <button id="confirm-reject-id" onClick={handleReject} disabled={actionLoading} className="btn-danger py-2">
              {actionLoading ? 'Processing…' : 'Reject & Notify'}
            </button>
          )}
        </>
      }
    >
      {actionItem && (
        <div>
          <p className="text-slate-600 mb-4">
            {actionType === 'approve'
              ? `Approve ID card request for ${actionItem.userName}? A unique card number will be generated and notifications will be sent to both the applicant and admin.`
              : `Reject request for ${actionItem.userName}? Please provide a reason. Notifications will be sent to both parties.`}
          </p>
          {actionType === 'reject' && (
            <div>
              <label className="form-label">Rejection Reason *</label>
              <textarea
                id="reject-reason-input"
                rows={3}
                placeholder="e.g. Payment screenshot unclear, please resubmit"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="form-input resize-none"
              />
            </div>
          )}
          {actionType === 'approve' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-800">
              ✅ SMS + Email will be sent to <strong>{actionItem.userName}</strong> and admin upon approval.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export const IDCardPreviewModal: React.FC = () => {
  const ctx = useContext(AdminRequestIdCardContext);
  if (!ctx) return null;
  const { previewItem, setPreviewItem, ngoConfig } = ctx;

  if (!previewItem) return null;

  const cardData = {
    ngoName:         ngoConfig.name,
    ngoLogo:         ngoConfig.logoUrl,
    cardNumber:      previewItem.uniqueCardNumber,
    holderName:      previewItem.userName,
    phone:           previewItem.phone,
    email:           previewItem.email,
    designation:     previewItem.designation,
    passportPhotoUrl: previewItem.passportPhotoUrl,
    issueDate:       previewItem.issueDate || previewItem.requestedAt,
    address:         previewItem.address,
    presidentName:   ngoConfig.presidentName,
    signatureUrl:    ngoConfig.signatureUrl,
  };

  return (
    <Modal isOpen={!!previewItem} onClose={() => setPreviewItem(null)} title="ID Card Preview" size="xl">
      <div className="flex justify-center overflow-x-auto">
        <IDCardCanvas data={cardData} showDownloadButtons />
      </div>
    </Modal>
  );
};
