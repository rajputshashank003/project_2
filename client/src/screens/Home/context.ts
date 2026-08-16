import { createContext } from "react";
import type { ReturnTypeOfUseHome } from "./useHome";

export const HomeContext = createContext<ReturnTypeOfUseHome | null>(null);
