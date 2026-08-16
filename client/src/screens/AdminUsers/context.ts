import { createContext } from "react";
import type { ReturnTypeOfUseAdminUsers } from "./useAdminUsers";
export const AdminUsersContext =
    createContext<ReturnTypeOfUseAdminUsers | null>(null);
