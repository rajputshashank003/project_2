import { createContext } from "react";
import type { ReturnTypeOfUseIDGenerate } from "./useIDGenerate";
export const IDGenerateContext =
    createContext<ReturnTypeOfUseIDGenerate | null>(null);
