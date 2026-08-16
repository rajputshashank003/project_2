package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Phone             string    `gorm:"uniqueIndex;size:15;not null"                   json:"phone"`
	Name              string    `gorm:"size:255;not null;default:''"                   json:"name"`
	Email             string    `gorm:"size:255"                                       json:"email,omitempty"`
	BloodGroup        string    `gorm:"column:blood_group;size:10;not null;default:''" json:"bloodGroup"`
	Role              string    `gorm:"size:20;not null;default:'user'"                json:"role"`
	Designation       string    `gorm:"size:50;not null;default:'member'"              json:"designation"`
	PassportPhotoURL  string    `gorm:"column:passport_photo_url"                      json:"passportPhotoUrl,omitempty"`
	JoinedAt          time.Time `gorm:"not null;default:now()"                         json:"joinedAt"`
	IsActive          bool      `gorm:"not null;default:true"                          json:"isActive"`
}
