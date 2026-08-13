package repository

import (
	"github.com/google/uuid"
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"gorm.io/gorm"
)

// IDCardRepository handles all DB operations for id_cards.
type IDCardRepository struct {
	db *gorm.DB
}

// NewIDCardRepository constructs an IDCardRepository.
func NewIDCardRepository(db *gorm.DB) *IDCardRepository {
	return &IDCardRepository{db: db}
}

// Create inserts a new ID card record.
func (r *IDCardRepository) Create(c *models.IDCard) error {
	return r.db.Create(c).Error
}

// FindByID returns an ID card by UUID.
func (r *IDCardRepository) FindByID(id uuid.UUID) (*models.IDCard, error) {
	var c models.IDCard
	err := r.db.First(&c, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &c, nil
}

// ListPaginated returns paginated ID cards ordered by requested_at DESC.
func (r *IDCardRepository) ListPaginated(offset, limit int) ([]models.IDCard, int64, error) {
	var cards []models.IDCard
	var total int64

	if err := r.db.Model(&models.IDCard{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := r.db.Order("requested_at DESC").Offset(offset).Limit(limit).Find(&cards).Error; err != nil {
		return nil, 0, err
	}
	return cards, total, nil
}

// UpdateStatus applies status and related fields inside the provided tx.
func (r *IDCardRepository) UpdateStatus(tx *gorm.DB, id uuid.UUID, updates map[string]interface{}) error {
	return tx.Model(&models.IDCard{}).Where("id = ?", id).Updates(updates).Error
}

// IsCardNumberTaken checks if a unique_card_number is already in use.
func (r *IDCardRepository) IsCardNumberTaken(number string) (bool, error) {
	var count int64
	err := r.db.Model(&models.IDCard{}).Where("unique_card_number = ?", number).Count(&count).Error
	return count > 0, err
}

// Begin starts a DB transaction.
func (r *IDCardRepository) Begin() *gorm.DB {
	return r.db.Begin()
}
