export type TeamMemberSlot = 1 | 2 | 3;

export interface TeamMember {
  slot: TeamMemberSlot;
  name: string;
  designation: string;
  photoUrl: string;
  updatedAt: string;
}

export interface UpdateTeamMemberPayload {
  name: string;
  designation: string;
  photoBase64: string;
}
