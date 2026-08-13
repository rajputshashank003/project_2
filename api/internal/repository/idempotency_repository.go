package repository

import (
	"encoding/json"
	"time"

	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"gorm.io/gorm"
)

// IdempotencyRepository handles storage and lookup of idempotency keys.
type IdempotencyRepository struct {
	db *gorm.DB
}

// NewIdempotencyRepository constructs an IdempotencyRepository.
func NewIdempotencyRepository(db *gorm.DB) *IdempotencyRepository {
	return &IdempotencyRepository{db: db}
}

// Find looks up an idempotency key that is still within the 24-hour TTL.
// Returns nil if not found or expired.
func (r *IdempotencyRepository) Find(key, endpoint string) (*models.IdempotencyKey, error) {
	var rec models.IdempotencyKey
	err := r.db.
		Where("key = ? AND endpoint = ? AND created_at > ?", key, endpoint, time.Now().Add(-24*time.Hour)).
		First(&rec).Error
	if err != nil {
		return nil, err // gorm.ErrRecordNotFound when not found
	}
	return &rec, nil
}

// Save stores a new idempotency key with its response JSON.
func (r *IdempotencyRepository) Save(key, endpoint string, response interface{}) error {
	raw, err := json.Marshal(response)
	if err != nil {
		return err
	}
	rec := models.IdempotencyKey{
		Key:      key,
		Endpoint: endpoint,
		Response: raw,
	}
	return r.db.Create(&rec).Error
}

// Cleanup deletes all expired idempotency keys (older than 24h).
// Called by the hourly background goroutine in main.go.
func (r *IdempotencyRepository) Cleanup() error {
	return r.db.
		Where("created_at < ?", time.Now().Add(-24*time.Hour)).
		Delete(&models.IdempotencyKey{}).Error
}
