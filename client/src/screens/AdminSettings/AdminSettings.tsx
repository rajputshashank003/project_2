import React from 'react';
import { useAdminSettings } from './useAdminSettings';
import { AdminSettingsContext } from './context';
import {
  GeneralSettingsForm,
  OfficialsSettingsForm,
  ContactSettingsForm,
  PaymentSettingsForm,
  AssetSettingsForm,
} from './components/AdminSettingsComponents';
import { Settings, Save } from 'lucide-react';

const AdminSettingsContent: React.FC = () => {
  const ctx = React.useContext(AdminSettingsContext);
  if (!ctx) return null;
  const { isSaving, isDirty, handleSaveSettings } = ctx;

  return (
    <div className="page-wrapper max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <Settings className="h-3 w-3" />
            Admin Panel
          </div>
          <h1 className="section-heading">Organization Settings</h1>
          <p className="section-subheading">
            Manage NGO branding, president details, address, payment methods, and digital signature globally.
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving || !isDirty}
          className="btn-primary py-2.5 px-6 flex items-center gap-2 self-start disabled:opacity-50"
        >
          {isSaving ? (
            <React.Fragment>
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Saving...
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Save className="h-4 w-4" />
              Save All Settings
            </React.Fragment>
          )}
        </button>
      </div>

      <GeneralSettingsForm />
      <OfficialsSettingsForm />
      <ContactSettingsForm />
      <PaymentSettingsForm />
      <AssetSettingsForm />

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving || !isDirty}
          className="btn-primary py-3 px-8 text-base flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          Save All Settings
        </button>
      </div>
    </div>
  );
};

const AdminSettings: React.FC = () => {
  const state = useAdminSettings();
  return (
    <AdminSettingsContext.Provider value={state}>
      <AdminSettingsContent />
    </AdminSettingsContext.Provider>
  );
};

export default AdminSettings;
