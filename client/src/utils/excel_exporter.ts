import * as XLSX from 'xlsx';
import map from 'lodash/map';
import type { Donation } from '../types/donation';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));

/** Export donation records to an .xlsx file */
export const exportDonationsToExcel = (donations: Donation[], filename = 'donations'): void => {
  const rows = map(donations, (d) => ({
    'Donor Name':        d.donorName,
    'Phone':             d.phone,
    'Email':             d.email,
    'Amount':            formatCurrency(d.amount),
    'UTR Number':        d.utrNumber || '—',
    'Requested On':      formatDate(d.requestedAt),
    'Reviewed On':       d.reviewedAt ? formatDate(d.reviewedAt) : '—',
    'Reviewed By':       d.reviewedBy || '—',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths
  const colWidths = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length, 15),
  }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Donations');

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
