/**
 * auth.ts — API module for OTP authentication.
 * In mock mode (no VITE_API_BASE_URL), OTP send always succeeds and any 6-digit code logs in.
 */
import { request } from './utils';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

export interface SendOtpResponse {
    success: boolean;
    message: string;
}

export interface VerifyOtpResponse {
    success: boolean;
    token: string;
    user: {
        id: string;
        phone: string;
        name: string;
        role: 'admin' | 'user';
        designation: string;
    };
}

export const sendOtp = async (phone: string): Promise<SendOtpResponse> => {
    if (USE_MOCK) {
        console.info(`[MOCK] OTP sent to ${phone} — use any 6 digits to login`);
        return Promise.resolve({ success: true, message: 'OTP sent (mock)' });
    }
    return request<SendOtpResponse>({ url: '/auth/send-otp', method: 'POST', data: { phone } });
};

export const verifyOtp = async (phone: string, otp: string): Promise<VerifyOtpResponse> => {
    if (USE_MOCK) {
        // In mock mode accept any 6-digit code.
        // Phone 9000000000 is treated as admin for easy testing.
        const is_admin = phone === '9000000000';
        return Promise.resolve({
            success: true,
            token:   `mock-token-${Date.now()}`,
            user: {
                id:          `user-${phone}`,
                phone,
                name:        is_admin ? 'Admin User' : 'Demo User',
                role:        is_admin ? 'admin' : 'user',
                designation: is_admin ? 'admin' : 'member',
            },
        });
    }
    return request<VerifyOtpResponse>({
        url:    '/auth/verify-otp',
        method: 'POST',
        data:   { phone, otp },
    });
};
