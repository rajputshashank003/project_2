import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
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
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalCollected: 0,
    });
    const [actionItem, setActionItem] = useState<Donation | null>(null);
    const [actionType, setActionType] = useState<"approve" | "reject" | null>(
        null,
    );
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [screenshotModal, setScreenshotModal] = useState<Donation | null>(
        null,
    );

    const loadDonations = useCallback(
        async (
            targetPage = 1,
            status = filterStatus,
            search = searchQuery,
        ) => {
            setIsLoading(true);
            try {
                const result = await getDonations(targetPage, 20, status, search);
                setDonations(result.data);
                setPage(result.pagination?.page || targetPage);
                setTotalPages(result.pagination?.totalPages || 1);
                setTotalCount(result.pagination?.total || result.data.length);
                if (result.stats) {
                    setStats(result.stats);
                }
            } catch {
                // error toast already shown by axiosInstance interceptor
            } finally {
                setIsLoading(false);
            }
        },
        [filterStatus, searchQuery],
    );

    // Debounced search & filter effect
    useEffect(() => {
        const timer = setTimeout(() => {
            void loadDonations(1, filterStatus, searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [filterStatus, searchQuery, loadDonations]);

    const filteredDonations = donations;

    const totalAmount = stats.totalCollected;

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
        page,
        totalPages,
        totalCount,
        stats,
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
