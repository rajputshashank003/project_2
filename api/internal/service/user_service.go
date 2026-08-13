package service

import (
	"fmt"

	"github.com/google/uuid"
	"github.com/shashankrajput/ngo-platform/api/internal/dto"
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"github.com/shashankrajput/ngo-platform/api/internal/repository"
)

// UserService handles user business logic.
type UserService struct {
	repo *repository.UserRepository
}

// NewUserService constructs a UserService.
func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

// List returns paginated users.
func (s *UserService) List(page, limit int) ([]models.User, int64, error) {
	offset := (page - 1) * limit
	return s.repo.ListPaginated(offset, limit)
}

// Update partially updates a user's designation, name, email.
func (s *UserService) Update(id uuid.UUID, req dto.UpdateUserRequest) (*models.User, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("user: not found")
	}
	if req.Designation != "" {
		user.Designation = req.Designation
	}
	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if err := s.repo.Update(user); err != nil {
		return nil, fmt.Errorf("user: update failed: %w", err)
	}
	return user, nil
}

// Promote sets a user's role to admin.
func (s *UserService) Promote(adminID, targetID uuid.UUID) error {
	if adminID == targetID {
		return fmt.Errorf("user: cannot modify your own role")
	}
	_, err := s.repo.FindByID(targetID)
	if err != nil {
		return fmt.Errorf("user: not found")
	}
	return s.repo.SetRole(targetID, "admin")
}

// Demote sets a user's role back to user.
func (s *UserService) Demote(adminID, targetID uuid.UUID) error {
	if adminID == targetID {
		return fmt.Errorf("user: cannot modify your own role")
	}
	_, err := s.repo.FindByID(targetID)
	if err != nil {
		return fmt.Errorf("user: not found")
	}
	return s.repo.SetRole(targetID, "user")
}
