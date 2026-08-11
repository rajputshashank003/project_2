import React from 'react';
import { useAdminRequestIdCard } from './useAdminRequestIdCard';
import { AdminRequestIdCardContext } from './context';
import { IdCardRequestTable, RequestActionModal, IDCardPreviewModal } from './components/IdCardRequestComponents';
import { CreditCard, RefreshCw } from 'lucide-react';

const AdminRequestIdCardContent: React.FC = () => {
  const ctx = React.useContext(AdminRequestIdCardContext);
  if (!ctx) return null;
  const { requests, loadRequests } = ctx;

  const pending  = requests.filter((r) => r.status === 'pending').length;
  const approved = requests.filter((r) => r.status === 'approved').length;

  return (
    <div className="page-wrapper">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <CreditCard className="h-3 w-3" />
            Admin Panel
          </div>
          <h1 className="section-heading">ID Card Requests</h1>
          <p className="section-subheading">Review and approve volunteer ID card applications</p>
        </div>
        <button onClick={loadRequests} className="btn-outline py-2 flex items-center gap-2 self-start">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
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
