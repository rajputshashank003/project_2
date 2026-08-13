import { createContext } from 'react';
import type { ReturnTypeOfUseAdminTeam } from './useAdminTeam';
export const AdminTeamContext = createContext<ReturnTypeOfUseAdminTeam | null>(null);
