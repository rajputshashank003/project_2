package repository

import (
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// NgoRepository handles DB operations for ngo_config (single row).
type NgoRepository struct {
	db *gorm.DB
}

// NewNgoRepository constructs a NgoRepository.
func NewNgoRepository(db *gorm.DB) *NgoRepository {
	return &NgoRepository{db: db}
}

// Get returns the single ngo_config row (id = 1).
func (r *NgoRepository) Get() (*models.NgoConfig, error) {
	var cfg models.NgoConfig
	err := r.db.First(&cfg, "id = ?", 1).Error
	if err != nil {
		return nil, err
	}
	return &cfg, nil
}

// Update partially updates ngo_config (id = 1) with the given map of fields.
func (r *NgoRepository) Update(updates map[string]interface{}) error {
	updates["id"] = 1
	return r.db.Model(&models.NgoConfig{}).
		Clauses(clause.OnConflict{UpdateAll: true}).
		Where("id = ?", 1).
		Updates(updates).Error
}
