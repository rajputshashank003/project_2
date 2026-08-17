import * as XLSX from "xlsx";
import type { Donation } from "../types/donation";
import type { IdCard } from "../types/id_card";

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
    }).format(amount);

const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try {
        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(new Date(iso));
    } catch {
        return "—";
    }
};

/** Export approved donations and approved ID card contributions to an .xlsx file */
export const exportContributionsToExcel = (
    donations: Donation[] = [],
    idCards: IdCard[] = [],
    filename = "approved_contributions",
): void => {
    // Strictly filter for approved records only
    const approvedDonations = donations.filter((d) => d.status === "approved");
    const approvedIdCards = idCards.filter((c) => c.status === "approved");

    let totalAmount = 0;

    const rows: Array<Record<string, string | number>> = [];

    // 1. Add approved donations
    approvedDonations.forEach((d) => {
        totalAmount += d.amount || 0;
        rows.push({
            Type: "Donation",
            Name: d.donorName,
            Phone: d.phone,
            Email: d.email,
            "Amount (₹)": d.amount,
            "UTR / Ref No.": d.utrNumber || "—",
            "Certificate / Card No.": d.certificateNumber || "—",
            "Purpose / Designation": "General NGO Activities",
            "Approved On": formatDate(d.reviewedAt || d.requestedAt),
            "Approved By": d.reviewedBy || "Admin",
        });
    });

    // 2. Add approved ID cards
    approvedIdCards.forEach((c) => {
        const cardAmount = c.amount || 0;
        totalAmount += cardAmount;
        rows.push({
            Type: "ID Card",
            Name: c.userName,
            Phone: c.phone,
            Email: c.email,
            "Amount (₹)": cardAmount > 0 ? cardAmount : "—",
            "UTR / Ref No.": "—",
            "Certificate / Card No.": c.uniqueCardNumber || "—",
            "Purpose / Designation": c.designation || "Volunteer",
            "Approved On": formatDate(c.issueDate || c.reviewedAt || c.requestedAt),
            "Approved By": c.reviewedBy || "Admin",
        });
    });

    // 3. Add summary total row at the bottom
    if (rows.length > 0) {
        rows.push({
            Type: "TOTAL",
            Name: `Total Records: ${rows.length} (${approvedDonations.length} Donations, ${approvedIdCards.length} ID Cards)`,
            Phone: "",
            Email: "",
            "Amount (₹)": formatCurrency(totalAmount),
            "UTR / Ref No.": "",
            "Certificate / Card No.": "",
            "Purpose / Designation": "",
            "Approved On": "",
            "Approved By": "",
        });
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto-fit column widths
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
        wch: Math.max(key.length, 16),
    }));
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Approved Contributions");

    XLSX.writeFile(
        workbook,
        `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
};

/** Backwards-compatible alias */
export const exportDonationsToExcel = (
    donations: Donation[],
    filename = "approved_donations",
    idCards: IdCard[] = [],
): void => {
    exportContributionsToExcel(donations, idCards, filename);
};
