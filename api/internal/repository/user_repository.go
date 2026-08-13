package repository

import (
	"github.com/google/uuid"
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"gorm.io/gorm"
)

// UserRepository handles all DB operations for users.
type UserRepository struct {
	db *gorm.DB
}

// NewUserRepository constructs a UserRepository.
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// FindByPhone returns a user by phone number, or gorm.ErrRecordNotFound.
func (r *UserRepository) FindByPhone(phone string) (*models.User, error) {
	var user models.User
	err := r.db.Where("phone = ?", phone).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByID returns a user by UUID.
func (r *UserRepository) FindByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// Create inserts a new user.
func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// Update saves changes to an existing user.
func (r *UserRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

// ListPaginated returns paginated users ordered by joined_at DESC.
func (r *UserRepository) ListPaginated(offset, limit int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	if err := r.db.Model(&models.User{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := r.db.Order("joined_at DESC").Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return nil, 0, err
	}
	return users, total, nil
}

// SetRole updates a user's role field.
func (r *UserRepository) SetRole(id uuid.UUID, role string) error {
	return r.db.Model(&models.User{}).Where("id = ?", id).Update("role", role).Error
}
