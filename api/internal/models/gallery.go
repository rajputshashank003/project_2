package models

import (
	"time"

	"github.com/google/uuid"
)

type GalleryImage struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ImageURL     string    `gorm:"column:image_url;not null"                      json:"imageUrl"`
	CloudinaryID string    `gorm:"column:cloudinary_id;size:500"                  json:"-"`
	Caption      string    `gorm:"size:500"                                       json:"caption,omitempty"`
	UploadedAt   time.Time `gorm:"column:uploaded_at;not null;default:now()"      json:"uploadedAt"`
	UploadedBy   string    `gorm:"column:uploaded_by;size:255"                    json:"uploadedBy"`
}
