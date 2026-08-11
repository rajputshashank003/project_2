import React, { useContext } from 'react';
import { Check, X, FileSpreadsheet, Search, Image } from 'lucide-react';
import { AdminRequestDonationContext } from '../context';
import Modal from '../../../components/Modal';
import { formatDate, formatCurrency, capitalize } from '../../../utils/helpers';

export const ExportBar: React.FC = () => {
  const ctx = useContext(AdminRequestDonationContext);
  if (!ctx) return null;
  const { searchQuery, filterStatus, setSearchQuery, setFilterStatus, handleExportExcel, filteredDonations } = ctx;

  const FILTERS = [
    { label: 'All',       value: 'all' },
    { label: 'Pending',   value: 'pending' },
    { label: 'Approved',  value: 'approved' },
    { label: 'Rejected',  value: 'rejected' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          id="donation-search"
          type="text"
          placeholder="Search by name, phone, or email…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value as any)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              filterStatus === f.value
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Export */}
      <button
        id="export-excel-btn"
        onClick={handleExportExcel}
        disabled={filteredDonations.length === 0}
        className="btn-outline py-2 flex items-center gap-2 shrink-0"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export Excel
      </button>
    </div>
  );
};

export const DonationRequestTable: React.FC = () => {
  const ctx = useContext(AdminRequestDonationContext);
  if (!ctx) return null;
  const { filteredDonations, isLoading, openApprove, openReject, setScreenshotModal } = ctx;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
      </div>
    );
  }

  if (filteredDonations.length === 0) {
    return <div className="text-center py-16 text-slate-400">No donations found.</div>;
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Donor</th>
            <th>Phone</th>
            <th>Amount</th>
            <th>UTR</th>
            <th>Requested On</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDonations.map((d) => (
            <tr key={d.id}>
              <td>
                <div>
                  <div className="font-semibold text-slate-900">{d.donorName}</div>
                  <div className="text-xs text-slate-400">{d.email}</div>
                </div>
              </td>
              <td>{d.phone}</td>
              <td>
                <span className="font-semibold text-emerald-700">{formatCurrency(d.amount)}</span>
              </td>
              <td className="font-mono text-xs text-slate-500">{d.utrNumber || '—'}</td>
              <td className="text-slate-500">{formatDate(d.requestedAt)}</td>
              <td>
                <span className={`badge ${
                  d.status === 'approved' ? 'badge-approved' :
                  d.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                }`}>
                  {capitalize(d.status)}
                </span>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  {d.paymentScreenshotUrl && (
                    <button
                      onClick={() => setScreenshotModal(d)}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                      title="View Screenshot"
                    >
                      <Image className="h-4 w-4" />
                    </button>
                  )}
                  {d.status === 'pending' && (
                    <>
                      <button
                        id={`approve-don-${d.id}`}
                        onClick={() => openApprove(d)}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        id={`reject-don-${d.id}`}
                        onClick={() => openReject(d)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const DonationActionModal: React.FC = () => {
  const ctx = useContext(AdminRequestDonationContext);
  if (!ctx) return null;
  const { actionItem, actionType, rejectReason, actionLoading, setRejectReason, closeAction, handleApprove, handleReject } = ctx;

  return (
    <Modal
      isOpen={!!actionItem && !!actionType}
      onClose={closeAction}
      title={actionType === 'approve' ? 'Approve Donation' : 'Reject Donation'}
      size="sm"
      footer={
        <>
          <button onClick={closeAction} className="btn-outline py-2" disabled={actionLoading}>Cancel</button>
          {actionType === 'approve' ? (
            <button id="confirm-approve-don" onClick={handleApprove} disabled={actionLoading} className="btn-primary py-2">
              {actionLoading ? 'Processing…' : 'Approve & Notify'}
            </button>
          ) : (
            <button id="confirm-reject-don" onClick={handleReject} disabled={actionLoading} className="btn-danger py-2">
              {actionLoading ? 'Processing…' : 'Reject & Notify'}
            </button>
          )}
        </>
      }
    >
      {actionItem && (
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-3 text-sm">
            <div className="text-slate-500 mb-1">Donation from</div>
            <div className="font-semibold text-slate-900">{actionItem.donorName}</div>
            <div className="text-emerald-700 font-bold text-lg">{formatCurrency(actionItem.amount)}</div>
          </div>
          <p className="text-slate-600 text-sm">
            {actionType === 'approve'
              ? 'Approving this donation will issue a certificate and notify both the donor and admin via SMS & Email.'
              : 'Rejecting will notify the donor and admin with your reason. Please be specific.'}
          </p>
          {actionType === 'reject' && (
            <div>
              <label className="form-label">Rejection Reason *</label>
              <textarea
                id="don-reject-reason"
                rows={3}
                placeholder="e.g. Payment screenshot is unclear, please resubmit"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="form-input resize-none"
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export const ScreenshotModal: React.FC = () => {
  const ctx = useContext(AdminRequestDonationContext);
  if (!ctx) return null;
  const { screenshotModal, setScreenshotModal } = ctx;

  return (
    <Modal isOpen={!!screenshotModal} onClose={() => setScreenshotModal(null)} title="Payment Screenshot" size="md">
      {screenshotModal?.paymentScreenshotUrl ? (
        <img src={screenshotModal.paymentScreenshotUrl} alt="Payment" className="w-full rounded-xl" />
      ) : (
        <div className="text-center py-8 text-slate-400">No screenshot available (demo mode)</div>
      )}
    </Modal>
  );
};
