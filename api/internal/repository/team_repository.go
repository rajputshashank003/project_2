package repository

import (
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"gorm.io/gorm"
)

// TeamRepository handles DB operations for team_members.
type TeamRepository struct {
	db *gorm.DB
}

// NewTeamRepository constructs a TeamRepository.
func NewTeamRepository(db *gorm.DB) *TeamRepository {
	return &TeamRepository{db: db}
}

// ListAll returns all team members ordered by slot.
func (r *TeamRepository) ListAll() ([]models.TeamMember, error) {
	var members []models.TeamMember
	err := r.db.Order("slot ASC").Find(&members).Error
	return members, err
}

// FindBySlot returns a team member by slot number.
func (r *TeamRepository) FindBySlot(slot int) (*models.TeamMember, error) {
	var m models.TeamMember
	err := r.db.First(&m, "slot = ?", slot).Error
	if err != nil {
		return nil, err
	}
	return &m, nil
}

// Upsert saves a team member (creates or updates by slot primary key).
func (r *TeamRepository) Upsert(m *models.TeamMember) error {
	return r.db.Save(m).Error
}

// Clear resets name, designation, photo_url, cloudinary_id for a slot.
func (r *TeamRepository) Clear(slot int) error {
	return r.db.Model(&models.TeamMember{}).Where("slot = ?", slot).Updates(map[string]interface{}{
		"name":          "",
		"designation":   "",
		"photo_url":     "",
		"cloudinary_id": "",
	}).Error
}

// MaxSlot returns the current highest slot number.
func (r *TeamRepository) MaxSlot() (int, error) {
	var max int
	err := r.db.Model(&models.TeamMember{}).Select("COALESCE(MAX(slot), 0)").Scan(&max).Error
	return max, err
}

// Count returns total number of slots.
func (r *TeamRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&models.TeamMember{}).Count(&count).Error
	return count, err
}

// DeleteSlot removes a slot row.
func (r *TeamRepository) DeleteSlot(slot int) error {
	return r.db.Delete(&models.TeamMember{}, "slot = ?", slot).Error
}

// ReindexSlots re-numbers all slots sequentially after a deletion.
// It loads all slots ordered, then reassigns 1..N.
func (r *TeamRepository) ReindexSlots() error {
	var members []models.TeamMember
	if err := r.db.Order("slot ASC").Find(&members).Error; err != nil {
		return err
	}
	for i, m := range members {
		newSlot := i + 1
		if m.Slot != newSlot {
			if err := r.db.Model(&models.TeamMember{}).Where("slot = ?", m.Slot).Update("slot", newSlot).Error; err != nil {
				return err
			}
		}
	}
	return nil
}
