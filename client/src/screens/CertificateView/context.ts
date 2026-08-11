import { createContext } from 'react';
import type { ReturnTypeOfUseCertificateView } from './useCertificateView';
export const CertificateViewContext = createContext<ReturnTypeOfUseCertificateView | null>(null);
