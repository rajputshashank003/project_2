export type TeamMemberSlot = 1 | 2 | 3 | 4 | 5;

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
