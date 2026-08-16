import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import filter from "lodash/filter";
import {
    getDonations,
    updateDonationStatus,
} from "../../utils/api_request/donations";
import { exportDonationsToExcel } from "../../utils/excel_exporter";
import { useApp } from "../../context/AppContext";
import type { Donation, DonationStatus } from "../../types/donation";

type FilterStatus = "all" | DonationStatus;

export const useAdminRequestDonation = () => {
    const { ngoConfig } = useApp();

    const [donations, setDonations] = useState<Donation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [actionItem, setActionItem] = useState<Donation | null>(null);
    const [actionType, setActionType] = useState<"approve" | "reject" | null>(
        null,
    );
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [screenshotModal, setScreenshotModal] = useState<Donation | null>(
        null,
    );

    useEffect(() => {
        loadDonations();
    }, []);

    const loadDonations = async () => {
        setIsLoading(true);
        try {
            const result = await getDonations();
            setDonations(result.data);
        } catch {
            // error toast already shown by axiosInstance interceptor
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDonations = (() => {
        let list =
            filterStatus === "all"
                ? donations
                : filter(donations, (d) => d.status === filterStatus);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = filter(
                list,
                (d) =>
                    d.donorName.toLowerCase().includes(q) ||
                    d.phone.includes(q) ||
                    d.email.toLowerCase().includes(q),
            );
        }
        return list;
    })();

    const totalAmount = donations
        .filter((d) => d.status === "approved")
        .reduce((sum, d) => sum + d.amount, 0);

    const openApprove = (item: Donation) => {
        setActionItem(item);
        setActionType("approve");
        setRejectReason("");
    };
    const openReject = (item: Donation) => {
        setActionItem(item);
        setActionType("reject");
        setRejectReason("");
    };
    const closeAction = () => {
        setActionItem(null);
        setActionType(null);
        setRejectReason("");
    };

    const handleApprove = useCallback(async () => {
        if (!actionItem) return;
        setActionLoading(true);
        try {
            const updated = await updateDonationStatus(actionItem.id, {
                status: "approved",
            });

            setDonations((prev) =>
                prev.map((d) => (d.id === actionItem.id ? updated : d)),
            );
            toast.success(`Donation approved for ${actionItem.donorName}`);
            closeAction();
        } catch {
            toast.error("Action failed. Please try again.");
        } finally {
            setActionLoading(false);
        }
    }, [actionItem]);

    const handleReject = useCallback(async () => {
        if (!actionItem) return;
        if (!rejectReason.trim()) {
            toast.error("Please enter a rejection reason");
            return;
        }
        setActionLoading(true);
        try {
            const updated = await updateDonationStatus(actionItem.id, {
                status: "rejected",
                rejectionReason: rejectReason,
            });

            setDonations((prev) =>
                prev.map((d) => (d.id === actionItem.id ? updated : d)),
            );
            toast.success(`Donation rejected for ${actionItem.donorName}`);
            closeAction();
        } catch {
            toast.error("Action failed. Please try again.");
        } finally {
            setActionLoading(false);
        }
    }, [actionItem, rejectReason]);

    const handleExportExcel = () => {
        exportDonationsToExcel(filteredDonations, "ngo_donations");
        toast.success("Excel file downloaded!");
    };

    return {
        donations,
        filteredDonations,
        isLoading,
        filterStatus,
        searchQuery,
        actionItem,
        actionType,
        rejectReason,
        actionLoading,
        screenshotModal,
        totalAmount,
        ngoConfig,
        setFilterStatus,
        setSearchQuery,
        setRejectReason,
        setScreenshotModal,
        openApprove,
        openReject,
        closeAction,
        handleApprove,
        handleReject,
        handleExportExcel,
        loadDonations,
    };
};

export type ReturnTypeOfUseAdminRequestDonation = ReturnType<
    typeof useAdminRequestDonation
>;
