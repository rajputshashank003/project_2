/**
 * ngo.ts — API module for NGO configuration.
 * Uses env-based mock config when no backend is available (VITE_API_BASE_URL not set).
 */
import { request } from './utils';
import type { NgoConfig } from '../../types/ngo';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

const MOCK_CONFIG: NgoConfig = {
    name:               import.meta.env.VITE_NGO_NAME             || 'NGO Foundation',
    tagline:            'Empowering Communities, Changing Lives',
    logoUrl:            '',
    address:            '123, Seva Marg, New Delhi — 110001',
    phone:              import.meta.env.VITE_ADMIN_PHONE           || '9000000000',
    email:              import.meta.env.VITE_ADMIN_EMAIL           || 'admin@ngo.org',
    registrationNumber: 'NGO/REG/2020/001234',
    upiId:              import.meta.env.VITE_NGO_UPI_ID            || 'ngofoundation@upi',
    upiName:            import.meta.env.VITE_NGO_UPI_NAME          || 'NGO Foundation',
    signatureUrl:       '',
    presidentName:      'Dr. Rajesh Mehta',
    secretaryName:      'Mrs. Sunita Verma',
    foundedYear:        2020,
};

let _mock_config: NgoConfig = { ...MOCK_CONFIG };

export const getNgoConfig = async (): Promise<NgoConfig> => {
    if (USE_MOCK) {
        return Promise.resolve({ ..._mock_config });
    }
    return request<NgoConfig>({ url: '/ngo/config', method: 'GET' });
};

export const updateNgoConfig = async (data: Partial<NgoConfig>): Promise<NgoConfig> => {
    if (USE_MOCK) {
        _mock_config = { ..._mock_config, ...data };
        return Promise.resolve({ ..._mock_config });
    }
    return request<NgoConfig>({ url: '/ngo/config', method: 'PATCH', data });
};
