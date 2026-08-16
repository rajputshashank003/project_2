import React from "react";
import { useCertificateView } from "./useCertificateView";
import { CertificateViewContext } from "./context";
import CertificateCanvas from "../../components/CertificateCanvas";
import { Award } from "lucide-react";

const CertificateViewContent: React.FC = () => {
    const ctx = React.useContext(CertificateViewContext);
    if (!ctx) return null;
    const { isLoading, certificateData } = ctx;

    if (isLoading) {
        return (
            <div className="page-wrapper flex items-center justify-center min-h-[60vh]">
                <div className="h-10 w-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
            </div>
        );
    }

    if (!certificateData) {
        return (
            <div className="page-wrapper text-center py-20">
                <p className="text-slate-500">Certificate not found.</p>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <div className="mb-8 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Award className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                    <h1 className="section-heading">Donation Certificate</h1>
                    <p className="section-subheading">
                        Download your official certificate of appreciation
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-6 flex justify-center">
                <CertificateCanvas data={certificateData} showDownloadButtons />
            </div>
        </div>
    );
};

const CertificateView: React.FC = () => {
    const state = useCertificateView();
    return (
        <CertificateViewContext.Provider value={state}>
            <CertificateViewContent />
        </CertificateViewContext.Provider>
    );
};

export default CertificateView;
