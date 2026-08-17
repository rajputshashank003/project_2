import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
    getDonations,
    updateDonationStatus,
} from "../../utils/api_request/donations";
import { getIdCardRequests } from "../../utils/api_request/id_cards";
import { exportContributionsToExcel } from "../../utils/excel_exporter";
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
    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportProgress, setExportProgress] = useState({
        current: 0,
        total: 0,
        message: "",
    });
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

    const openExportModal = () => setIsExportModalOpen(true);
    const closeExportModal = () => {
        if (!isExportingExcel) {
            setIsExportModalOpen(false);
            setExportProgress({ current: 0, total: 0, message: "" });
        }
    };

    const handleExportWithDateRange = async (
        startDate: string,
        endDate: string,
    ) => {
        setIsExportingExcel(true);
        setExportProgress({
            current: 0,
            total: 100,
            message: "Fetching approved donations…",
        });

        try {
            const BATCH_LIMIT = 100;
            const allDonations: Donation[] = [];
            const allIdCards: any[] = [];

            // 1. Fetch First Page of Donations
            const firstDonations = await getDonations(
                1,
                BATCH_LIMIT,
                "approved",
                undefined,
                startDate,
                endDate,
            );
            allDonations.push(...firstDonations.data);
            const totalDonationPages =
                firstDonations.pagination?.totalPages || 1;
            const totalDonations =
                firstDonations.pagination?.total || firstDonations.data.length;

            // Fetch Remaining Donation Pages
            for (let p = 2; p <= totalDonationPages; p++) {
                setExportProgress({
                    current: allDonations.length,
                    total: totalDonations + 10,
                    message: `Fetching donations: batch ${p} of ${totalDonationPages} (${allDonations.length}/${totalDonations})…`,
                });
                const res = await getDonations(
                    p,
                    BATCH_LIMIT,
                    "approved",
                    undefined,
                    startDate,
                    endDate,
                );
                allDonations.push(...res.data);
            }

            // 2. Fetch First Page of ID Cards
            setExportProgress({
                current: allDonations.length,
                total: allDonations.length + 50,
                message: "Fetching approved ID cards…",
            });
            const firstIdCards = await getIdCardRequests(
                1,
                BATCH_LIMIT,
                "approved",
                undefined,
                startDate,
                endDate,
            );
            allIdCards.push(...firstIdCards.data);
            const totalIdCardPages = firstIdCards.pagination?.totalPages || 1;
            const totalIdCards =
                firstIdCards.pagination?.total || firstIdCards.data.length;

            // Fetch Remaining ID Card Pages
            for (let p = 2; p <= totalIdCardPages; p++) {
                setExportProgress({
                    current: allDonations.length + allIdCards.length,
                    total: totalDonations + totalIdCards,
                    message: `Fetching ID cards: batch ${p} of ${totalIdCardPages} (${allIdCards.length}/${totalIdCards})…`,
                });
                const res = await getIdCardRequests(
                    p,
                    BATCH_LIMIT,
                    "approved",
                    undefined,
                    startDate,
                    endDate,
                );
                allIdCards.push(...res.data);
            }

            if (allDonations.length === 0 && allIdCards.length === 0) {
                toast.error(
                    "No approved records found in the selected date range",
                );
                return;
            }

            setExportProgress({
                current: allDonations.length + allIdCards.length,
                total: allDonations.length + allIdCards.length,
                message: "Compiling Excel file…",
            });

            const filename = `approved_contributions_${startDate}_to_${endDate}`;
            exportContributionsToExcel(allDonations, allIdCards, filename);
            toast.success(
                `Downloaded ${allDonations.length} donations & ${allIdCards.length} ID cards!`,
            );
            setIsExportModalOpen(false);
        } catch {
            toast.error("Export failed. Please try again.");
        } finally {
            setIsExportingExcel(false);
        }
    };

    const handleExportExcel = () => {
        openExportModal();
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
        isExportingExcel,
        isExportModalOpen,
        exportProgress,
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
        openExportModal,
        closeExportModal,
        handleExportWithDateRange,
        loadDonations,
    };
};

export type ReturnTypeOfUseAdminRequestDonation = ReturnType<
    typeof useAdminRequestDonation
>;
