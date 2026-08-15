/**
 * ngo.ts — API module for NGO configuration & Admin Digital Signature.
 */
import { request, unwrap } from './utils';
import type { ApiResponse } from './utils';
import type { NgoConfig } from '../../types/ngo';

export const getNgoConfig = async (): Promise<NgoConfig> => {
    const res = await request<ApiResponse<NgoConfig>>({ url: '/ngo/config', method: 'GET' });
    return unwrap(res);
};

export const updateNgoConfig = async (data: Partial<NgoConfig>): Promise<NgoConfig> => {
    const payload = {
        name:               data.name,
        tagline:            data.tagline,
        address:            data.address,
        phone:              data.phone,
        email:              data.email,
        website:            data.website,
        registrationNumber: data.registrationNumber,
        upiId:              data.upiId,
        upiName:            data.upiName,
        bankName:           data.bankName,
        accountNumber:      data.accountNumber,
        ifscCode:           data.ifscCode,
        accountHolderName:  data.accountHolderName,
        presidentName:      data.presidentName,
        secretaryName:      data.secretaryName,
        foundedYear:        typeof data.foundedYear === 'number' ? data.foundedYear : Number(data.foundedYear) || undefined,
        description:        data.description,
        mission:            data.mission,
        vision:             data.vision,
        managerPhone:       data.managerPhone,
    };
    const res = await request<ApiResponse<NgoConfig>>({
        url:    '/ngo/config',
        method: 'PATCH',
        data:   payload,
    });
    return unwrap(res);
};

export const uploadLogo = async (file: File): Promise<NgoConfig> => {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await request<ApiResponse<NgoConfig>>({
        url:    '/ngo/config',
        method: 'PATCH',
        data:   formData,
    });
    return unwrap(res);
};

export const deleteLogo = async (): Promise<NgoConfig> => {
    const res = await request<ApiResponse<NgoConfig>>({
        url:    '/ngo/config',
        method: 'PATCH',
        data:   { removeLogo: true },
    });
    return unwrap(res);
};

export const uploadSignature = async (file: File): Promise<NgoConfig> => {
    const formData = new FormData();
    formData.append('signature', file);
    const res = await request<ApiResponse<NgoConfig>>({
        url:    '/ngo/config',
        method: 'PATCH',
        data:   formData,
    });
    return unwrap(res);
};

export const deleteSignature = async (): Promise<NgoConfig> => {
    const res = await request<ApiResponse<NgoConfig>>({
        url:    '/ngo/config',
        method: 'PATCH',
        data:   { removeSignature: true },
    });
    return unwrap(res);
};
