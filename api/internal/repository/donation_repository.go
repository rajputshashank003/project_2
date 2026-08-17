package repository

import (
	"strings"

	"github.com/google/uuid"
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"gorm.io/gorm"
)

// DonationRepository handles all DB operations for donations.
type DonationRepository struct {
	db *gorm.DB
}

// NewDonationRepository constructs a DonationRepository.
func NewDonationRepository(db *gorm.DB) *DonationRepository {
	return &DonationRepository{db: db}
}

// Create inserts a new donation record.
func (r *DonationRepository) Create(d *models.Donation) error {
	return r.db.Create(d).Error
}

// FindByID returns a donation by UUID.
func (r *DonationRepository) FindByID(id uuid.UUID) (*models.Donation, error) {
	var d models.Donation
	err := r.db.First(&d, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &d, nil
}

// ListPaginated returns paginated donations ordered by requested_at DESC with optional status and search filters.
func (r *DonationRepository) ListPaginated(offset, limit int, status, search string) ([]models.Donation, int64, error) {
	var donations []models.Donation
	var total int64

	query := r.db.Model(&models.Donation{})
	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}
	if search != "" {
		s := "%" + strings.ToLower(strings.TrimSpace(search)) + "%"
		query = query.Where("LOWER(donor_name) LIKE ? OR phone LIKE ? OR LOWER(email) LIKE ? OR LOWER(utr_number) LIKE ? OR LOWER(certificate_number) LIKE ?", s, s, s, s, s)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("requested_at DESC").Offset(offset).Limit(limit).Find(&donations).Error; err != nil {
		return nil, 0, err
	}
	return donations, total, nil
}

// UpdateStatus applies status, certificate_number, reviewed_at, reviewed_by inside
// the provided transaction (tx). Pass r.db for non-transactional use.
func (r *DonationRepository) UpdateStatus(tx *gorm.DB, id uuid.UUID, updates map[string]interface{}) error {
	return tx.Model(&models.Donation{}).Where("id = ?", id).Updates(updates).Error
}

// IsCertNumberTaken checks if a certificate_number is already in use.
func (r *DonationRepository) IsCertNumberTaken(number string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Donation{}).Where("certificate_number = ?", number).Count(&count).Error
	return count > 0, err
}

// ListByUserID returns paginated donations for a specific user ordered by requested_at DESC.
func (r *DonationRepository) ListByUserID(userID uuid.UUID, offset, limit int) ([]models.Donation, int64, error) {
	var donations []models.Donation
	var total int64

	if err := r.db.Model(&models.Donation{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := r.db.Where("user_id = ?", userID).Order("requested_at DESC").Offset(offset).Limit(limit).Find(&donations).Error; err != nil {
		return nil, 0, err
	}
	return donations, total, nil
}

// Begin starts a DB transaction.
func (r *DonationRepository) Begin() *gorm.DB {
	return r.db.Begin()
}

// DonationStats contains global database-wide donation metrics.
type DonationStats struct {
	Total          int64   `json:"total"`
	Pending        int64   `json:"pending"`
	Approved       int64   `json:"approved"`
	Rejected       int64   `json:"rejected"`
	TotalCollected float64 `json:"totalCollected"`
}

// GetStats returns global database-wide donation counts and total collected amount in a single query.
func (r *DonationRepository) GetStats() (DonationStats, error) {
	var stats DonationStats
	row := r.db.Raw(`
		SELECT 
			COUNT(*) as total,
			COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
			COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
			COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
			COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as total_collected
		FROM donations
	`).Row()
	err := row.Scan(&stats.Total, &stats.Pending, &stats.Approved, &stats.Rejected, &stats.TotalCollected)
	return stats, err
}
