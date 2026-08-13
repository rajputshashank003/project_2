package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/shashankrajput/ngo-platform/api/internal/dto"
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"github.com/shashankrajput/ngo-platform/api/internal/repository"
)

// NoticeService handles notice business logic.
type NoticeService struct {
	repo       *repository.NoticeRepository
	cloudinary *CloudinaryService
}

// NewNoticeService constructs a NoticeService.
func NewNoticeService(repo *repository.NoticeRepository, cloudinary *CloudinaryService) *NoticeService {
	return &NoticeService{repo: repo, cloudinary: cloudinary}
}

// Create creates a notice, optionally uploading an image to Cloudinary.
func (s *NoticeService) Create(ctx context.Context, req dto.CreateNoticeRequest, createdBy string) (*models.Notice, error) {
	notice := &models.Notice{
		Title:     req.Title,
		Content:   req.Content,
		IsActive:  true,
		CreatedBy: createdBy,
	}

	if req.ImageB64 != "" {
		result, err := s.cloudinary.Upload(ctx, req.ImageB64)
		if err != nil {
			return nil, fmt.Errorf("notice: image upload failed: %w", err)
		}
		notice.ImageURL = result.SecureURL
		notice.CloudinaryID = result.PublicID
	}

	if err := s.repo.Create(notice); err != nil {
		if notice.CloudinaryID != "" {
			s.cloudinary.Delete(ctx, notice.CloudinaryID)
		}
		return nil, fmt.Errorf("notice: db create failed: %w", err)
	}

	return notice, nil
}

// List returns paginated notices.
func (s *NoticeService) List(page, limit int) ([]models.Notice, int64, error) {
	offset := (page - 1) * limit
	return s.repo.ListPaginated(offset, limit)
}

// ToggleActive flips a notice's isActive flag.
func (s *NoticeService) ToggleActive(id uuid.UUID, active bool) error {
	return s.repo.ToggleActive(id, active)
}

// Delete hard-deletes a notice and its Cloudinary image.
func (s *NoticeService) Delete(ctx context.Context, id uuid.UUID) error {
	notice, err := s.repo.FindByID(id)
	if err != nil {
		return fmt.Errorf("notice: not found")
	}
	if notice.CloudinaryID != "" {
		s.cloudinary.Delete(ctx, notice.CloudinaryID)
	}
	return s.repo.Delete(id)
}
