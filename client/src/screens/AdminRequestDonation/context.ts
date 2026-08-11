import { createContext } from 'react';
import type { ReturnTypeOfUseAdminRequestDonation } from './useAdminRequestDonation';
export const AdminRequestDonationContext = createContext<ReturnTypeOfUseAdminRequestDonation | null>(null);
