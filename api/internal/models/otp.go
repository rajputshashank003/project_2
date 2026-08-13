package models

import (
	"time"

	"github.com/google/uuid"
)

type OTP struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Phone     string    `gorm:"size:15;not null;index"                         json:"phone"`
	OTPCode   string    `gorm:"column:otp_code;size:6;not null"                json:"-"`
	ExpiresAt time.Time `gorm:"not null"                                       json:"expiresAt"`
	Used      bool      `gorm:"not null;default:false"                         json:"used"`
	CreatedAt time.Time `gorm:"not null;default:now()"                         json:"createdAt"`
}
