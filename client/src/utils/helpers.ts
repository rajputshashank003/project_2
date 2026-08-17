import { MAX_FILE_SIZE_MB, ACCEPTED_IMAGE_TYPES } from "./constants";

/** Format number as INR currency */
export const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
    }).format(amount);

/** Format ISO date string to human-readable */
export const formatDate = (iso: string): string =>
    new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date(iso));

/** Format ISO date short */
export const formatDateShort = (iso: string): string =>
    new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(iso));

/** Convert a File to Base64 string */
export const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

/** Generate a random 8-character alphanumeric ID */
export const generateUniqueId = (): string =>
    Math.random().toString(36).substring(2, 10).toUpperCase();

/** Generate a unique NGO card number like NGO-2024-XXXXXX */
export const generateCardNumber = (): string => {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `NGO-${year}-${random}`;
};

/** Validate Indian mobile number (10 digits) */
export const isValidPhone = (phone: string): boolean =>
    /^[6-9]\d{9}$/.test(phone.replace(/\s+/g, ""));

/** Validate email */
export const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** Validate uploaded image file */
export const validateImageFile = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return "Please upload a JPG, PNG, or WebP image.";
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return `File size must be under ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
};

/** Truncate text with ellipsis */
export const truncate = (text: string, maxLength: number): string =>
    text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;

/** Get initials from full name */
export const getInitials = (name: string): string =>
    name
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("");

/** Capitalize first letter */
export const capitalize = (str: string): string =>
    str.charAt(0).toUpperCase() + str.slice(1);

/** Check if login is allowed for a given phone number based on VITE_STOP_LOGIN / VITE_ALLOWED_LOGIN_PHONES */
export const isLoginAllowedForPhone = (phone: string): boolean => {
    const stopLoginEnv = (
        import.meta.env.VITE_STOP_LOGIN ||
        import.meta.env.VITE_ALLOWED_LOGIN_PHONES ||
        ""
    ).trim();
    if (!stopLoginEnv || stopLoginEnv.toLowerCase() === "false") {
        return true; // No restriction active
    }

    const allowedList = String(stopLoginEnv)
        .split(",")
        .map((p: string) => p.replace(/\D/g, ""))
        .filter(Boolean);

    if (allowedList.length === 0) {
        return true;
    }

    const cleanedInput = phone.replace(/\D/g, "");
    return allowedList.some((allowed: string) => {
        if (allowed === cleanedInput) return true;
        if (
            cleanedInput.length >= 10 &&
            allowed.endsWith(cleanedInput.slice(-10))
        )
            return true;
        if (allowed.length >= 10 && cleanedInput.endsWith(allowed.slice(-10)))
            return true;
        return false;
    });
};

/** Copy text to clipboard with fallback for non-secure/unsupported browser contexts */
export const copyToClipboard = async (text: string): Promise<boolean> => {
    if (!text) return false;
    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // Fallback to execCommand below
    }

    try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";
        textarea.setAttribute("readonly", "");
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textarea);
        return successful;
    } catch {
        return false;
    }
};
