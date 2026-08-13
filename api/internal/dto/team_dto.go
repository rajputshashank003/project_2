package dto

// UpdateTeamMemberRequest is the body for PATCH /team/:slot.
type UpdateTeamMemberRequest struct {
	Name        string `json:"name"`
	Designation string `json:"designation"`
	PhotoB64    string `json:"photoBase64"`
}
