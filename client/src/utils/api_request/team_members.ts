import { request } from './utils';
import { mock_team_members } from '../../mock/team_members';
import type { TeamMember, TeamMemberSlot, UpdateTeamMemberPayload } from '../../types/team_member';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

let _mock_store: TeamMember[] = [...mock_team_members];

export const getTeamMembers = async (): Promise<TeamMember[]> => {
    if (USE_MOCK) return Promise.resolve([..._mock_store].sort((a, b) => a.slot - b.slot));
    return request<TeamMember[]>({ url: '/team', method: 'GET' });
};

export const updateTeamMember = async (
    slot: TeamMemberSlot,
    data: UpdateTeamMemberPayload
): Promise<TeamMember> => {
    if (USE_MOCK) {
        _mock_store = _mock_store.map((m) =>
            m.slot === slot
                ? { ...m, name: data.name, designation: data.designation, photoUrl: data.photoBase64, updatedAt: new Date().toISOString() }
                : m
        );
        return Promise.resolve(_mock_store.find((m) => m.slot === slot)!);
    }
    return request<TeamMember>({ url: `/team/${slot}`, method: 'PATCH', data });
};

export const clearTeamMember = async (slot: TeamMemberSlot): Promise<TeamMember> => {
    if (USE_MOCK) {
        _mock_store = _mock_store.map((m) =>
            m.slot === slot
                ? { ...m, name: '', designation: '', photoUrl: '', updatedAt: new Date().toISOString() }
                : m
        );
        return Promise.resolve(_mock_store.find((m) => m.slot === slot)!);
    }
    return request<TeamMember>({ url: `/team/${slot}/clear`, method: 'PATCH' });
};

export const addTeamSlot = async (): Promise<TeamMember[]> => {
    if (USE_MOCK) {
        if (_mock_store.length >= 5) return Promise.resolve([..._mock_store]);
        const nextSlot = (_mock_store.length + 1) as TeamMemberSlot;
        const newMember: TeamMember = { slot: nextSlot, name: '', designation: '', photoUrl: '', updatedAt: new Date().toISOString() };
        _mock_store = [..._mock_store, newMember];
        return Promise.resolve([..._mock_store]);
    }
    return request<TeamMember[]>({ url: '/team/add-slot', method: 'POST' });
};

export const removeTeamSlot = async (slot: TeamMemberSlot): Promise<TeamMember[]> => {
    if (USE_MOCK) {
        if (_mock_store.length <= 3) return Promise.resolve([..._mock_store]);
        _mock_store = _mock_store.filter((m) => m.slot !== slot);
        _mock_store = _mock_store.map((m, idx) => ({ ...m, slot: (idx + 1) as TeamMemberSlot }));
        return Promise.resolve([..._mock_store]);
    }
    return request<TeamMember[]>({ url: `/team/slot/${slot}`, method: 'DELETE' });
};
