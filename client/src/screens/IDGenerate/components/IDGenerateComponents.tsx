import React, { useContext, useRef } from "react";
import { User, CheckCircle } from "lucide-react";
import { IDGenerateContext } from "../context";
import { DESIGNATIONS } from "../../../utils/constants";

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
