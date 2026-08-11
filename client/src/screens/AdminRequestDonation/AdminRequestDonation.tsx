import React from 'react';
import { useAdminRequestDonation } from './useAdminRequestDonation';
import { AdminRequestDonationContext } from './context';
import { ExportBar, DonationRequestTable, DonationActionModal, ScreenshotModal } from './components/DonationRequestComponents';
import { Heart, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const AdminRequestDonationContent: React.FC = () => {
  const ctx = React.useContext(AdminRequestDonationContext);
  if (!ctx) return null;
  const { donations, totalAmount, loadDonations } = ctx;

  const pending  = donations.filter((d) => d.status === 'pending').length;
  const approved = donations.filter((d) => d.status === 'approved').length;

  return (
    <div className="page-wrapper">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <Heart className="h-3 w-3" />
            Admin Panel
          </div>
          <h1 className="section-heading">Donation Requests</h1>
          <p className="section-subheading">Verify payment receipts and issue certificates</p>
        </div>
        <button onClick={loadDonations} className="btn-outline py-2 flex items-center gap-2 self-start">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total',           value: donations.length,            suffix: '' },
          { label: 'Pending',         value: pending,                     suffix: '' },
          { label: 'Approved',        value: approved,                    suffix: '' },
          { label: 'Total Collected', value: formatCurrency(totalAmount), suffix: '' },
        ].map((stat) => (
          <div key={stat.label} className="card text-center py-4">
            <div className="text-xl font-extrabold text-emerald-700 mb-0.5">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <ExportBar />
      <DonationRequestTable />
      <DonationActionModal />
      <ScreenshotModal />
    </div>
  );
};

const AdminRequestDonation: React.FC = () => {
  const state = useAdminRequestDonation();
  return (
    <AdminRequestDonationContext.Provider value={state}>
      <AdminRequestDonationContent />
    </AdminRequestDonationContext.Provider>
  );
};

export default AdminRequestDonation;
