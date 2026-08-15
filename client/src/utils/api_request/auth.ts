/**
 * auth.ts — API module for OTP authentication.
 */
import { request, unwrap } from './utils';
import type { ApiResponse } from './utils';

export interface SendOtpResponse {
    message: string;
}

export interface VerifyOtpResponse {
    token: string;
    user: {
        id: string;
        phone: string;
        name: string;
        email?: string;
        role: 'admin' | 'user';
        designation: string;
    };
}

export const sendOtp = async (phone: string): Promise<SendOtpResponse> => {
    const res = await request<ApiResponse<SendOtpResponse>>({
        url:    '/auth/send-otp',
        method: 'POST',
        data:   { phone },
    });
    return unwrap(res);
};

export const verifyOtp = async (phone: string, otp: string): Promise<VerifyOtpResponse> => {
    const res = await request<ApiResponse<VerifyOtpResponse>>({
        url:    '/auth/verify-otp',
        method: 'POST',
        data:   { phone, otp },
    });
    return unwrap(res);
};

export const updateMyProfile = async (payload: { name: string; email: string }): Promise<{
    id: string;
    phone: string;
    name: string;
    email: string;
    role: string;
    designation: string;
}> => {
    const res = await request<ApiResponse<{
        id: string;
        phone: string;
        name: string;
        email: string;
        role: string;
        designation: string;
    }>>({
        url:    '/my/profile',
        method: 'PATCH',
        data:   payload,
    });
    return unwrap(res);
};
