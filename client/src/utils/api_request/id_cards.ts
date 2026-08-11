/**
 * id_cards.ts — API module for ID card requests.
 * Uses mock data when no backend is available (VITE_API_BASE_URL not set).
 */
import { request } from './utils';
import { mock_id_cards } from '../../mock/id_cards';
import { generateCardNumber } from '../helpers';
import type { IdCard, CreateIdCardPayload, UpdateIdCardStatusPayload } from '../../types/id_card';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

let _mock_store: IdCard[] = [...mock_id_cards];

export const getIdCardRequests = async (): Promise<IdCard[]> => {
    if (USE_MOCK) {
        return Promise.resolve([..._mock_store]);
    }
    return request<IdCard[]>({ url: '/id-cards', method: 'GET' });
};

export const getIdCardById = async (id: string): Promise<IdCard> => {
    if (USE_MOCK) {
        const found = _mock_store.find((c) => c.id === id);
        if (!found) return Promise.reject(new Error('ID card not found'));
        return Promise.resolve(found);
    }
    return request<IdCard>({ url: `/id-cards/${id}`, method: 'GET' });
};

export const createIdCardRequest = async (data: CreateIdCardPayload): Promise<IdCard> => {
    if (USE_MOCK) {
        const card: IdCard = {
            id:                   `IDR-${Date.now()}`,
            userId:               `user-${Date.now()}`,
            userName:             data.userName,
            phone:                data.phone,
            email:                data.email,
            address:              data.address,
            designation:          data.designation,
            passportPhotoUrl:     data.passportPhotoBase64,
            paymentScreenshotUrl: data.paymentScreenshotBase64,
            uniqueCardNumber:     '',
            status:               'pending',
            requestedAt:          new Date().toISOString(),
        };
        _mock_store = [card, ..._mock_store];
        return Promise.resolve(card);
    }
    return request<IdCard>({ url: '/id-cards', method: 'POST', data });
};

export const updateIdCardStatus = async (
    id: string,
    data: UpdateIdCardStatusPayload
): Promise<IdCard> => {
    if (USE_MOCK) {
        _mock_store = _mock_store.map((c) =>
            c.id === id
                ? {
                      ...c,
                      status:          data.status,
                      rejectionReason: data.rejectionReason,
                      uniqueCardNumber: data.status === 'approved' ? generateCardNumber() : c.uniqueCardNumber,
                      issueDate:       data.status === 'approved' ? new Date().toISOString() : c.issueDate,
                      reviewedAt:      new Date().toISOString(),
                      reviewedBy:      'admin',
                  }
                : c
        );
        const updated = _mock_store.find((c) => c.id === id)!;
        return Promise.resolve(updated);
    }
    return request<IdCard>({ url: `/id-cards/${id}/status`, method: 'PATCH', data });
};
