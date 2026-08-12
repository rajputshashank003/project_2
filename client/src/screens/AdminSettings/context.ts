import { createContext } from 'react';
import type { ReturnTypeOfUseAdminSettings } from './useAdminSettings';

export const AdminSettingsContext = createContext<ReturnTypeOfUseAdminSettings | null>(null);
