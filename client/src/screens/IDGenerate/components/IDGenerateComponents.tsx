import React, { useContext, useRef } from "react";
import { User, CheckCircle, Copy, Check } from "lucide-react";
import { IDGenerateContext } from "../context";
import { DESIGNATIONS } from "../../../utils/constants";

export const IDPaymentDetails: React.FC = () => {
    const ctx = useContext(IDGenerateContext);
    if (!ctx) return null;
    const {
        ngoConfig,
        isConfigLoading,
        copied,
        handleCopyUpi,
        copiedPhone,
        handleCopyPhone,
        copiedAccount,
        handleCopyAccount,
        copiedIfsc,
        handleCopyIfsc,
    } = ctx;

    return (
        <div className="card-md mb-6 max-w-2xl mx-auto">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-700 text-xs font-bold">
                        ₹
                    </span>
                </div>
                Payment Details
            </h2>

            {isConfigLoading ? (
                <div className="space-y-3 py-1">
                    {/* UPI loading skeleton */}
                    <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-4 flex items-center justify-between gap-4 animate-pulse">
                        <div className="space-y-2">
                            <div className="h-3 w-16 bg-emerald-200/80 rounded" />
                            <div className="h-4 w-44 bg-emerald-200 rounded" />
                            <div className="h-3 w-28 bg-emerald-200/60 rounded" />
                        </div>
                        <div className="h-9 w-20 bg-emerald-200/70 rounded-lg shrink-0" />
                    </div>

                    {/* Phone loading skeleton */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 animate-pulse">
                        <div className="space-y-2">
                            <div className="h-3 w-24 bg-slate-200 rounded" />
                            <div className="h-4 w-36 bg-slate-200 rounded" />
                            <div className="h-3 w-52 bg-slate-200/60 rounded" />
                        </div>
                        <div className="h-9 w-20 bg-slate-200 rounded-lg shrink-0" />
                    </div>

                    {/* Bank Transfer loading skeleton */}
                    <div className="bg-blue-50/60 border border-blue-200/70 rounded-xl p-4 space-y-3 animate-pulse">
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="h-3 w-24 bg-blue-200/80 rounded" />
                                <div className="h-4 w-40 bg-blue-200 rounded" />
                                <div className="h-3 w-32 bg-blue-200/60 rounded" />
                            </div>
                            <div className="h-9 w-20 bg-blue-200/70 rounded-lg shrink-0" />
                        </div>
                    </div>
                </div>
            ) : (
                <React.Fragment>
                    {/* UPI row */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4 mb-3">
                        <div>
                            <div className="text-xs text-slate-500 mb-0.5">UPI ID</div>
                            <div className="font-mono font-semibold text-slate-900 text-sm">
                                {ngoConfig.upiId || "ngo@upi"}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                                {ngoConfig.upiName}
                            </div>
                        </div>
                        <button
                            id="copy-id-upi-btn"
                            type="button"
                            onClick={handleCopyUpi}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                copied
                                    ? "bg-emerald-600 text-white"
                                    : "bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            }`}
                        >
                            {copied ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>

                    {/* Phone payment row */}
                    {ngoConfig.phone && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 mb-3">
                            <div>
                                <div className="text-xs text-slate-500 mb-0.5">
                                    Pay via Phone
                                </div>
                                <div className="font-mono font-semibold text-slate-900 text-sm">
                                    {ngoConfig.phone}
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5">
                                    Call / WhatsApp to arrange payment
                                </div>
                            </div>
                            <button
                                id="copy-id-phone-btn"
                                type="button"
                                onClick={handleCopyPhone}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    copiedPhone
                                        ? "bg-emerald-600 text-white"
                                        : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                                }`}
                            >
                                {copiedPhone ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                                {copiedPhone ? "Copied!" : "Copy"}
                            </button>
                        </div>
                    )}

                    {/* Bank Account Transfer row */}
                    {ngoConfig.accountNumber && (
                        <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4 mb-3 space-y-2">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-xs text-blue-700 font-semibold mb-0.5">
                                        Bank Transfer
                                    </div>
                                    <div className="font-mono font-semibold text-slate-900 text-sm">
                                        {ngoConfig.accountNumber}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {ngoConfig.bankName || "Bank Account"}{" "}
                                        {ngoConfig.accountHolderName
                                            ? `(${ngoConfig.accountHolderName})`
                                            : ""}
                                    </div>
                                </div>
                                <button
                                    id="copy-id-account-btn"
                                    type="button"
                                    onClick={handleCopyAccount}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                        copiedAccount
                                            ? "bg-blue-600 text-white"
                                            : "bg-white border border-blue-300 text-blue-700 hover:bg-blue-50"
                                    }`}
                                >
                                    {copiedAccount ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                    {copiedAccount ? "Copied!" : "Copy"}
                                </button>
                            </div>

                            {ngoConfig.ifscCode && (
                                <div className="pt-2 border-t border-blue-100 flex items-center justify-between gap-2 text-xs">
                                    <span className="text-slate-600">
                                        IFSC Code:{" "}
                                        <strong className="font-mono text-slate-900">
                                            {ngoConfig.ifscCode}
                                        </strong>
                                    </span>
                                    <button
                                        id="copy-id-ifsc-btn"
                                        type="button"
                                        onClick={handleCopyIfsc}
                                        className="text-blue-700 hover:underline font-semibold flex items-center gap-1"
                                    >
                                        {copiedIfsc ? "Copied!" : "Copy IFSC"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </React.Fragment>
            )}

            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5 font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Donate here to generate ID card and paste screenshot below
            </p>
        </div>
    );
};

interface PhotoUploadBoxProps {
    id: string;
    label: string;
    preview: string;
    onUpload: (file: File) => void;
    error?: string;
    hint?: string;
}

const PhotoUploadBox: React.FC<PhotoUploadBoxProps> = ({
    id,
    label,
    preview,
    onUpload,
    error,
    hint,
}) => {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div>
            <label className="form-label">{label}</label>
            <input
                ref={ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUpload(f);
                }}
            />
            {preview ? (
                <div
                    className="relative w-32 h-40 rounded-xl overflow-hidden border-2 border-emerald-400 cursor-pointer"
                    onClick={() => ref.current?.click()}
                >
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 sm:bg-black/30 opacity-100 sm:opacity-0 sm:hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-black/50 sm:bg-transparent px-2 py-1 rounded">
                            Change
                        </span>
                    </div>
                </div>
            ) : (
                <button
                    id={id}
                    type="button"
                    onClick={() => ref.current?.click()}
                    className={`w-32 h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${
                        error
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50"
                    }`}
                >
                    <User
                        className={`h-8 w-8 ${error ? "text-red-300" : "text-slate-300"}`}
                    />
                    <span className="text-xs text-slate-400 text-center px-2">
                        {hint || "Upload photo"}
                    </span>
                </button>
            )}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export const IDForm: React.FC = () => {
    const ctx = useContext(IDGenerateContext);
    if (!ctx) return null;
    const {
        form,
        errors,
        isSubmitting,
        handleFormChange,
        handlePassportUpload,
        handlePaymentUpload,
        handleSubmit,
        passportPreview,
        paymentPreview,
    } = ctx;

    return (
        <div className="card-md max-w-2xl mx-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
                ID Card Application Form
            </h2>

            {/* Uploads section */}
            <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-slate-100">
                <PhotoUploadBox
                    id="upload-passport"
                    label="Passport Size Photo *"
                    preview={passportPreview}
                    onUpload={handlePassportUpload}
                    error={errors.passport}
                    hint="JPG/PNG, max 5MB"
                />
                <PhotoUploadBox
                    id="upload-payment"
                    label="Payment Screenshot *"
                    preview={paymentPreview}
                    onUpload={handlePaymentUpload}
                    error={errors.payment}
                    hint="Payment receipt"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="form-label">Full Name *</label>
                    <input
                        id="id-name"
                        type="text"
                        placeholder="Your full name"
                        value={form.userName}
                        onChange={(e) =>
                            handleFormChange("userName", e.target.value)
                        }
                        className={`form-input ${errors.userName ? "border-red-400" : ""}`}
                    />
                    {errors.userName && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.userName}
                        </p>
                    )}
                </div>
                <div>
                    <label className="form-label">Phone Number *</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium select-none">
                            +91
                        </span>
                        <input
                            id="id-phone"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="9000000000"
                            value={form.phone}
                            onChange={(e) =>
                                handleFormChange(
                                    "phone",
                                    e.target.value.replace(/\D/g, ""),
                                )
                            }
                            className={`form-input pl-14 ${errors.phone ? "border-red-400" : ""}`}
                        />
                    </div>
                    {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.phone}
                        </p>
                    )}
                </div>
                <div>
                    <label className="form-label">Email Address *</label>
                    <input
                        id="id-email"
                        type="email"
                        placeholder="ramesh@email.com"
                        value={form.email}
                        onChange={(e) =>
                            handleFormChange("email", e.target.value)
                        }
                        className={`form-input ${errors.email ? "border-red-400" : ""}`}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.email}
                        </p>
                    )}
                </div>
                <div>
                    <label className="form-label">Designation *</label>
                    <select
                        id="id-designation"
                        value={form.designation}
                        onChange={(e) =>
                            handleFormChange("designation", e.target.value)
                        }
                        className="form-input"
                    >
                        {DESIGNATIONS.map((d) => (
                            <option key={d.value} value={d.value}>
                                {d.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label className="form-label">
                        Donation / Card Fee Amount (₹) *
                    </label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold select-none">
                            ₹
                        </span>
                        <input
                            id="id-amount"
                            type="number"
                            min="1"
                            placeholder="e.g. 500"
                            value={form.amount}
                            onChange={(e) =>
                                handleFormChange("amount", e.target.value)
                            }
                            className={`form-input pl-10 ${errors.amount ? "border-red-400" : ""}`}
                        />
                    </div>
                    {errors.amount && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.amount}
                        </p>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <label className="form-label">Address *</label>
                <textarea
                    id="id-address"
                    rows={2}
                    placeholder="123, Main Street, City — State"
                    value={form.address}
                    onChange={(e) =>
                        handleFormChange("address", e.target.value)
                    }
                    className={`form-input resize-none ${errors.address ? "border-red-400" : ""}`}
                />
                {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                        {errors.address}
                    </p>
                )}
            </div>

            <button
                id="submit-id-btn"
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
                    "Submit ID Card Request"
                )}
            </button>
        </div>
    );
};

export const IDSuccessModal: React.FC = () => {
    const ctx = useContext(IDGenerateContext);
    if (!ctx) return null;
    const { isSuccess, submittedId, handleReset } = ctx;

    if (!isSuccess) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-card animate-scale-in">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Request Submitted!
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                    Your ID card application has been submitted successfully.
                    Admin will review your request and payment.
                </p>
                <div className="bg-slate-50 rounded-xl p-3 mb-6 text-xs text-slate-600 font-mono">
                    Request ID: {submittedId}
                </div>
                <button
                    onClick={handleReset}
                    className="btn-primary w-full py-2.5"
                >
                    Done
                </button>
            </div>
        </div>
    );
};
