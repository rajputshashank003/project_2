import React from 'react';
import { useAdminRequestIdCard } from './useAdminRequestIdCard';
import { AdminRequestIdCardContext } from './context';
import { IdCardRequestTable, RequestActionModal, IDCardPreviewModal, SignatureModal } from './components/IdCardRequestComponents';
import { CreditCard, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

const AdminRequestIdCardContent: React.FC = () => {
  const ctx = React.useContext(AdminRequestIdCardContext);
  if (!ctx) return null;
  const { requests, loadRequests, setSignatureModalOpen, ngoConfig } = ctx;

  const pending  = requests.filter((r) => r.status === 'pending').length;
  const approved = requests.filter((r) => r.status === 'approved').length;

  return (
    <div className="page-wrapper">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <CreditCard className="h-3 w-3" />
            Admin Panel
          </div>
          <h1 className="section-heading">ID Card Requests</h1>
          <p className="section-subheading">Review and approve volunteer ID card applications</p>
        </div>
        <div className="flex items-center gap-2 self-start flex-wrap">
          <button
            onClick={() => setSignatureModalOpen(true)}
            className={`py-2 px-3 rounded-xl text-sm font-semibold flex items-center gap-2 border transition-all ${
              ngoConfig.signatureUrl
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            }`}
          >
            {ngoConfig.signatureUrl ? (
              <React.Fragment>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Digital Signature Set
              </React.Fragment>
            ) : (
              <React.Fragment>
                <AlertTriangle className="h-4 w-4 text-amber-600 animate-pulse" />
                Upload Digital Signature *
              </React.Fragment>
            )}
          </button>
          <button onClick={loadRequests} className="btn-outline py-2 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total',    value: requests.length,  color: 'slate' },
          { label: 'Pending',  value: pending,           color: 'amber' },
          { label: 'Approved', value: approved,          color: 'emerald' },
        ].map((stat) => (
          <div key={stat.label} className="card text-center py-4">
            <div className={`text-2xl font-extrabold text-${stat.color}-700 mb-0.5`}>{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <IdCardRequestTable />
      <RequestActionModal />
      <IDCardPreviewModal />
      <SignatureModal />
    </div>
  );
};

const AdminRequestIdCard: React.FC = () => {
  const state = useAdminRequestIdCard();
  return (
    <AdminRequestIdCardContext.Provider value={state}>
      <AdminRequestIdCardContent />
    </AdminRequestIdCardContext.Provider>
  );
};

export default AdminRequestIdCard;
