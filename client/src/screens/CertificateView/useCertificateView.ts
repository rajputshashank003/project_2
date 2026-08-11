import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDonationById } from '../../utils/api_request/donations';
import { useApp } from '../../context/AppContext';
import { generateUniqueId } from '../../utils/helpers';
import type { Donation } from '../../types/donation';
import type { CertificateData } from '../../components/CertificateCanvas';

// Mock data for demo
const MOCK_DONATION: Donation = {
  id: 'DON-DEMO',
  donorName: 'Ramesh Kumar',
  phone: '9876543210',
  email: 'ramesh@email.com',
  amount: 5000,
  paymentScreenshotUrl: '',
  status: 'approved',
  requestedAt: new Date().toISOString(),
  reviewedAt: new Date().toISOString(),
};

export const useCertificateView = () => {
  const { id }        = useParams<{ id: string }>();
  const { ngoConfig } = useApp();

  const [donation, setDonation]         = useState<Donation | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [certificateData, setCertData]  = useState<CertificateData | null>(null);

  useEffect(() => {
    if (!id) return;
    loadDonation(id);
  }, [id]);

  const loadDonation = async (donationId: string) => {
    setIsLoading(true);
    try {
      let data: Donation;
      try {
        data = await getDonationById(donationId);
      } catch {
        data = { ...MOCK_DONATION, id: donationId };
      }
      setDonation(data);
      setCertData({
        ngoName:            ngoConfig.name,
        ngoLogo:            ngoConfig.logoUrl,
        ngoAddress:         ngoConfig.address,
        ngoEmail:           ngoConfig.email,
        registrationNumber: ngoConfig.registrationNumber,
        presidentName:      ngoConfig.presidentName,
        secretaryName:      ngoConfig.secretaryName,
        signatureUrl:       ngoConfig.signatureUrl,
        donorName:          data.donorName,
        amount:             data.amount,
        donationDate:       data.requestedAt,
        certificateNumber:  'CERT-' + generateUniqueId(),
        purpose:            'General NGO Activities',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { donation, certificateData, isLoading, ngoConfig };
};

export type ReturnTypeOfUseCertificateView = ReturnType<typeof useCertificateView>;
