import React, { useState } from "react";
import { FileSpreadsheet, Calendar, AlertCircle } from "lucide-react";
import Modal from "../../../components/Modal";

export interface ExportProgress {
    current: number;
    total: number;
    message: string;
}

interface ExportExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (startDate: string, endDate: string) => Promise<void>;
    isExporting: boolean;
    progress: ExportProgress;
}

const getTodayString = () => new Date().toISOString().slice(0, 10);

const getThirtyDaysAgoString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
};

const getFirstDayOfMonthString = () => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
};

const getFirstDayOfYearString = () => {
    const d = new Date();
    d.setMonth(0, 1);
    return d.toISOString().slice(0, 10);
};

export const ExportExcelModal: React.FC<ExportExcelModalProps> = ({
    isOpen,
    onClose,
    onExport,
    isExporting,
    progress,
}) => {
    const today = getTodayString();
    const [startDate, setStartDate] = useState(getThirtyDaysAgoString());
    const [endDate, setEndDate] = useState(today);
    const [error, setError] = useState("");

    const handleStartDateChange = (val: string) => {
        setStartDate(val);
        setError("");
        if (endDate && val > endDate) {
            setEndDate(val);
        }
    };

    const handleEndDateChange = (val: string) => {
        setEndDate(val);
        setError("");
        if (startDate && val < startDate) {
            setStartDate(val);
        }
    };

    const applyPreset = (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            setError("Please select both a start and end date");
            return;
        }
        if (startDate > endDate) {
            setError("Start date cannot be after end date");
            return;
        }
        await onExport(startDate, endDate);
    };

    const progressPercentage =
        progress.total > 0
            ? Math.min(100, Math.round((progress.current / progress.total) * 100))
            : isExporting
              ? 50
              : 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                if (!isExporting) onClose();
            }}
            title="Export Approved Contributions"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-xs text-slate-500 -mt-2">
                    Select a date range to download all approved donations and ID cards in a single Excel sheet.
                </p>

                {/* Preset Filters */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Quick Date Presets
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {[
                            {
                                label: "Last 30 Days",
                                action: () => applyPreset(getThirtyDaysAgoString(), today),
                            },
                            {
                                label: "This Month",
                                action: () => applyPreset(getFirstDayOfMonthString(), today),
                            },
                            {
                                label: "This Year",
                                action: () => applyPreset(getFirstDayOfYearString(), today),
                            },
                            {
                                label: "All Time",
                                action: () => applyPreset("2020-01-01", today),
                            },
                        ].map((preset) => (
                            <button
                                key={preset.label}
                                type="button"
                                disabled={isExporting}
                                onClick={preset.action}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors disabled:opacity-50"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                            Start Date *
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            max={endDate || today}
                            disabled={isExporting}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                            End Date *
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate}
                            max={today}
                            disabled={isExporting}
                            onChange={(e) => handleEndDateChange(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                            required
                        />
                    </div>
                </div>

                {/* Validation Error */}
                {error && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Live Progress Bar during Batched Download */}
                {isExporting && (
                    <div className="space-y-2 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                        <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
                            <span>{progress.message || "Preparing export…"}</span>
                            <span>{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-emerald-600 h-2 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isExporting}
                        className="btn-outline py-2 px-4 text-sm disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isExporting}
                        className="btn-primary py-2 px-5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <React.Fragment>
                                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                Exporting…
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <FileSpreadsheet className="h-4 w-4" />
                                Download Excel
                            </React.Fragment>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
