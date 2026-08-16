import React from "react";
import Modal from "../Modal";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "primary";
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    isLoading = false,
    onConfirm,
    onCancel,
}) => {
    const confirmClass = variant === "danger" ? "btn-danger" : "btn-primary";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title={title}
            size="sm"
            footer={
                <>
                    <button
                        id="confirm-modal-cancel"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="btn-outline px-5 py-2"
                    >
                        {cancelText}
                    </button>
                    <button
                        id="confirm-modal-confirm"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`${confirmClass} px-5 py-2`}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                {confirmText}…
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </>
            }
        >
            <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
        </Modal>
    );
};

export default ConfirmModal;
