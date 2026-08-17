import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    pageSize?: number;
    className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    pageSize = 20,
    className = "",
}) => {
    if (totalPages <= 1 && (!totalItems || totalItems <= pageSize)) {
        return null;
    }

    // Generate page numbers to display with smart ellipsis
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const delta = 2; // Number of pages before and after current page

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                pages.push(i);
            } else if (
                (i === currentPage - delta - 1 && i > 1) ||
                (i === currentPage + delta + 1 && i < totalPages)
            ) {
                pages.push("...");
            }
        }

        // Deduplicate consecutive ellipses if any
        return pages.filter((item, index) => {
            return item !== "..." || pages[index - 1] !== "...";
        });
    };

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem =
        totalItems !== undefined
            ? Math.min(currentPage * pageSize, totalItems)
            : currentPage * pageSize;

    return (
        <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 ${className}`}
        >
            {/* Items count indicator */}
            <div className="text-xs sm:text-sm text-slate-500 font-medium order-2 sm:order-1 text-center sm:text-left">
                {totalItems !== undefined && totalItems > 0 ? (
                    <span>
                        Showing <strong className="text-slate-800">{startItem}</strong> to{" "}
                        <strong className="text-slate-800">{endItem}</strong> of{" "}
                        <strong className="text-slate-800">{totalItems}</strong> items
                    </span>
                ) : (
                    <span>
                        Page <strong className="text-slate-800">{currentPage}</strong> of{" "}
                        <strong className="text-slate-800">{totalPages}</strong>
                    </span>
                )}
            </div>

            {/* Page number buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
                {/* Previous Button */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold flex items-center gap-1"
                    title="Previous Page"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Numbered Page Buttons */}
                {getPageNumbers().map((page, index) => {
                    if (page === "...") {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-2 py-1 text-xs text-slate-400 font-bold select-none"
                            >
                                …
                            </span>
                        );
                    }

                    const pageNum = page as number;
                    const isActive = pageNum === currentPage;

                    return (
                        <button
                            key={pageNum}
                            type="button"
                            onClick={() => onPageChange(pageNum)}
                            className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                                isActive
                                    ? "bg-emerald-600 text-white shadow-sm border border-emerald-600"
                                    : "bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                            }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}

                {/* Next Button */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold flex items-center gap-1"
                    title="Next Page"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
