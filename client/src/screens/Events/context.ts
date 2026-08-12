import { createContext } from 'react';
import type { ReturnTypeOfUseEvents } from './useEvents';
export const EventsContext = createContext<ReturnTypeOfUseEvents | null>(null);
