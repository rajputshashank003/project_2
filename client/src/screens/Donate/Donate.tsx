import React from 'react';
import { useDonate } from './useDonate';
import { DonateContext } from './context';
import { UpiDetails, DonationForm, SuccessModal } from './components/DonateComponents';
import { Heart } from 'lucide-react';

const DonateContent: React.FC = () => (
  <div className="page-wrapper max-w-2xl">
    <div className="mb-8">
      <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
        <Heart className="h-3 w-3" />
        Make a Donation
      </div>
      <h1 className="section-heading">Support Our Cause</h1>
      <p className="section-subheading text-base mt-1">
        Your contribution helps us serve thousands of lives. Every rupee makes a difference.
      </p>
    </div>
    <UpiDetails />
    <DonationForm />
    <SuccessModal />
  </div>
);

const Donate: React.FC = () => {
  const donateState = useDonate();

  return (
    <DonateContext.Provider value={donateState}>
      <DonateContent />
    </DonateContext.Provider>
  );
};

export default Donate;
