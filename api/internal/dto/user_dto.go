package dto

// UpdateUserRequest is the body for PATCH /users/:id (admin use).
type UpdateUserRequest struct {
	Designation string `json:"designation"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	BloodGroup  string `json:"bloodGroup"`
}

// UpdateMyProfileRequest is the body for PATCH /my/profile (self-update by user).
type UpdateMyProfileRequest struct {
	Name       string `json:"name"  binding:"required"`
	Email      string `json:"email" binding:"required"`
	BloodGroup string `json:"bloodGroup"`
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

// SendWhatsAppRequest is the body for POST /notify/whatsapp_twilio and /notify/whatsapp_local.
type SendWhatsAppRequest struct {
	Phone   string `json:"phone"   binding:"required"`
	Message string `json:"message" binding:"required"`
}
