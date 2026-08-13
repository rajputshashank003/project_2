package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/shashankrajput/ngo-platform/api/internal/dto"
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"github.com/shashankrajput/ngo-platform/api/internal/repository"
)

// EventService handles event business logic.
type EventService struct {
	repo       *repository.EventRepository
	cloudinary *CloudinaryService
}

// NewEventService constructs an EventService.
func NewEventService(repo *repository.EventRepository, cloudinary *CloudinaryService) *EventService {
	return &EventService{repo: repo, cloudinary: cloudinary}
}

// Create creates an event and uploads all images to Cloudinary.
func (s *EventService) Create(ctx context.Context, req dto.CreateEventRequest, createdBy string) (*models.Event, error) {
	event := &models.Event{
		Title:       req.Title,
		Description: req.Description,
		CreatedBy:   createdBy,
	}

	uploadedIDs := []string{}
	for _, imgReq := range req.Images {
		result, err := s.cloudinary.Upload(ctx, imgReq.ImageB64)
		if err != nil {
			// Cleanup already-uploaded assets
			for _, pubID := range uploadedIDs {
				s.cloudinary.Delete(ctx, pubID)
			}
			return nil, fmt.Errorf("event: image upload failed: %w", err)
		}
		uploadedIDs = append(uploadedIDs, result.PublicID)
		event.Images = append(event.Images, models.EventImage{
			ImageURL:     result.SecureURL,
			CloudinaryID: result.PublicID,
			Caption:      imgReq.Caption,
		})
	}

	if err := s.repo.Create(event); err != nil {
		for _, pubID := range uploadedIDs {
			s.cloudinary.Delete(ctx, pubID)
		}
		return nil, fmt.Errorf("event: db create failed: %w", err)
	}

	return event, nil
}

// List returns paginated events with images.
func (s *EventService) List(page, limit int) ([]models.Event, int64, error) {
	offset := (page - 1) * limit
	return s.repo.ListPaginated(offset, limit)
}

// Update updates event fields and optionally replaces images.
func (s *EventService) Update(ctx context.Context, id uuid.UUID, req dto.UpdateEventRequest) (*models.Event, error) {
	event, err := s.repo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("event: not found")
	}

	if req.Title != "" {
		event.Title = req.Title
	}
	if req.Description != "" {
		event.Description = req.Description
	}

	// Replace images if provided
	if len(req.Images) > 0 {
		// Delete old Cloudinary assets
		oldImages, _ := s.repo.ListImagesByEventID(id)
		for _, img := range oldImages {
			s.cloudinary.Delete(ctx, img.CloudinaryID)
		}
		// Delete old DB image rows
		_ = s.repo.DeleteImages(id)

		// Upload new images
		uploadedIDs := []string{}
		newImages := []models.EventImage{}
		for _, imgReq := range req.Images {
			result, err := s.cloudinary.Upload(ctx, imgReq.ImageB64)
			if err != nil {
				for _, pubID := range uploadedIDs {
					s.cloudinary.Delete(ctx, pubID)
				}
				return nil, fmt.Errorf("event: new image upload failed: %w", err)
			}
			uploadedIDs = append(uploadedIDs, result.PublicID)
			newImages = append(newImages, models.EventImage{
				EventID:      id,
				ImageURL:     result.SecureURL,
				CloudinaryID: result.PublicID,
				Caption:      imgReq.Caption,
			})
		}
		if err := s.repo.AddImages(newImages); err != nil {
			return nil, fmt.Errorf("event: failed to save new images: %w", err)
		}
	}

	if err := s.repo.Update(event); err != nil {
		return nil, fmt.Errorf("event: update failed: %w", err)
	}

	return s.repo.FindByID(id)
}

// Delete deletes an event and all its Cloudinary images.
func (s *EventService) Delete(ctx context.Context, id uuid.UUID) error {
	images, _ := s.repo.ListImagesByEventID(id)
	for _, img := range images {
		s.cloudinary.Delete(ctx, img.CloudinaryID)
	}
	return s.repo.Delete(id)
}
