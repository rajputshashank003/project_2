package models

import "time"

type TeamMember struct {
	Slot         int       `gorm:"primaryKey"              json:"slot"`
	Name         string    `gorm:"size:255;not null;default:''" json:"name"`
	Designation  string    `gorm:"size:255;not null;default:''" json:"designation"`
	PhotoURL     string    `gorm:"column:photo_url"        json:"photoUrl"`
	CloudinaryID string    `gorm:"column:cloudinary_id;size:500" json:"-"`
	UpdatedAt    time.Time `gorm:"not null;default:now()"  json:"updatedAt"`
}
