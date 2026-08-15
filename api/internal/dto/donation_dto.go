package dto

// CreateDonationRequest is the body/form for POST /donations.
type CreateDonationRequest struct {
	DonorName string  `json:"donorName" form:"donorName" binding:"required"`
	Phone     string  `json:"phone"     form:"phone"`
	Email     string  `json:"email"     form:"email"`
	Amount    float64 `json:"amount"    form:"amount"    binding:"required,gt=0"`
	UTRNumber string  `json:"utrNumber" form:"utrNumber"`
}

// UpdateDonationStatusRequest is the body for PATCH /donations/:id/status.
type UpdateDonationStatusRequest struct {
	Status          string `json:"status"          binding:"required,oneof=approved rejected"`
	RejectionReason string `json:"rejectionReason"`
}
