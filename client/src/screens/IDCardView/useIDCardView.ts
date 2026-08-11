import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getIdCardById } from '../../utils/api_request/id_cards';
import { useApp } from '../../context/AppContext';
import type { IdCard } from '../../types/id_card';
import type { IdCardData } from '../../components/IDCardCanvas';

const MOCK_ID_CARD: IdCard = {
  id: 'IDR-DEMO',
  userId: 'user-001',
  userName: 'Ramesh Kumar',
  phone: '9876543210',
  email: 'ramesh@email.com',
  address: '123, Main Street, Mumbai — Maharashtra',
  designation: 'member',
  passportPhotoUrl: '',
  paymentScreenshotUrl: '',
  uniqueCardNumber: 'NGO-2024-DEMO01',
  status: 'approved',
  issueDate: new Date().toISOString(),
  requestedAt: new Date().toISOString(),
};

export const useIDCardView = () => {
  const { id }        = useParams<{ id: string }>();
  const { ngoConfig } = useApp();

  const [idCard, setIdCard]         = useState<IdCard | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [cardData, setCardData]     = useState<IdCardData | null>(null);

  useEffect(() => {
    if (!id) return;
    loadCard(id);
  }, [id]);

  const loadCard = async (cardId: string) => {
    setIsLoading(true);
    try {
      let data: IdCard;
      try {
        data = await getIdCardById(cardId);
      } catch {
        data = { ...MOCK_ID_CARD, id: cardId };
      }
      setIdCard(data);
      setCardData({
        ngoName:        ngoConfig.name,
        ngoLogo:        ngoConfig.logoUrl,
        cardNumber:     data.uniqueCardNumber,
        holderName:     data.userName,
        phone:          data.phone,
        email:          data.email,
        designation:    data.designation,
        passportPhotoUrl: data.passportPhotoUrl,
        issueDate:      data.issueDate || data.requestedAt,
        address:        data.address,
        presidentName:  ngoConfig.presidentName,
        signatureUrl:   ngoConfig.signatureUrl,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { idCard, cardData, isLoading };
};

export type ReturnTypeOfUseIDCardView = ReturnType<typeof useIDCardView>;
