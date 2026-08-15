package dto

// UpdateTeamMemberRequest is the form/body for PATCH /team/:slot.
type UpdateTeamMemberRequest struct {
	Name        string `json:"name"        form:"name"`
	Designation string `json:"designation" form:"designation"`
}
