package repository

import (
	"encoding/json"

	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// OrgSettingsRepository handles all DB operations for org_settings.
// The table is a flexible key-value store; see models.OrgSetting for key constants.
type OrgSettingsRepository struct {
	db *gorm.DB
}

// NewOrgSettingsRepository constructs an OrgSettingsRepository.
func NewOrgSettingsRepository(db *gorm.DB) *OrgSettingsRepository {
	return &OrgSettingsRepository{db: db}
}

// GetAll fetches all rows and returns them as a key→value map.
func (r *OrgSettingsRepository) GetAll() (map[string]string, error) {
	var rows []models.OrgSetting
	if err := r.db.Find(&rows).Error; err != nil {
		return nil, err
	}
	result := make(map[string]string, len(rows))
	for _, row := range rows {
		result[row.Key] = row.Value
	}
	return result, nil
}

// Set upserts a single key-value pair.
func (r *OrgSettingsRepository) Set(key, value string) error {
	row := models.OrgSetting{Key: key, Value: value}
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "key"}},
		DoUpdates: clause.AssignmentColumns([]string{"value", "updated_at"}),
	}).Create(&row).Error
}

// BulkSet upserts multiple key-value pairs inside a single transaction.
func (r *OrgSettingsRepository) BulkSet(updates map[string]string) error {
	if len(updates) == 0 {
		return nil
	}
	rows := make([]models.OrgSetting, 0, len(updates))
	for k, v := range updates {
		rows = append(rows, models.OrgSetting{Key: k, Value: v})
	}
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "key"}},
		DoUpdates: clause.AssignmentColumns([]string{"value", "updated_at"}),
	}).Create(&rows).Error
}

// GetMeta returns the deserialized OrgMetaJSON stored under the "meta" key.
// Returns an empty struct (not an error) if the meta key does not exist yet.
func (r *OrgSettingsRepository) GetMeta() (models.OrgMetaJSON, error) {
	var row models.OrgSetting
	result := r.db.Where("key = ?", models.OrgKeyMeta).First(&row)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return models.OrgMetaJSON{}, nil
		}
		return models.OrgMetaJSON{}, result.Error
	}
	var meta models.OrgMetaJSON
	if err := json.Unmarshal([]byte(row.Value), &meta); err != nil {
		// Corrupted JSON — return empty but don't fail
		return models.OrgMetaJSON{}, nil
	}
	return meta, nil
}

// SetMeta serializes the given OrgMetaJSON and upserts it under the "meta" key.
func (r *OrgSettingsRepository) SetMeta(meta models.OrgMetaJSON) error {
	b, err := json.Marshal(meta)
	if err != nil {
		return err
	}
	return r.Set(models.OrgKeyMeta, string(b))
}
