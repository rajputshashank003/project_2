package repository

import (
	"github.com/google/uuid"
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"gorm.io/gorm"
)

// EventRepository handles DB operations for events and event_images.
type EventRepository struct {
	db *gorm.DB
}

// NewEventRepository constructs an EventRepository.
func NewEventRepository(db *gorm.DB) *EventRepository {
	return &EventRepository{db: db}
}

// Create inserts a new event with its images in one transaction.
func (r *EventRepository) Create(event *models.Event) error {
	return r.db.Create(event).Error
}

// ListPaginated returns paginated events (with images preloaded) newest first.
func (r *EventRepository) ListPaginated(offset, limit int) ([]models.Event, int64, error) {
	var events []models.Event
	var total int64

	if err := r.db.Model(&models.Event{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := r.db.Preload("Images").Order("created_at DESC").Offset(offset).Limit(limit).Find(&events).Error; err != nil {
		return nil, 0, err
	}
	return events, total, nil
}

// FindByID returns an event with preloaded images.
func (r *EventRepository) FindByID(id uuid.UUID) (*models.Event, error) {
	var event models.Event
	err := r.db.Preload("Images").First(&event, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &event, nil
}

// Update saves event title/description fields without cascading associations.
func (r *EventRepository) Update(event *models.Event) error {
	return r.db.Model(event).Select("Title", "Description", "UpdatedAt").Updates(event).Error
}

// DeleteImages removes all event_images for an event (before replacing).
func (r *EventRepository) DeleteImages(eventID uuid.UUID) error {
	return r.db.Where("event_id = ?", eventID).Delete(&models.EventImage{}).Error
}

// AddImages bulk-inserts event images.
func (r *EventRepository) AddImages(images []models.EventImage) error {
	if len(images) == 0 {
		return nil
	}
	return r.db.Create(&images).Error
}

// Delete hard-deletes an event (cascades to event_images via FK).
func (r *EventRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Event{}, "id = ?", id).Error
}

// ListImagesByEventID returns all images for an event.
func (r *EventRepository) ListImagesByEventID(eventID uuid.UUID) ([]models.EventImage, error) {
	var images []models.EventImage
	err := r.db.Where("event_id = ?", eventID).Find(&images).Error
	return images, err
}
