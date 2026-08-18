import React, { useContext, useRef } from "react";
import { Check, X, Eye, PenTool, Image, CreditCard } from "lucide-react";
import { AdminRequestIdCardContext } from "../context";
import Modal from "../../../components/Modal";
import IDCardCanvas from "../../../components/IDCardCanvas";
import Pagination from "../../../components/Pagination";
import { formatDate, capitalize, formatCurrency } from "../../../utils/helpers";

export const IdCardRequestTable: React.FC = () => {
    const ctx = useContext(AdminRequestIdCardContext);
    if (!ctx) return null;
    const {
        filteredRequests,
        isLoading,
        filterStatus,
        setFilterStatus,
        openApprove,
        openReject,
        openPreview,
        page,
        totalPages,
        totalCount,
        loadRequests,
    } = ctx;

    const FILTERS: Array<{ label: string; value: string }> = [
        { label: "All", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
                {FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilterStatus(f.value as any)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                            filterStatus === f.value
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {filteredRequests.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    No requests found.
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Applicant</th>
                                <th>Phone</th>
                                <th>Designation</th>
                                <th>Amount</th>
                                <th>Requested On</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="font-semibold text-slate-900">
                                            {item.userName}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {item.email || "—"}
                                        </div>
                                    </td>
                                    <td className="font-mono text-xs">
                                        {item.phone}
                                    </td>
                                    <td>
                                        <span className="badge badge-approved">
                                            {capitalize(item.designation)}
                                        </span>
                                    </td>
                                    <td className="font-semibold text-slate-800 text-sm">
                                        {item.amount
                                            ? formatCurrency(item.amount)
                                            : "—"}
                                    </td>
                                    <td className="text-xs text-slate-500">
                                        {formatDate(item.requestedAt)}
                                    </td>
                                    <td>
                                        <span
                                            className={`badge badge-${item.status}`}
                                        >
                                            {capitalize(item.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    openPreview(item)
                                                }
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                title="Verify Payment & Preview ID Card"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>

                                            {item.status === "pending" && (
                                                <React.Fragment>
                                                    <button
                                                        onClick={() =>
                                                            openApprove(item)
                                                        }
                                                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                        title="Approve Request"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            openReject(item)
                                                        }
                                                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                                        title="Reject Request"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </React.Fragment>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={loadRequests}
                totalItems={totalCount}
                pageSize={20}
                className="mt-4"
            />
        </div>
    );
};

export const RequestActionModal: React.FC = () => {
    const ctx = useContext(AdminRequestIdCardContext);
    if (!ctx) return null;
    const {
        actionItem,
        actionType,
        rejectReason,
        validityYears,
        actionLoading,
        setRejectReason,
        setValidityYears,
        closeAction,
        handleApprove,
        handleReject,
    } = ctx;

    return (
        <Modal
            isOpen={!!actionItem}
            onClose={closeAction}
            title={
                actionType === "approve"
                    ? "Approve ID Card Request"
                    : "Reject ID Card Request"
            }
            size="sm"
            footer={
                <React.Fragment>
                    <button
                        onClick={closeAction}
                        className="btn-outline py-2"
                        disabled={actionLoading}
                    >
                        Cancel
                    </button>
                    {actionType === "approve" ? (
                        <button
                            id="confirm-approve-id"
                            onClick={handleApprove}
                            disabled={actionLoading}
                            className="btn-primary py-2"
                        >
                            {actionLoading ? "Processing…" : "Approve & Notify"}
                        </button>
                    ) : (
                        <button
                            id="confirm-reject-id"
                            onClick={handleReject}
                            disabled={actionLoading}
                            className="btn-danger py-2"
                        >
                            {actionLoading ? "Processing…" : "Reject & Notify"}
                        </button>
                    )}
                </React.Fragment>
            }
        >
            {actionItem && (
                <div>
                    <p className="text-slate-600 mb-4">
                        {actionType === "approve"
                            ? `Approve ID card request for ${actionItem.userName}? A unique card number will be generated and notifications will be sent to both the applicant and admin.`
                            : `Reject request for ${actionItem.userName}? Please provide a reason. Notifications will be sent to both parties.`}
                    </p>
                    {actionType === "reject" && (
                        <div>
                            <label className="form-label">
                                Rejection Reason *
                            </label>
                            <textarea
                                id="reject-reason-input"
                                rows={3}
                                placeholder="e.g. Payment screenshot unclear, please resubmit"
                                value={rejectReason}
                                onChange={(e) =>
                                    setRejectReason(e.target.value)
                                }
                                className="form-input resize-none"
                            />
                        </div>
                    )}
                    {actionType === "approve" && (
                        <React.Fragment>
                            <div className="mb-4">
                                <label className="form-label">
                                    Card Validity *
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: "1 Year", value: 1 },
                                        { label: "2 Years", value: 2 },
                                        { label: "3 Years", value: 3 },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() =>
                                                setValidityYears(opt.value)
                                            }
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                                validityYears === opt.value
                                                    ? "bg-emerald-600 text-white border-emerald-600"
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-800">
                                ✅ SMS + Email will be sent to{" "}
                                <strong>{actionItem.userName}</strong> and admin
                                upon approval.
                            </div>
                        </React.Fragment>
                    )}
                </div>
            )}
        </Modal>
    );
};

export const IDCardPreviewModal: React.FC = () => {
    const ctx = useContext(AdminRequestIdCardContext);
    if (!ctx) return null;
    const {
        previewItem,
        setPreviewItem,
        previewTab,
        setPreviewTab,
        ngoConfig,
    } = ctx;

    if (!previewItem) return null;

    const cardData = {
        ngoName: ngoConfig.name,
        ngoLogo: ngoConfig.logoUrl,
        cardNumber: previewItem.uniqueCardNumber,
        holderName: previewItem.userName,
        phone: previewItem.phone,
        email: previewItem.email,
        designation: previewItem.designation,
        passportPhotoUrl: previewItem.passportPhotoUrl,
        issueDate: previewItem.issueDate || previewItem.requestedAt,
        expiryDate: previewItem.expiryDate,
        address: previewItem.address,
        presidentName: ngoConfig.presidentName,
        signatureUrl: ngoConfig.signatureUrl,
    };

    return (
        <Modal
            isOpen={!!previewItem}
            onClose={() => {
                setPreviewItem(null);
                setPreviewTab("screenshot");
            }}
            title="ID Card Request & Payment Verification"
            size="xl"
        >
            <div className="space-y-4">
                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-200 gap-1 sm:gap-2">
                    <button
                        onClick={() => setPreviewTab("screenshot")}
                        className={`px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap flex-1 sm:flex-initial ${
                            previewTab === "screenshot"
                                ? "border-emerald-600 text-emerald-700"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        <Image className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        <span>Payment Screenshot</span>
                    </button>
                    <button
                        onClick={() => setPreviewTab("card")}
                        className={`px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap flex-1 sm:flex-initial ${
                            previewTab === "card"
                                ? "border-emerald-600 text-emerald-700"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        <span>ID Card Preview</span>
                    </button>
                </div>

                {/* Tab Content */}
                {previewTab === "screenshot" ? (
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-slate-700">
                            <div>
                                <span className="text-slate-500">Applicant:</span>{" "}
                                <strong className="text-slate-900 font-semibold">{previewItem.userName}</strong>
                            </div>
                            <div>
                                <span className="text-slate-500">Designation:</span>{" "}
                                <strong className="text-slate-900 font-semibold">{capitalize(previewItem.designation)}</strong>
                            </div>
                            <div>
                                <span className="text-slate-500">Declared Amount:</span>{" "}
                                <strong className="text-emerald-700 font-bold text-sm">
                                    {previewItem.amount ? formatCurrency(previewItem.amount) : "—"}
                                </strong>
                            </div>
                        </div>

                        <div className="flex justify-center p-4 bg-slate-50 rounded-xl">
                            {previewItem.paymentScreenshotUrl ? (
                                <img
                                    src={previewItem.paymentScreenshotUrl}
                                    alt="Payment Proof"
                                    className="max-h-96 rounded-xl object-contain shadow-sm border border-slate-200"
                                />
                            ) : (
                                <div className="text-center py-12 text-slate-400">
                                    No payment screenshot uploaded (demo data)
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center overflow-x-auto py-2">
                        <IDCardCanvas
                            data={cardData}
                            showDownloadButtons={
                                previewItem.status === "approved"
                            }
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
};

export const SignatureModal: React.FC = () => {
    const ctx = useContext(AdminRequestIdCardContext);
    const sigRef = useRef<HTMLInputElement>(null);
    if (!ctx) return null;
    const {
        signatureModalOpen,
        setSignatureModalOpen,
        signatureUploading,
        handleSignatureUpload,
        handleDeleteSignature,
        ngoConfig,
    } = ctx;

    return (
        <Modal
            isOpen={signatureModalOpen}
            onClose={() => setSignatureModalOpen(false)}
            title="Admin Digital Signature"
            size="md"
        >
            <div className="space-y-4">
                <p className="text-sm text-slate-600">
                    Upload your digital signature (PNG/JPG). This signature will
                    be placed on the back of all approved ID cards.
                </p>

                <input
                    ref={sigRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleSignatureUpload(f);
                    }}
                />

                {ngoConfig.signatureUrl ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col items-center gap-3">
                        <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                            Current Signature
                        </span>
                        <div className="bg-white p-3 rounded-lg border border-amber-200 w-full max-w-xs flex justify-center relative min-h-[4rem] items-center">
                            {signatureUploading ? (
                                <div className="flex flex-col items-center gap-1.5 py-1">
                                    <span className="h-6 w-6 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin" />
                                    <span className="text-xs font-medium text-slate-600">Uploading new signature…</span>
                                </div>
                            ) : (
                                <img
                                    src={ngoConfig.signatureUrl}
                                    alt="Digital Signature"
                                    className="h-14 object-contain"
                                />
                            )}
                        </div>
                        <div className="flex gap-2 w-full max-w-xs">
                            <button
                                type="button"
                                onClick={() => sigRef.current?.click()}
                                disabled={signatureUploading}
                                className="btn-outline flex-1 py-2 text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                {signatureUploading ? (
                                    <React.Fragment>
                                        <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-400 border-t-emerald-600 animate-spin" />
                                        Uploading…
                                    </React.Fragment>
                                ) : (
                                    "Change Signature"
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteSignature}
                                disabled={signatureUploading}
                                className="btn-danger py-2 text-xs disabled:opacity-50"
                            >
                                Delete Signature
                            </button>
                        </div>
                    </div>
                ) : signatureUploading ? (
                    <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
                        <span className="h-8 w-8 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin" />
                        <span className="text-sm font-semibold text-emerald-800">
                            Uploading digital signature…
                        </span>
                        <span className="text-xs text-slate-400">
                            Please wait while the image is being saved
                        </span>
                    </div>
                ) : (
                    <div
                        onClick={() => sigRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                        <PenTool className="h-10 w-10 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700">
                            Click to upload digital signature
                        </span>
                        <span className="text-xs text-slate-400">
                            PNG or JPG, max 5MB
                        </span>
                    </div>
                )}
            </div>
        </Modal>
    );
};
