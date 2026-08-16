import { createContext } from "react";
import type { ReturnTypeOfUseAbout } from "./useAbout";
export const AboutContext = createContext<ReturnTypeOfUseAbout | null>(null);
