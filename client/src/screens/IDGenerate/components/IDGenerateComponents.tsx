import React, { useContext, useRef } from 'react';
import { Upload, CheckCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IDGenerateContext } from '../context';
import { DESIGNATIONS } from '../../../utils/constants';

const PhotoUploadBox: React.FC<{
  id: string;
  label: string;
  preview: string;
  error?: string;
  onUpload: (f: File) => void;
  hint?: string;
}> = ({ id, label, preview, error, onUpload, hint }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="form-label">{label}</label>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
      {preview ? (
        <div className="relative w-32 h-40 rounded-xl overflow-hidden border-2 border-emerald-400 cursor-pointer" onClick={() => ref.current?.click()}>
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium">Change</span>
          </div>
        </div>
      ) : (
        <button
          id={id}
          type="button"
          onClick={() => ref.current?.click()}
          className={`w-32 h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${
            error ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'
          }`}
        >
          <User className={`h-8 w-8 ${error ? 'text-red-300' : 'text-slate-300'}`} />
          <span className="text-xs text-slate-400 text-center px-2">{hint || 'Upload photo'}</span>
        </button>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export const IDForm: React.FC = () => {
  const ctx = useContext(IDGenerateContext);
  const paymentRef = useRef<HTMLInputElement>(null);
  if (!ctx) return null;
  const { form, passportPreview, paymentPreview, errors, isSubmitting, handleFormChange, handlePassportUpload, handlePaymentUpload, handleSubmit, ngoConfig } = ctx;

  return (
    <div className="card-md">
      <h2 className="text-base font-bold text-slate-900 mb-5">Your Information</h2>

      {/* Photo uploads row */}
      <div className="flex flex-wrap gap-6 mb-6">
        <PhotoUploadBox
          id="upload-passport-btn"
          label="Passport Size Photo *"
          preview={passportPreview}
          error={errors.passport}
          onUpload={handlePassportUpload}
          hint="Passport size photo"
        />
        <div className="flex-1 min-w-48">
          <label className="form-label">Payment Screenshot *</label>
          <input ref={paymentRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePaymentUpload(f); }} />
          {paymentPreview ? (
            <div className="relative h-40 rounded-xl overflow-hidden border border-slate-200 cursor-pointer" onClick={() => paymentRef.current?.click()}>
              <img src={paymentPreview} alt="Payment" className="w-full h-full object-contain bg-slate-50" />
            </div>
          ) : (
            <button
              id="upload-payment-btn"
              type="button"
              onClick={() => paymentRef.current?.click()}
              className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${
                errors.payment ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'
              }`}
            >
              <Upload className={`h-6 w-6 ${errors.payment ? 'text-red-400' : 'text-slate-400'}`} />
              <span className="text-sm text-slate-400">Payment proof</span>
              <span className="text-xs text-slate-400">Pay ₹ to {ngoConfig.upiId || 'NGO UPI'}</span>
            </button>
          )}
          {errors.payment && <p className="text-red-500 text-xs mt-1">{errors.payment}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="form-label">Full Name *</label>
          <input id="id-name" type="text" placeholder="Your full name" value={form.userName} onChange={(e) => handleFormChange('userName', e.target.value)} className={`form-input ${errors.userName ? 'border-red-400' : ''}`} />
          {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
        </div>
        <div>
          <label className="form-label">Phone Number *</label>
          <input id="id-phone" type="tel" inputMode="numeric" maxLength={10} placeholder="9000000000" value={form.phone} onChange={(e) => handleFormChange('phone', e.target.value.replace(/\D/g, ''))} className={`form-input ${errors.phone ? 'border-red-400' : ''}`} />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="form-label">Email Address *</label>
          <input id="id-email" type="email" placeholder="ramesh@email.com" value={form.email} onChange={(e) => handleFormChange('email', e.target.value)} className={`form-input ${errors.email ? 'border-red-400' : ''}`} />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="form-label">Designation *</label>
          <select id="id-designation" value={form.designation} onChange={(e) => handleFormChange('designation', e.target.value)} className="form-input">
            {DESIGNATIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="form-label">Address *</label>
        <textarea id="id-address" rows={2} placeholder="123, Main Street, City — State" value={form.address} onChange={(e) => handleFormChange('address', e.target.value)} className={`form-input resize-none ${errors.address ? 'border-red-400' : ''}`} />
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
      </div>

      <button id="submit-id-btn" onClick={handleSubmit} disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
        {isSubmitting ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Submitting…
          </span>
        ) : 'Submit ID Card Request'}
      </button>
    </div>
  );
};

export const IDSuccessModal: React.FC = () => {
  const ctx = useContext(IDGenerateContext);
  if (!ctx || !ctx.isSuccess) return null;
  const { submittedId, handleReset } = ctx;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-card-lg p-8 max-w-md w-full text-center animate-slide-up">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h2>
        <p className="text-slate-500 mb-3">Your ID card request has been submitted. Admin will review and approve it shortly.</p>
        <div className="bg-slate-50 rounded-xl px-4 py-3 mb-6 inline-block">
          <span className="text-xs text-slate-500">Request ID:</span>
          <div className="font-mono font-bold text-slate-800 text-sm">{submittedId}</div>
        </div>
        <p className="text-xs text-slate-400 mb-6">You'll receive SMS & email notifications once approved.</p>
        <div className="flex gap-3">
          <button onClick={handleReset} className="btn-outline flex-1 py-2.5">Submit Another</button>
          <Link to="/" className="btn-primary flex-1 py-2.5 text-center">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};
