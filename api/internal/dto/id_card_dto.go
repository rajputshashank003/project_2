package dto

// CreateIDCardRequest is the body for POST /id-cards.
type CreateIDCardRequest struct {
	UserName              string `json:"userName"               binding:"required"`
	Phone                 string `json:"phone"`
	Email                 string `json:"email"`
	Address               string `json:"address"`
	Designation           string `json:"designation"`
	PassportPhotoB64      string `json:"passportPhotoBase64"    binding:"required"`
	PaymentScreenshotB64  string `json:"paymentScreenshotBase64" binding:"required"`
}

// UpdateIDCardStatusRequest is the body for PATCH /id-cards/:id/status.
type UpdateIDCardStatusRequest struct {
	Status          string `json:"status"          binding:"required,oneof=approved rejected"`
	RejectionReason string `json:"rejectionReason"`
	ValidityYears   *int   `json:"validityYears"` // 0 = Lifetime, N = N years; required on approval
}
