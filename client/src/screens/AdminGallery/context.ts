import { createContext } from "react";
import type { ReturnTypeOfUseAdminGallery } from "./useAdminGallery";
export const AdminGalleryContext =
    createContext<ReturnTypeOfUseAdminGallery | null>(null);
