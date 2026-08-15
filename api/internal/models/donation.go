package models

import (
	"time"

	"github.com/google/uuid"
)

type Donation struct {
	ID                   uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID               *uuid.UUID `gorm:"type:uuid;column:user_id;index"                json:"userId,omitempty"`
	DonorName            string     `gorm:"size:255;not null"                              json:"donorName"`
	Phone                string     `gorm:"size:15"                                        json:"phone"`
	Email                string     `gorm:"size:255"                                       json:"email"`
	Amount               float64    `gorm:"type:decimal(10,2);not null"                    json:"amount"`
	PaymentScreenshotURL string     `gorm:"column:payment_screenshot_url"                  json:"paymentScreenshotUrl"`
	UTRNumber            string     `gorm:"column:utr_number;size:100"                     json:"utrNumber,omitempty"`
	Status               string     `gorm:"size:20;not null;default:'pending'"             json:"status"`
	RejectionReason      string     `gorm:"column:rejection_reason"                        json:"rejectionReason,omitempty"`
	CertificateURL       string     `gorm:"column:certificate_url"                         json:"certificateUrl,omitempty"`
	CertificateNumber    string     `gorm:"column:certificate_number;size:100;uniqueIndex" json:"certificateNumber,omitempty"`
	RequestedAt          time.Time  `gorm:"column:requested_at;not null;default:now()"     json:"requestedAt"`
	ReviewedAt           *time.Time `gorm:"column:reviewed_at"                             json:"reviewedAt,omitempty"`
	ReviewedBy           string     `gorm:"column:reviewed_by;size:255"                    json:"reviewedBy,omitempty"`
}
