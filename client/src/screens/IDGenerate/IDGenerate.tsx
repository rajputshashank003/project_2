import React from "react";
import { useIDGenerate } from "./useIDGenerate";
import { IDGenerateContext } from "./context";
import {
    IDPaymentDetails,
    IDForm,
    IDCardNoteModal,
    IDSuccessModal,
} from "./components/IDGenerateComponents";
import { CreditCard } from "lucide-react";

const IDGenerateContent: React.FC = () => (
    <div className="page-wrapper max-w-2xl">
        <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <CreditCard className="h-3 w-3" />
                Volunteer ID Card
            </div>
            <h1 className="section-heading">Request Your ID Card</h1>
            <p className="section-subheading text-base mt-1">
                Fill in your details and upload your photo to get your official
                NGO volunteer ID card.
            </p>
        </div>
        <IDPaymentDetails />
        <IDForm />
        <IDCardNoteModal />
        <IDSuccessModal />
    </div>
);

const IDGenerate: React.FC = () => {
    const state = useIDGenerate();
    return (
        <IDGenerateContext.Provider value={state}>
            <IDGenerateContent />
        </IDGenerateContext.Provider>
    );
};

export default IDGenerate;
