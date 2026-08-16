/**
 * ngo.ts — API module for NGO configuration & Admin Digital Signature.
 */
import { request, unwrap } from "./utils";
import type { ApiResponse } from "./utils";
import type { NgoConfig } from "../../types/ngo";

export const getNgoConfig = async (): Promise<NgoConfig> => {
    const res = await request<ApiResponse<NgoConfig>>({
        url: "/ngo/config",
        method: "GET",
    });
    return unwrap(res);
};

export const updateNgoConfig = async (
    data: Partial<NgoConfig> & {
        logoFile?: File;
        signatureFile?: File;
        removeLogo?: boolean;
        removeSignature?: boolean;
    },
): Promise<NgoConfig> => {
    if (data.logoFile || data.signatureFile) {
        const formData = new FormData();
        if (data.name !== undefined) formData.append("name", data.name);
        if (data.tagline !== undefined)
            formData.append("tagline", data.tagline);
        if (data.address !== undefined)
            formData.append("address", data.address);
        if (data.phone !== undefined) formData.append("phone", data.phone);
        if (data.email !== undefined) formData.append("email", data.email);
        if (data.website !== undefined)
            formData.append("website", data.website);
        if (data.registrationNumber !== undefined)
            formData.append("registrationNumber", data.registrationNumber);
        if (data.upiId !== undefined) formData.append("upiId", data.upiId);
        if (data.upiName !== undefined)
            formData.append("upiName", data.upiName);
        if (data.bankName !== undefined)
            formData.append("bankName", data.bankName);
        if (data.accountNumber !== undefined)
            formData.append("accountNumber", data.accountNumber);
        if (data.ifscCode !== undefined)
            formData.append("ifscCode", data.ifscCode);
        if (data.accountHolderName !== undefined)
            formData.append("accountHolderName", data.accountHolderName);
        if (data.presidentName !== undefined)
            formData.append("presidentName", data.presidentName);
        if (data.secretaryName !== undefined)
            formData.append("secretaryName", data.secretaryName);
        if (data.foundedYear !== undefined)
            formData.append("foundedYear", String(data.foundedYear));
        if (data.description !== undefined)
            formData.append("description", data.description);
        if (data.mission !== undefined)
            formData.append("mission", data.mission);
        if (data.vision !== undefined) formData.append("vision", data.vision);
        if (data.managerPhone !== undefined)
            formData.append("managerPhone", data.managerPhone);
        if (data.statBeneficiaries !== undefined)
            formData.append("statBeneficiaries", data.statBeneficiaries);
        if (data.statVolunteers !== undefined)
            formData.append("statVolunteers", data.statVolunteers);
        if (data.statEventsHeld !== undefined)
            formData.append("statEventsHeld", data.statEventsHeld);
        if (data.statDonations !== undefined)
            formData.append("statDonations", data.statDonations);
        if (data.statYearsActive !== undefined)
            formData.append("statYearsActive", data.statYearsActive);
        if (data.logoFile) formData.append("logo", data.logoFile);
        if (data.signatureFile)
            formData.append("signature", data.signatureFile);
        if (data.removeLogo) formData.append("removeLogo", "true");
        if (data.removeSignature) formData.append("removeSignature", "true");

        const res = await request<ApiResponse<NgoConfig>>({
            url: "/ngo/config",
            method: "PATCH",
            data: formData,
        });
        return unwrap(res);
    }

    const payload = {
        name: data.name,
        tagline: data.tagline,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        registrationNumber: data.registrationNumber,
        upiId: data.upiId,
        upiName: data.upiName,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        accountHolderName: data.accountHolderName,
        presidentName: data.presidentName,
        secretaryName: data.secretaryName,
        foundedYear:
            typeof data.foundedYear === "number"
                ? data.foundedYear
                : Number(data.foundedYear) || undefined,
        description: data.description,
        mission: data.mission,
        vision: data.vision,
        managerPhone: data.managerPhone,
        statBeneficiaries: data.statBeneficiaries,
        statVolunteers: data.statVolunteers,
        statEventsHeld: data.statEventsHeld,
        statDonations: data.statDonations,
        statYearsActive: data.statYearsActive,
        removeLogo: data.removeLogo,
        removeSignature: data.removeSignature,
    };
    const res = await request<ApiResponse<NgoConfig>>({
        url: "/ngo/config",
        method: "PATCH",
        data: payload,
    });
    return unwrap(res);
};

export const uploadLogo = async (file: File): Promise<NgoConfig> => {
    const formData = new FormData();
    formData.append("logo", file);
    const res = await request<ApiResponse<NgoConfig>>({
        url: "/ngo/config",
        method: "PATCH",
        data: formData,
    });
    return unwrap(res);
};

export const deleteLogo = async (): Promise<NgoConfig> => {
    const res = await request<ApiResponse<NgoConfig>>({
        url: "/ngo/config",
        method: "PATCH",
        data: { removeLogo: true },
    });
    return unwrap(res);
};

export const uploadSignature = async (file: File): Promise<NgoConfig> => {
    const formData = new FormData();
    formData.append("signature", file);
    const res = await request<ApiResponse<NgoConfig>>({
        url: "/ngo/config",
        method: "PATCH",
        data: formData,
    });
    return unwrap(res);
};

export const deleteSignature = async (): Promise<NgoConfig> => {
    const res = await request<ApiResponse<NgoConfig>>({
        url: "/ngo/config",
        method: "PATCH",
        data: { removeSignature: true },
    });
    return unwrap(res);
};
