import { useState, useEffect, useCallback } from 'react';
import { getMyDonations, getMyIdCards } from '../../utils/api_request/my';
import type { Donation } from '../../types/donation';
import type { IdCard } from '../../types/id_card';

type ProfileTab = 'donations' | 'idcards';

export const useUserProfile = () => {
    const [activeTab, setActiveTab]       = useState<ProfileTab>('donations');

    // Donations state
    const [donations, setDonations]             = useState<Donation[]>([]);
    const [donationLoading, setDonationLoading] = useState(true);
    const [donationPage, setDonationPage]       = useState(1);
    const [donationTotal, setDonationTotal]     = useState(0);
    const [donationTotalPages, setDonationTotalPages] = useState(0);

    // ID Cards state
    const [idCards, setIdCards]                = useState<IdCard[]>([]);
    const [idCardLoading, setIdCardLoading]    = useState(true);
    const [idCardPage, setIdCardPage]          = useState(1);
    const [idCardTotal, setIdCardTotal]        = useState(0);
    const [idCardTotalPages, setIdCardTotalPages] = useState(0);

    const loadDonations = useCallback(async (page: number) => {
        setDonationLoading(true);
        try {
            const res = await getMyDonations(page);
            setDonations(res.data);
            setDonationTotal(res.pagination.total);
            setDonationTotalPages(res.pagination.totalPages);
            setDonationPage(page);
        } catch {
            // error toast handled by axiosInstance interceptor
        } finally {
            setDonationLoading(false);
        }
    }, []);

    const loadIdCards = useCallback(async (page: number) => {
        setIdCardLoading(true);
        try {
            const res = await getMyIdCards(page);
            setIdCards(res.data);
            setIdCardTotal(res.pagination.total);
            setIdCardTotalPages(res.pagination.totalPages);
            setIdCardPage(page);
        } catch {
            // error toast handled by axiosInstance interceptor
        } finally {
            setIdCardLoading(false);
        }
    }, []);

    // Load both on mount
    useEffect(() => {
        loadDonations(1);
        loadIdCards(1);
    }, [loadDonations, loadIdCards]);

    return {
        activeTab,
        setActiveTab,
        // donations
        donations,
        donationLoading,
        donationPage,
        donationTotal,
        donationTotalPages,
        loadDonations,
        // id cards
        idCards,
        idCardLoading,
        idCardPage,
        idCardTotal,
        idCardTotalPages,
        loadIdCards,
    };
};

export type ReturnTypeOfUseUserProfile = ReturnType<typeof useUserProfile>;
