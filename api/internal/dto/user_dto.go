package dto

// UpdateUserRequest is the body for PATCH /users/:id.
type UpdateUserRequest struct {
	Designation string `json:"designation"`
	Name        string `json:"name"`
	Email       string `json:"email"`
}

// SendSMSRequest is the body for POST /notify/sms.
type SendSMSRequest struct {
	Phone   string `json:"phone"   binding:"required"`
	Message string `json:"message" binding:"required"`
}

// SendEmailRequest is the body for POST /notify/email.
type SendEmailRequest struct {
	To      string `json:"to"      binding:"required"`
	Subject string `json:"subject" binding:"required"`
	HTML    string `json:"html"    binding:"required"`
}
