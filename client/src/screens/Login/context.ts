import { createContext } from 'react';
import type { ReturnTypeOfUseLogin } from './useLogin';

export const LoginContext = createContext<ReturnTypeOfUseLogin | null>(null);
