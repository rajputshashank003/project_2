import { createContext } from 'react';
import type { ReturnTypeOfUseUserProfile } from './useUserProfile';

export const UserProfileContext = createContext<ReturnTypeOfUseUserProfile | null>(null);
