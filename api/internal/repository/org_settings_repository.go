package repository

import (
	"encoding/json"

	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// OrgSettingsRepository handles all DB operations for org_settings.
// Each row represents a setting with its Key, Value, and JSONB Meta column.
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

// Get fetches a single setting by key, including its Value and Meta.
func (r *OrgSettingsRepository) Get(key string) (*models.OrgSetting, error) {
	var row models.OrgSetting
	if err := r.db.Where("key = ?", key).First(&row).Error; err != nil {
		return nil, err
	}
	return &row, nil
}

// GetValue returns only the text value of a key, or empty string if not found.
func (r *OrgSettingsRepository) GetValue(key string) (string, error) {
	var row models.OrgSetting
	if err := r.db.Select("value").Where("key = ?", key).First(&row).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", nil
		}
		return "", err
	}
	return row.Value, nil
}

// Set upserts a single key-value pair. Does not overwrite existing meta on conflict.
func (r *OrgSettingsRepository) Set(key, value string) error {
	row := models.OrgSetting{Key: key, Value: value}
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "key"}},
		DoUpdates: clause.AssignmentColumns([]string{"value", "updated_at"}),
	}).Create(&row).Error
}

// SetWithMeta upserts a key, its value, and its JSONB meta column.
func (r *OrgSettingsRepository) SetWithMeta(key, value string, meta any) error {
	var metaBytes []byte
	if meta != nil {
		b, err := json.Marshal(meta)
		if err != nil {
			return err
		}
		metaBytes = b
	} else {
		metaBytes = []byte("{}")
	}

	row := models.OrgSetting{
		Key:   key,
		Value: value,
		Meta:  metaBytes,
	}

	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "key"}},
		DoUpdates: clause.AssignmentColumns([]string{"value", "meta", "updated_at"}),
	}).Create(&row).Error
}

// BulkSet upserts multiple key-value pairs inside a single transaction.
// Preserves existing meta on conflict.
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

// GetAssetMeta returns the CloudinaryAssetMeta stored in the meta column of a given key.
// Returns an empty struct if the row does not exist or meta is empty/unparseable.
func (r *OrgSettingsRepository) GetAssetMeta(key string) (models.CloudinaryAssetMeta, error) {
	row, err := r.Get(key)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return models.CloudinaryAssetMeta{}, nil
		}
		return models.CloudinaryAssetMeta{}, err
	}
	if len(row.Meta) == 0 || string(row.Meta) == "{}" {
		return models.CloudinaryAssetMeta{}, nil
	}
	var meta models.CloudinaryAssetMeta
	if err := json.Unmarshal(row.Meta, &meta); err != nil {
		return models.CloudinaryAssetMeta{}, nil
	}
	return meta, nil
}
