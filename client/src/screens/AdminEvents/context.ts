import { createContext } from 'react';
import type { ReturnTypeOfUseAdminEvents } from './useAdminEvents';
export const AdminEventsContext = createContext<ReturnTypeOfUseAdminEvents | null>(null);
