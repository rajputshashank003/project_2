package models

import (
	"time"

	"github.com/google/uuid"
)

type Event struct {
	ID          uuid.UUID    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Title       string       `gorm:"size:500;not null"                              json:"title"`
	Description string       `gorm:"type:text"                                      json:"description"`
	CreatedAt   time.Time    `gorm:"not null;default:now()"                         json:"createdAt"`
	CreatedBy   string       `gorm:"column:created_by;size:255"                     json:"createdBy"`
	Images      []EventImage `gorm:"foreignKey:EventID"                             json:"images"`
}

type EventImage struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	EventID      uuid.UUID `gorm:"type:uuid;column:event_id;not null;index"       json:"eventId,omitempty"`
	ImageURL     string    `gorm:"column:image_url;not null"                      json:"imageUrl"`
	CloudinaryID string    `gorm:"column:cloudinary_id;size:500"                  json:"-"`
	Caption      string    `gorm:"size:500"                                       json:"caption,omitempty"`
}
