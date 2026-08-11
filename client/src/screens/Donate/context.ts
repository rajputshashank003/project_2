import { createContext } from 'react';
import type { ReturnTypeOfUseDonate } from './useDonate';

export const DonateContext = createContext<ReturnTypeOfUseDonate | null>(null);
