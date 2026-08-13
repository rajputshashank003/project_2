package repository

import (
	"time"

	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"gorm.io/gorm"
)

// OTPRepository handles all DB operations for OTPs.
type OTPRepository struct {
	db *gorm.DB
}

// NewOTPRepository constructs an OTPRepository.
func NewOTPRepository(db *gorm.DB) *OTPRepository {
	return &OTPRepository{db: db}
}

// InvalidatePrevious marks all unused, unexpired OTPs for a phone as used.
func (r *OTPRepository) InvalidatePrevious(phone string) error {
	return r.db.Model(&models.OTP{}).
		Where("phone = ? AND used = false AND expires_at > ?", phone, time.Now()).
		Update("used", true).Error
}

// Create inserts a new OTP record.
func (r *OTPRepository) Create(otp *models.OTP) error {
	return r.db.Create(otp).Error
}

// CountRecentByPhone counts OTP requests for a phone within the last 10 minutes.
func (r *OTPRepository) CountRecentByPhone(phone string) (int64, error) {
	var count int64
	err := r.db.Model(&models.OTP{}).
		Where("phone = ? AND created_at > ?", phone, time.Now().Add(-10*time.Minute)).
		Count(&count).Error
	return count, err
}

// FindValidByPhone returns the latest unused, unexpired OTP for a phone.
func (r *OTPRepository) FindValidByPhone(phone string) (*models.OTP, error) {
	var otp models.OTP
	err := r.db.
		Where("phone = ? AND used = false AND expires_at > ?", phone, time.Now()).
		Order("created_at DESC").
		First(&otp).Error
	if err != nil {
		return nil, err
	}
	return &otp, nil
}

// MarkUsed sets used = true for a given OTP ID.
func (r *OTPRepository) MarkUsed(id interface{}) error {
	return r.db.Model(&models.OTP{}).Where("id = ?", id).Update("used", true).Error
}
