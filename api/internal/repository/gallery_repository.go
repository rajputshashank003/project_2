package repository

import (
	"github.com/google/uuid"
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"gorm.io/gorm"
)

// GalleryRepository handles DB operations for gallery_images.
type GalleryRepository struct {
	db *gorm.DB
}

// NewGalleryRepository constructs a GalleryRepository.
func NewGalleryRepository(db *gorm.DB) *GalleryRepository {
	return &GalleryRepository{db: db}
}

// Create inserts a new gallery image.
func (r *GalleryRepository) Create(img *models.GalleryImage) error {
	return r.db.Create(img).Error
}

// ListPaginated returns paginated gallery images ordered by uploaded_at DESC.
func (r *GalleryRepository) ListPaginated(offset, limit int) ([]models.GalleryImage, int64, error) {
	var images []models.GalleryImage
	var total int64

	if err := r.db.Model(&models.GalleryImage{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := r.db.Order("uploaded_at DESC").Offset(offset).Limit(limit).Find(&images).Error; err != nil {
		return nil, 0, err
	}
	return images, total, nil
}

// FindByID returns a gallery image by UUID.
func (r *GalleryRepository) FindByID(id uuid.UUID) (*models.GalleryImage, error) {
	var img models.GalleryImage
	err := r.db.First(&img, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &img, nil
}

// Delete hard-deletes a gallery image.
func (r *GalleryRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.GalleryImage{}, "id = ?", id).Error
}
