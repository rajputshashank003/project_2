import React, { useEffect, useRef } from "react";

interface MenuDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    trigger: React.ReactNode;
    children: React.ReactNode;
    align?: "left" | "right";
    className?: string;
}

export const MenuDropdown: React.FC<MenuDropdownProps> = ({
    isOpen,
    onClose,
    trigger,
    children,
    align = "right",
    className = "",
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    // Close on Escape key press
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    return (
        <div className="relative inline-block" ref={containerRef}>
            {/* Trigger element */}
            {trigger}

            {/* Floating dropdown content */}
            {isOpen && (
                <div
                    className={`absolute top-full mt-2 ${
                        align === "right" ? "right-0" : "left-0"
                    } z-50 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 animate-fade-in ${className}`}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default MenuDropdown;
