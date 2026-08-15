package models

import (
	"time"

	"github.com/google/uuid"
)

type IDCard struct {
	ID                   uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID               *uuid.UUID `gorm:"type:uuid;column:user_id"                       json:"userId,omitempty"`
	UserName             string     `gorm:"column:user_name;size:255;not null"             json:"userName"`
	Phone                string     `gorm:"size:15"                                        json:"phone"`
	Email                string     `gorm:"size:255"                                       json:"email"`
	Address              string     `gorm:"type:text"                                      json:"address"`
	Designation          string     `gorm:"size:50"                                        json:"designation"`
	PassportPhotoURL     string     `gorm:"column:passport_photo_url"                      json:"passportPhotoUrl"`
	PaymentScreenshotURL string     `gorm:"column:payment_screenshot_url"                  json:"paymentScreenshotUrl"`
	UniqueCardNumber     *string    `gorm:"column:unique_card_number;size:100;uniqueIndex" json:"uniqueCardNumber,omitempty"`
	Status               string     `gorm:"size:20;not null;default:'pending'"             json:"status"`
	RejectionReason      *string    `gorm:"column:rejection_reason"                        json:"rejectionReason,omitempty"`
	ValidityYears        *int       `gorm:"column:validity_years"                          json:"validityYears,omitempty"`
	IssueDate            *time.Time `gorm:"column:issue_date"                              json:"issueDate,omitempty"`
	ExpiryDate           *time.Time `gorm:"column:expiry_date"                             json:"expiryDate,omitempty"`
	RequestedAt          time.Time  `gorm:"column:requested_at;not null;default:now()"     json:"requestedAt"`
	ReviewedAt           *time.Time `gorm:"column:reviewed_at"                             json:"reviewedAt,omitempty"`
	ReviewedBy           *string    `gorm:"column:reviewed_by;size:255"                    json:"reviewedBy,omitempty"`
}
