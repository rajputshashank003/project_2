/**
 * ngo.ts — API module for NGO configuration & Admin Digital Signature.
 */
import { request, unwrap } from './utils';
import type { ApiResponse } from './utils';
import type { NgoConfig } from '../../types/ngo';

// Backend DTO uses logoBase64 / signatureBase64 — not logoUrl / signatureUrl
interface UpdateNgoConfigPayload {
    name?:               string;
    tagline?:            string;
    logoBase64?:         string;
    address?:            string;
    phone?:              string;
    email?:              string;
    website?:            string;
    registrationNumber?: string;
    upiId?:              string;
    upiName?:            string;
    bankName?:           string;
    accountNumber?:      string;
    ifscCode?:           string;
    accountHolderName?:  string;
    signatureBase64?:    string;
    presidentName?:      string;
    secretaryName?:      string;
    foundedYear?:        number;
    description?:        string;
}

export const getNgoConfig = async (): Promise<NgoConfig> => {
    const res = await request<ApiResponse<NgoConfig>>({ url: '/ngo/config', method: 'GET' });
    return unwrap(res);
};

export const updateNgoConfig = async (data: Partial<NgoConfig>): Promise<NgoConfig> => {
    // Map NgoConfig field names to the backend DTO field names.
    // logoUrl with base64 data → logoBase64; signatureUrl → signatureBase64.
    const payload: UpdateNgoConfigPayload = {
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
        foundedYear:        data.foundedYear,
        description:        data.description,
        // Pass image data using the backend's expected field names
        logoBase64:      data.logoUrl      ? data.logoUrl      : undefined,
        signatureBase64: data.signatureUrl !== undefined ? data.signatureUrl : undefined,
    };
    const res = await request<ApiResponse<NgoConfig>>({
        url:    '/ngo/config',
        method: 'PATCH',
        data:   payload,
    });
    return unwrap(res);
};

export const uploadSignature = async (signatureBase64: string): Promise<NgoConfig> => {
    const res = await request<ApiResponse<NgoConfig>>({
        url:    '/ngo/config',
        method: 'PATCH',
        data:   { signatureBase64 },
    });
    return unwrap(res);
};

export const deleteSignature = async (): Promise<NgoConfig> => {
    const res = await request<ApiResponse<NgoConfig>>({
        url:    '/ngo/config',
        method: 'PATCH',
        data:   { signatureBase64: '' },
    });
    return unwrap(res);
};
