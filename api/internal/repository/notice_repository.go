package repository

import (
	"github.com/google/uuid"
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"gorm.io/gorm"
)

// NoticeRepository handles all DB operations for notices.
type NoticeRepository struct {
	db *gorm.DB
}

// NewNoticeRepository constructs a NoticeRepository.
func NewNoticeRepository(db *gorm.DB) *NoticeRepository {
	return &NoticeRepository{db: db}
}

// Create inserts a new notice.
func (r *NoticeRepository) Create(n *models.Notice) error {
	return r.db.Create(n).Error
}

// ListPaginated returns paginated notices ordered by created_at DESC.
func (r *NoticeRepository) ListPaginated(offset, limit int) ([]models.Notice, int64, error) {
	var notices []models.Notice
	var total int64

	if err := r.db.Model(&models.Notice{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := r.db.Order("created_at DESC").Offset(offset).Limit(limit).Find(&notices).Error; err != nil {
		return nil, 0, err
	}
	return notices, total, nil
}

// FindByID returns a notice by UUID.
func (r *NoticeRepository) FindByID(id uuid.UUID) (*models.Notice, error) {
	var n models.Notice
	err := r.db.First(&n, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &n, nil
}

// ToggleActive flips the is_active flag.
func (r *NoticeRepository) ToggleActive(id uuid.UUID, active bool) error {
	return r.db.Model(&models.Notice{}).Where("id = ?", id).Update("is_active", active).Error
}

// Delete hard-deletes a notice.
func (r *NoticeRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Notice{}, "id = ?", id).Error
}
