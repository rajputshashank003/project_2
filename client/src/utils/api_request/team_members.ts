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
