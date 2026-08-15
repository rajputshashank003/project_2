package dto

// CreateIDCardRequest is the body/form for POST /id-cards.
type CreateIDCardRequest struct {
	UserName    string `json:"userName"    form:"userName"    binding:"required"`
	Phone       string `json:"phone"       form:"phone"`
	Email       string `json:"email"       form:"email"`
	Address     string `json:"address"     form:"address"`
	Designation string `json:"designation" form:"designation"`
}

// UpdateIDCardStatusRequest is the body for PATCH /id-cards/:id/status.
type UpdateIDCardStatusRequest struct {
	Status          string `json:"status"          binding:"required,oneof=approved rejected"`
	RejectionReason string `json:"rejectionReason"`
	ValidityYears   *int   `json:"validityYears"` // 0 = Lifetime, N = N years; required on approval
}
