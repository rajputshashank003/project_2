package repository

import (
	"strings"

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

// ListPaginated returns paginated ID cards ordered by requested_at DESC with optional status and search filters.
func (r *IDCardRepository) ListPaginated(offset, limit int, status, search string) ([]models.IDCard, int64, error) {
	var cards []models.IDCard
	var total int64

	query := r.db.Model(&models.IDCard{})
	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}
	if search != "" {
		s := "%" + strings.ToLower(strings.TrimSpace(search)) + "%"
		query = query.Where("LOWER(user_name) LIKE ? OR phone LIKE ? OR LOWER(email) LIKE ? OR LOWER(unique_card_number) LIKE ? OR LOWER(designation) LIKE ?", s, s, s, s, s)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("requested_at DESC").Offset(offset).Limit(limit).Find(&cards).Error; err != nil {
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

// ListByUserID returns paginated ID cards for a specific user ordered by requested_at DESC.
func (r *IDCardRepository) ListByUserID(userID uuid.UUID, offset, limit int) ([]models.IDCard, int64, error) {
	var cards []models.IDCard
	var total int64

	if err := r.db.Model(&models.IDCard{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := r.db.Where("user_id = ?", userID).Order("requested_at DESC").Offset(offset).Limit(limit).Find(&cards).Error; err != nil {
		return nil, 0, err
	}
	return cards, total, nil
}

// Begin starts a DB transaction.
func (r *IDCardRepository) Begin() *gorm.DB {
	return r.db.Begin()
}

// IDCardStats contains global database-wide ID card metrics.
type IDCardStats struct {
	Total    int64 `json:"total"`
	Pending  int64 `json:"pending"`
	Approved int64 `json:"approved"`
	Rejected int64 `json:"rejected"`
}

// GetStats returns global database-wide ID card counts in a single query.
func (r *IDCardRepository) GetStats() (IDCardStats, error) {
	var stats IDCardStats
	row := r.db.Raw(`
		SELECT 
			COUNT(*) as total,
			COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
			COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
			COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
		FROM id_cards
	`).Row()
	err := row.Scan(&stats.Total, &stats.Pending, &stats.Approved, &stats.Rejected)
	return stats, err
}
