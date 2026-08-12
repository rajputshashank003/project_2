import React, { useContext, useRef } from 'react';
import { Check, X, Eye, PenTool } from 'lucide-react';
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
              {filteredRequests.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="font-semibold text-slate-900">{item.userName}</div>
                    <div className="text-xs text-slate-400">{item.email || '—'}</div>
                  </td>
                  <td className="font-mono text-xs">{item.phone}</td>
                  <td>
                    <span className="badge badge-approved">{capitalize(item.designation)}</span>
                  </td>
                  <td className="text-xs text-slate-500">{formatDate(item.requestedAt)}</td>
                  <td>
                    <span className={`badge badge-${item.status}`}>
                      {capitalize(item.status)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Preview ID Card"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {item.status === 'pending' && (
                        <React.Fragment>
                          <button
                            onClick={() => openApprove(item)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Approve Request"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openReject(item)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Reject Request"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </React.Fragment>
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
  const {
    actionItem,
    actionType,
    rejectReason,
    actionLoading,
    setRejectReason,
    closeAction,
    handleApprove,
    handleReject,
  } = ctx;

  return (
    <Modal
      isOpen={!!actionItem}
      onClose={closeAction}
      title={actionType === 'approve' ? 'Approve ID Card Request' : 'Reject ID Card Request'}
      size="sm"
      footer={
        <React.Fragment>
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
        </React.Fragment>
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
    ngoName:          ngoConfig.name,
    ngoLogo:          ngoConfig.logoUrl,
    cardNumber:       previewItem.uniqueCardNumber,
    holderName:       previewItem.userName,
    phone:            previewItem.phone,
    email:            previewItem.email,
    designation:      previewItem.designation,
    passportPhotoUrl: previewItem.passportPhotoUrl,
    issueDate:        previewItem.issueDate || previewItem.requestedAt,
    address:          previewItem.address,
    presidentName:    ngoConfig.presidentName,
    signatureUrl:     ngoConfig.signatureUrl,
  };

  return (
    <Modal isOpen={!!previewItem} onClose={() => setPreviewItem(null)} title="ID Card Preview" size="xl">
      <div className="flex justify-center overflow-x-auto">
        <IDCardCanvas data={cardData} showDownloadButtons />
      </div>
    </Modal>
  );
};

export const SignatureModal: React.FC = () => {
  const ctx = useContext(AdminRequestIdCardContext);
  const sigRef = useRef<HTMLInputElement>(null);
  if (!ctx) return null;
  const {
    signatureModalOpen,
    setSignatureModalOpen,
    signatureUploading,
    handleSignatureUpload,
    handleDeleteSignature,
    ngoConfig,
  } = ctx;

  return (
    <Modal
      isOpen={signatureModalOpen}
      onClose={() => setSignatureModalOpen(false)}
      title="Admin Digital Signature"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Upload your digital signature (PNG/JPG). This signature will be placed on the back of all approved ID cards.
        </p>

        <input
          ref={sigRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleSignatureUpload(f);
          }}
        />

        {ngoConfig.signatureUrl ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col items-center gap-3">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Current Signature</span>
            <div className="bg-white p-3 rounded-lg border border-amber-200 w-full max-w-xs flex justify-center">
              <img src={ngoConfig.signatureUrl} alt="Digital Signature" className="h-14 object-contain" />
            </div>
            <div className="flex gap-2 w-full max-w-xs">
              <button
                type="button"
                onClick={() => sigRef.current?.click()}
                disabled={signatureUploading}
                className="btn-outline flex-1 py-2 text-xs"
              >
                Change Signature
              </button>
              <button
                type="button"
                onClick={handleDeleteSignature}
                disabled={signatureUploading}
                className="btn-danger py-2 text-xs"
              >
                Delete Signature
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => sigRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <PenTool className="h-10 w-10 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Click to upload digital signature</span>
            <span className="text-xs text-slate-400">PNG or JPG, max 5MB</span>
          </div>
        )}
      </div>
    </Modal>
  );
};
