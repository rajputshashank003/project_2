import React from 'react';
import { useIDCardView } from './useIDCardView';
import { IDCardViewContext } from './context';
import IDCardCanvas from '../../components/IDCardCanvas';
import { CreditCard } from 'lucide-react';

const IDCardViewContent: React.FC = () => {
  const ctx = React.useContext(IDCardViewContext);
  if (!ctx) return null;
  const { isLoading, cardData } = ctx;

  if (isLoading) {
    return (
      <div className="page-wrapper flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!cardData) {
    return (
      <div className="page-wrapper text-center py-20">
        <p className="text-slate-500">ID Card not found.</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <h1 className="section-heading">Your NGO ID Card</h1>
          <p className="section-subheading">Download your official volunteer ID card</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 overflow-x-auto">
        <IDCardCanvas data={cardData} showDownloadButtons />
      </div>
    </div>
  );
};

const IDCardView: React.FC = () => {
  const state = useIDCardView();
  return (
    <IDCardViewContext.Provider value={state}>
      <IDCardViewContent />
    </IDCardViewContext.Provider>
  );
};

export default IDCardView;
