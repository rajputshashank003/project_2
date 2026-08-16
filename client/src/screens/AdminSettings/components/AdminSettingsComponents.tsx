import React, { useContext, useRef } from 'react';
import { AdminSettingsContext } from '../context';
import { Building2, User, Phone, CreditCard, PenTool, Trash2, Target } from 'lucide-react';

export const GeneralSettingsForm: React.FC = () => {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) return null;
  const { form, handleFormChange } = ctx;

  return (
    <div className="card-md space-y-4">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <Building2 className="h-4 w-4 text-emerald-600" />
        General Organization Info
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">NGO / Organization Name *</label>
          <input
            id="setting-ngo-name"
            type="text"
            value={form.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Tagline</label>
          <input
            id="setting-ngo-tagline"
            type="text"
            value={form.tagline}
            onChange={(e) => handleFormChange('tagline', e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Registration Number</label>
          <input
            id="setting-ngo-reg"
            type="text"
            value={form.registrationNumber}
            onChange={(e) => handleFormChange('registrationNumber', e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Founded Year</label>
          <input
            id="setting-ngo-year"
            type="number"
            min={1900}
            max={2100}
            value={form.foundedYear || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val.length <= 4) {
                handleFormChange('foundedYear', val === '' ? 0 : Number(val));
              }
            }}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );
};

export const MissionVisionSettingsForm: React.FC = () => {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) return null;
  const { form, handleFormChange } = ctx;

  return (
    <div className="card-md space-y-4">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <Target className="h-4 w-4 text-emerald-600" />
        Mission &amp; Vision (Displayed on Public About Page)
      </h2>

      <div className="space-y-4">
        <div>
          <label className="form-label">Our Mission</label>
          <textarea
            id="setting-ngo-mission"
            rows={3}
            placeholder="Describe the NGO's mission..."
            value={form.mission || ''}
            onChange={(e) => handleFormChange('mission', e.target.value)}
            className="form-input resize-none"
          />
        </div>
        <div>
          <label className="form-label">Our Vision</label>
          <textarea
            id="setting-ngo-vision"
            rows={3}
            placeholder="Describe the NGO's long-term vision..."
            value={form.vision || ''}
            onChange={(e) => handleFormChange('vision', e.target.value)}
            className="form-input resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export const OfficialsSettingsForm: React.FC = () => {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) return null;
  const { form, handleFormChange } = ctx;

  return (
    <div className="card-md space-y-4">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <User className="h-4 w-4 text-emerald-600" />
        Key Officials (Printed on ID Cards & Certificates)
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">President Name *</label>
          <input
            id="setting-president"
            type="text"
            value={form.presidentName}
            onChange={(e) => handleFormChange('presidentName', e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Secretary Name</label>
          <input
            id="setting-secretary"
            type="text"
            value={form.secretaryName}
            onChange={(e) => handleFormChange('secretaryName', e.target.value)}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );
};

export const ContactSettingsForm: React.FC = () => {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) return null;
  const { form, handleFormChange } = ctx;

  return (
    <div className="card-md space-y-4">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <Phone className="h-4 w-4 text-emerald-600" />
        Contact & Office Address
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Phone Number *</label>
          <input
            id="setting-phone"
            type="text"
            value={form.phone}
            onChange={(e) => handleFormChange('phone', e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Email Address *</label>
          <input
            id="setting-email"
            type="email"
            value={form.email}
            onChange={(e) => handleFormChange('email', e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div>
        <label className="form-label">Manager Phone Number (for Instant WhatsApp Alerts)</label>
        <input
          id="setting-manager-phone"
          type="text"
          placeholder="e.g. 919876543210"
          value={form.managerPhone || ''}
          onChange={(e) => handleFormChange('managerPhone', e.target.value)}
          className="form-input"
        />
        <p className="text-xs text-slate-500 mt-1">
          When a user requests a donation verification or volunteer ID card, an instant alert will be sent to this WhatsApp number with the applicant details and review link.
        </p>
      </div>

      <div>
        <label className="form-label">Office Address * (Printed on ID Card Back & Footer)</label>
        <textarea
          id="setting-address"
          rows={2}
          value={form.address}
          onChange={(e) => handleFormChange('address', e.target.value)}
          className="form-input resize-none"
        />
      </div>
    </div>
  );
};

export const PaymentSettingsForm: React.FC = () => {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) return null;
  const { form, handleFormChange } = ctx;

  return (
    <div className="card-md space-y-4">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-emerald-600" />
        Payment Options (UPI & Bank Account Transfer)
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">UPI ID</label>
          <input
            id="setting-upi-id"
            type="text"
            value={form.upiId}
            onChange={(e) => handleFormChange('upiId', e.target.value)}
            className="form-input font-mono"
          />
        </div>
        <div>
          <label className="form-label">UPI Account Name</label>
          <input
            id="setting-upi-name"
            type="text"
            value={form.upiName}
            onChange={(e) => handleFormChange('upiName', e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Bank Name</label>
          <input
            id="setting-bank-name"
            type="text"
            placeholder="e.g. State Bank of India"
            value={form.bankName || ''}
            onChange={(e) => handleFormChange('bankName', e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Account Number</label>
          <input
            id="setting-account-num"
            type="text"
            placeholder="e.g. 123456789012"
            value={form.accountNumber || ''}
            onChange={(e) => handleFormChange('accountNumber', e.target.value)}
            className="form-input font-mono"
          />
        </div>
        <div>
          <label className="form-label">IFSC Code</label>
          <input
            id="setting-ifsc"
            type="text"
            placeholder="e.g. SBIN0001234"
            value={form.ifscCode || ''}
            onChange={(e) => handleFormChange('ifscCode', e.target.value)}
            className="form-input font-mono uppercase"
          />
        </div>
        <div>
          <label className="form-label">Account Holder Name</label>
          <input
            id="setting-account-holder"
            type="text"
            placeholder="e.g. NGO Foundation"
            value={form.accountHolderName || ''}
            onChange={(e) => handleFormChange('accountHolderName', e.target.value)}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );
};

export const StatsSettingsForm: React.FC = () => {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) return null;
  const { form, handleFormChange } = ctx;

  return (
    <div className="card-md space-y-4">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <Building2 className="h-4 w-4 text-emerald-600" />
        Impact &amp; Statistics (Displayed on Home &amp; About Pages)
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="form-label">Beneficiaries / Lives Impacted</label>
          <input
            id="setting-stat-beneficiaries"
            type="text"
            placeholder="e.g. 10,000+"
            value={form.statBeneficiaries || ''}
            onChange={(e) => handleFormChange('statBeneficiaries', e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Active Volunteers</label>
          <input
            id="setting-stat-volunteers"
            type="text"
            placeholder="e.g. 500+"
            value={form.statVolunteers || ''}
            onChange={(e) => handleFormChange('statVolunteers', e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Events Held</label>
          <input
            id="setting-stat-events"
            type="text"
            placeholder="e.g. 120+"
            value={form.statEventsHeld || ''}
            onChange={(e) => handleFormChange('statEventsHeld', e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Donations Received</label>
          <input
            id="setting-stat-donations"
            type="text"
            placeholder="e.g. ₹50L+"
            value={form.statDonations || ''}
            onChange={(e) => handleFormChange('statDonations', e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Years of Service / Active</label>
          <input
            id="setting-stat-years"
            type="text"
            placeholder="e.g. 8+"
            value={form.statYearsActive || ''}
            onChange={(e) => handleFormChange('statYearsActive', e.target.value)}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );
};

export const AssetSettingsForm: React.FC = () => {
  const ctx = useContext(AdminSettingsContext);
  const logoRef = useRef<HTMLInputElement>(null);
  const sigRef  = useRef<HTMLInputElement>(null);

  if (!ctx) return null;
  const { logoPreview, signaturePreview, handleSelectLogo, handleRemoveLogo, handleSelectSignature, handleRemoveSignature } = ctx;

  return (
    <div className="card-md space-y-4">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <PenTool className="h-4 w-4 text-emerald-600" />
        Branding &amp; Digital Signature
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Logo upload */}
        <div>
          <label className="form-label">NGO Logo</label>
          <input
            ref={logoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleSelectLogo(f);
              e.target.value = '';
            }}
          />
          <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 bg-slate-50">
            {logoPreview ? (
              <React.Fragment>
                <img src={logoPreview} alt="NGO Logo" className="h-14 w-14 object-contain bg-white rounded-lg p-1 border" />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => logoRef.current?.click()}
                    className="btn-outline py-1.5 px-2.5 text-xs"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="btn-danger py-1.5 px-2.5 text-xs"
                    title="Remove Logo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className="h-14 w-14 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                  NGO
                </div>
                <button
                  type="button"
                  onClick={() => logoRef.current?.click()}
                  className="btn-outline py-1.5 px-3 text-xs"
                >
                  Select Logo
                </button>
              </React.Fragment>
            )}
          </div>
        </div>

        {/* Signature upload */}
        <div>
          <label className="form-label">President Digital Signature</label>
          <input
            ref={sigRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleSelectSignature(f);
              e.target.value = '';
            }}
          />
          <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 bg-slate-50">
            {signaturePreview ? (
              <React.Fragment>
                <img src={signaturePreview} alt="Signature" className="h-12 object-contain bg-white rounded p-1 border" />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => sigRef.current?.click()}
                    className="btn-outline py-1.5 px-2.5 text-xs"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveSignature}
                    className="btn-danger py-1.5 px-2.5 text-xs"
                    title="Remove Signature"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </React.Fragment>
            ) : (
              <button
                type="button"
                onClick={() => sigRef.current?.click()}
                className="btn-outline py-2 px-4 text-xs w-full text-center"
              >
                Select Digital Signature
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
