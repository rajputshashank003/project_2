package service

import (
	"context"
	"fmt"
	"io"

	"github.com/google/uuid"
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"github.com/shashankrajput/ngo-platform/api/internal/repository"
)

// GalleryService handles gallery business logic.
type GalleryService struct {
	repo       *repository.GalleryRepository
	cloudinary *CloudinaryService
}

// NewGalleryService constructs a GalleryService.
func NewGalleryService(repo *repository.GalleryRepository, cloudinary *CloudinaryService) *GalleryService {
	return &GalleryService{repo: repo, cloudinary: cloudinary}
}

// Upload uploads an image file stream to Cloudinary then stores the record.
func (s *GalleryService) Upload(ctx context.Context, caption string, file io.Reader, uploadedBy string) (*models.GalleryImage, error) {
	result, err := s.cloudinary.UploadFile(ctx, file)
	if err != nil {
		return nil, fmt.Errorf("gallery: upload failed: %w", err)
	}

	img := &models.GalleryImage{
		ImageURL:     result.SecureURL,
		CloudinaryID: result.PublicID,
		Caption:      caption,
		UploadedBy:   uploadedBy,
	}

	if err := s.repo.Create(img); err != nil {
		s.cloudinary.Delete(ctx, result.PublicID)
		return nil, fmt.Errorf("gallery: db create failed: %w", err)
	}

	return img, nil
}

// List returns paginated gallery images.
func (s *GalleryService) List(page, limit int) ([]models.GalleryImage, int64, error) {
	offset := (page - 1) * limit
	return s.repo.ListPaginated(offset, limit)
}

// Delete hard-deletes a gallery image and removes it from Cloudinary.
func (s *GalleryService) Delete(ctx context.Context, id uuid.UUID) error {
	img, err := s.repo.FindByID(id)
	if err != nil {
		return fmt.Errorf("gallery: not found")
	}
	s.cloudinary.Delete(ctx, img.CloudinaryID)
	return s.repo.Delete(id)
}
