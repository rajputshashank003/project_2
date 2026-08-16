import { createContext } from "react";
import type { ReturnTypeOfUseAdminRequestIdCard } from "./useAdminRequestIdCard";
export const AdminRequestIdCardContext =
    createContext<ReturnTypeOfUseAdminRequestIdCard | null>(null);
