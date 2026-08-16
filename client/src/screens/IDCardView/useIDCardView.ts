import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getIdCardById } from "../../utils/api_request/id_cards";
import { getNgoConfig } from "../../utils/api_request/ngo";
import { useApp } from "../../context/AppContext";
import type { IdCard } from "../../types/id_card";
import type { IdCardData } from "../../components/IDCardCanvas";

export const useIDCardView = () => {
    const { id } = useParams<{ id: string }>();
    const { ngoConfig } = useApp();

    const [idCard, setIdCard] = useState<IdCard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [cardData, setCardData] = useState<IdCardData | null>(null);

    useEffect(() => {
        if (!id) return;
        loadCard(id);
    }, [id]);

    const loadCard = async (cardId: string) => {
        setIsLoading(true);
        setNotFound(false);
        try {
            const [data, freshConfig] = await Promise.all([
                getIdCardById(cardId),
                getNgoConfig().catch(() => ngoConfig),
            ]);
            setIdCard(data);
            const activeConfig = freshConfig || ngoConfig;
            setCardData({
                ngoName: activeConfig.name,
                ngoLogo: activeConfig.logoUrl,
                cardNumber: data.uniqueCardNumber,
                holderName: data.userName,
                phone: data.phone,
                email: data.email,
                designation: data.designation,
                passportPhotoUrl: data.passportPhotoUrl,
                issueDate: data.issueDate || data.requestedAt,
                expiryDate: data.expiryDate,
                address: data.address,
                presidentName: activeConfig.presidentName,
                signatureUrl: activeConfig.signatureUrl,
            });
        } catch {
            setNotFound(true);
        } finally {
            setIsLoading(false);
        }
    };

    return { idCard, cardData, isLoading, notFound };
};

export type ReturnTypeOfUseIDCardView = ReturnType<typeof useIDCardView>;
