import { STORAGE_KEYS } from "../utils/constants";
import type { AuthUser } from "../types/user";

export const storageService = {
    getToken: (): string | null =>
        localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),

    setToken: (token: string): void =>
        void localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token),

    removeToken: (): void =>
        void localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),

    getUser: (): AuthUser | null => {
        const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
        if (!raw) return null;
        try {
            return JSON.parse(raw) as AuthUser;
        } catch {
            return null;
        }
    },

    setUser: (user: AuthUser): void =>
        void localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user)),

    removeUser: (): void =>
        void localStorage.removeItem(STORAGE_KEYS.AUTH_USER),

    clearAuth: (): void => {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    },
};
