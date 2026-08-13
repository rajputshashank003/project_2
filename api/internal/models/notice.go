package models

import (
	"time"

	"github.com/google/uuid"
)

type Notice struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Title        string    `gorm:"size:500;not null"                              json:"title"`
	Content      string    `gorm:"type:text;not null"                             json:"content"`
	ImageURL     string    `gorm:"column:image_url"                               json:"imageUrl,omitempty"`
	CloudinaryID string    `gorm:"column:cloudinary_id;size:500"                  json:"-"`
	IsActive     bool      `gorm:"column:is_active;not null;default:true"         json:"isActive"`
	CreatedAt    time.Time `gorm:"not null;default:now()"                         json:"createdAt"`
	CreatedBy    string    `gorm:"column:created_by;size:255"                     json:"createdBy"`
}
