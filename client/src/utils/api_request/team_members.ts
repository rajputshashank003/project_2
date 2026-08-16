/**
 * team_members.ts — API module for team member slot management.
 */
import { request, unwrap } from "./utils";
import type { ApiResponse } from "./utils";
import type {
    TeamMember,
    TeamMemberSlot,
    UpdateTeamMemberPayload,
} from "../../types/team_member";

export const getTeamMembers = async (): Promise<TeamMember[]> => {
    const res = await request<ApiResponse<TeamMember[]>>({
        url: "/team",
        method: "GET",
    });
    return unwrap(res);
};

export const updateTeamMember = async (
    slot: TeamMemberSlot,
    data: UpdateTeamMemberPayload | FormData,
): Promise<TeamMember> => {
    let body: FormData;
    if (data instanceof FormData) {
        body = data;
    } else {
        body = new FormData();
        body.append("name", data.name);
        body.append("designation", data.designation);
        if (data.photo) body.append("photo", data.photo);
    }
    const res = await request<ApiResponse<TeamMember>>({
        url: `/team/${slot}`,
        method: "PATCH",
        data: body,
    });
    return unwrap(res);
};

export const clearTeamMember = async (
    slot: TeamMemberSlot,
): Promise<TeamMember> => {
    const res = await request<ApiResponse<TeamMember>>({
        url: `/team/${slot}/clear`,
        method: "PATCH",
    });
    return unwrap(res);
};

export const addTeamSlot = async (): Promise<TeamMember[]> => {
    const res = await request<ApiResponse<TeamMember[]>>({
        url: "/team/add-slot",
        method: "POST",
    });
    return unwrap(res);
};

export const removeTeamSlot = async (
    slot: TeamMemberSlot,
): Promise<TeamMember[]> => {
    const res = await request<ApiResponse<TeamMember[]>>({
        url: `/team/slot/${slot}`,
        method: "DELETE",
    });
    return unwrap(res);
};
