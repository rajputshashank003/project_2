package dto

// SendOTPRequest is the body for POST /auth/send-otp.
type SendOTPRequest struct {
	Phone string `json:"phone" binding:"required"`
}

// VerifyOTPRequest is the body for POST /auth/verify-otp.
type VerifyOTPRequest struct {
	Phone string `json:"phone" binding:"required"`
	OTP   string `json:"otp"   binding:"required"`
}

// AuthResponse is returned on successful OTP verification.
type AuthResponse struct {
	Token string      `json:"token"`
	User  interface{} `json:"user"`
}
