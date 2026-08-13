package models

import (
	"encoding/json"
	"time"
)

// IdempotencyKey stores a processed request key with its response for deduplication.
type IdempotencyKey struct {
	Key       string          `gorm:"primaryKey;size:255"  json:"key"`
	Endpoint  string          `gorm:"primaryKey;size:255"  json:"endpoint"`
	Response  json.RawMessage `gorm:"type:jsonb"           json:"response"`
	CreatedAt time.Time       `gorm:"not null;default:now()" json:"createdAt"`
}
