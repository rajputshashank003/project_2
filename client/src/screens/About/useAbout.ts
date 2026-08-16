import { useState, useEffect } from "react";
import { getTeamMembers } from "../../utils/api_request/team_members";
import type { TeamMember } from "../../types/team_member";

export const useAbout = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getTeamMembers()
            .then(setTeamMembers)
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    return { teamMembers, isLoading };
};

export type ReturnTypeOfUseAbout = ReturnType<typeof useAbout>;
