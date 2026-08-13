package dto

// CreateDonationRequest is the body for POST /donations.
type CreateDonationRequest struct {
	DonorName             string  `json:"donorName"             binding:"required"`
	Phone                 string  `json:"phone"`
	Email                 string  `json:"email"`
	Amount                float64 `json:"amount"                binding:"required,gt=0"`
	PaymentScreenshotB64  string  `json:"paymentScreenshotBase64" binding:"required"`
	UTRNumber             string  `json:"utrNumber"`
}

// UpdateDonationStatusRequest is the body for PATCH /donations/:id/status.
type UpdateDonationStatusRequest struct {
	Status          string `json:"status"          binding:"required,oneof=approved rejected"`
	RejectionReason string `json:"rejectionReason"`
}
