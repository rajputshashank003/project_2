import React, { useContext, useRef } from 'react';
import { Copy, Check, Upload, X, CheckCircle, Heart } from 'lucide-react';
import { DonateContext } from '../context';
import { formatCurrency } from '../../../utils/helpers';
import { Link } from 'react-router-dom';

export const UpiDetails: React.FC = () => {
  const ctx = useContext(DonateContext);
  if (!ctx) return null;
  const { ngoConfig, copied, handleCopyUpi, copiedPhone, handleCopyPhone } = ctx;

  return (
    <div className="card-md mb-6">
      <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
          <span className="text-emerald-700 text-xs font-bold">&#8377;</span>
        </div>
        Payment Details
      </h2>

      {/* UPI row */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4 mb-3">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">UPI ID</div>
          <div className="font-mono font-semibold text-slate-900 text-sm">{ngoConfig.upiId || 'ngo@upi'}</div>
          <div className="text-xs text-slate-400 mt-0.5">{ngoConfig.upiName}</div>
        </div>
        <button
          id="copy-upi-btn"
          onClick={handleCopyUpi}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Phone payment row */}
      {ngoConfig.phone && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 mb-3">
          <div>
            <div className="text-xs text-slate-500 mb-0.5">Pay via Phone</div>
            <div className="font-mono font-semibold text-slate-900 text-sm">{ngoConfig.phone}</div>
            <div className="text-xs text-slate-400 mt-0.5">Call / WhatsApp to arrange payment</div>
          </div>
          <button
            id="copy-phone-btn"
            onClick={handleCopyPhone}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              copiedPhone
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {copiedPhone ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedPhone ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-2">
        Open any UPI app (GPay, PhonePe, Paytm) → Pay to UPI ID → Upload payment screenshot below
      </p>
    </div>
  );
};

export const DonationForm: React.FC = () => {
  const ctx = useContext(DonateContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!ctx) return null;

  const { form, screenshotPreview, errors, isSubmitting, handleFormChange, handleScreenshotUpload, handleSubmit } = ctx;

  const QUICK_AMOUNTS = [500, 1000, 2100, 5000, 11000];

  return (
    <div className="card-md">
      <h2 className="text-base font-bold text-slate-900 mb-5">Your Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="form-label">Full Name *</label>
          <input
            id="donor-name"
            type="text"
            placeholder="Your full name"
            value={form.donorName}
            onChange={(e) => handleFormChange('donorName', e.target.value)}
            className={`form-input ${errors.donorName ? 'border-red-400' : ''}`}
          />
          {errors.donorName && <p className="text-red-500 text-xs mt-1">{errors.donorName}</p>}
        </div>
        <div>
          <label className="form-label">Phone Number *</label>
          <input
            id="donor-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="9000000000"
            value={form.phone}
            onChange={(e) => handleFormChange('phone', e.target.value.replace(/\D/g, ''))}
            className={`form-input ${errors.phone ? 'border-red-400' : ''}`}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="form-label">Email Address *</label>
          <input
            id="donor-email"
            type="email"
            placeholder="ramesh@email.com"
            value={form.email}
            onChange={(e) => handleFormChange('email', e.target.value)}
            className={`form-input ${errors.email ? 'border-red-400' : ''}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="form-label">UTR / Reference No. (optional)</label>
          <input
            id="donor-utr"
            type="text"
            placeholder="123456789012"
            value={form.utrNumber}
            onChange={(e) => handleFormChange('utrNumber', e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label className="form-label">Donation Amount (₹) *</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleFormChange('amount', String(amt))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                form.amount === String(amt)
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
              }`}
            >
              {formatCurrency(amt)}
            </button>
          ))}
        </div>
        <input
          id="donor-amount"
          type="number"
          min={1}
          placeholder="Enter custom amount"
          value={form.amount}
          onChange={(e) => handleFormChange('amount', e.target.value)}
          className={`form-input ${errors.amount ? 'border-red-400' : ''}`}
        />
        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
      </div>

      {/* Screenshot Upload */}
      <div className="mb-6">
        <label className="form-label">Payment Screenshot *</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleScreenshotUpload(f); }}
        />
        {screenshotPreview ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200">
            <img src={screenshotPreview} alt="Payment screenshot" className="w-full max-h-48 object-contain bg-slate-50" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/90 hover:bg-white shadow text-slate-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            id="upload-screenshot-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 transition-colors ${
              errors.screenshot ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'
            }`}
          >
            <Upload className={`h-6 w-6 ${errors.screenshot ? 'text-red-400' : 'text-slate-400'}`} />
            <span className="text-sm text-slate-500">Click to upload payment screenshot</span>
            <span className="text-xs text-slate-400">JPG, PNG or WebP · Max 5MB</span>
          </button>
        )}
        {errors.screenshot && <p className="text-red-500 text-xs mt-1">{errors.screenshot}</p>}
      </div>

      <button
        id="submit-donation-btn"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="btn-primary w-full py-3 text-base"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Submitting…
          </span>
        ) : (
          <span className="flex items-center gap-2 justify-center">
            <Heart className="h-5 w-5" />
            Submit Donation
          </span>
        )}
      </button>
    </div>
  );
};

export const SuccessModal: React.FC = () => {
  const ctx = useContext(DonateContext);
  if (!ctx || !ctx.isSuccess) return null;
  const { submittedId, handleReset } = ctx;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-card-lg p-8 max-w-md w-full text-center animate-slide-up">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Donation Submitted!</h2>
        <p className="text-slate-500 mb-3">
          Thank you for your generous contribution. Our admin will verify your payment and issue your certificate shortly.
        </p>
        <div className="bg-slate-50 rounded-xl px-4 py-3 mb-6 inline-block">
          <span className="text-xs text-slate-500">Submission ID:</span>
          <div className="font-mono font-bold text-slate-800 text-sm">{submittedId}</div>
        </div>
        <p className="text-xs text-slate-400 mb-6">You'll receive SMS & email notifications once verified.</p>
        <div className="flex gap-3">
          <button onClick={handleReset} className="btn-outline flex-1 py-2.5">Make Another Donation</button>
          <Link to="/" className="btn-primary flex-1 py-2.5 text-center">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};
