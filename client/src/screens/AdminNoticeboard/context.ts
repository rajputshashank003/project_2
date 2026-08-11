import { createContext } from 'react';
import type { ReturnTypeOfUseAdminNoticeboard } from './useAdminNoticeboard';
export const AdminNoticeboardContext = createContext<ReturnTypeOfUseAdminNoticeboard | null>(null);
