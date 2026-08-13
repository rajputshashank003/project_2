package service

import (
	"context"
	"fmt"

	"github.com/shashankrajput/ngo-platform/api/internal/dto"
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"github.com/shashankrajput/ngo-platform/api/internal/repository"
	"time"
)

// TeamService handles team member business logic.
type TeamService struct {
	repo       *repository.TeamRepository
	cloudinary *CloudinaryService
}

// NewTeamService constructs a TeamService.
func NewTeamService(repo *repository.TeamRepository, cloudinary *CloudinaryService) *TeamService {
	return &TeamService{repo: repo, cloudinary: cloudinary}
}

// ListAll returns all team slots.
func (s *TeamService) ListAll() ([]models.TeamMember, error) {
	return s.repo.ListAll()
}

// UpdateSlot updates a team member slot. Uploads photo to Cloudinary if provided.
// Deletes old Cloudinary photo if replacing.
func (s *TeamService) UpdateSlot(ctx context.Context, slot int, req dto.UpdateTeamMemberRequest) (*models.TeamMember, error) {
	member, err := s.repo.FindBySlot(slot)
	if err != nil {
		return nil, fmt.Errorf("team: slot %d not found", slot)
	}

	if req.Name != "" {
		member.Name = req.Name
	}
	if req.Designation != "" {
		member.Designation = req.Designation
	}

	if req.PhotoB64 != "" {
		// Delete old Cloudinary asset
		if member.CloudinaryID != "" {
			s.cloudinary.Delete(ctx, member.CloudinaryID)
		}
		result, err := s.cloudinary.Upload(ctx, req.PhotoB64)
		if err != nil {
			return nil, fmt.Errorf("team: photo upload failed: %w", err)
		}
		member.PhotoURL = result.SecureURL
		member.CloudinaryID = result.PublicID
	}

	member.UpdatedAt = time.Now()
	if err := s.repo.Upsert(member); err != nil {
		return nil, fmt.Errorf("team: update failed: %w", err)
	}

	return member, nil
}

// ClearSlot resets a slot and deletes its Cloudinary photo.
func (s *TeamService) ClearSlot(ctx context.Context, slot int) error {
	member, err := s.repo.FindBySlot(slot)
	if err != nil {
		return fmt.Errorf("team: slot %d not found", slot)
	}
	if member.CloudinaryID != "" {
		s.cloudinary.Delete(ctx, member.CloudinaryID)
	}
	return s.repo.Clear(slot)
}

// AddSlot adds a new slot (max 5).
func (s *TeamService) AddSlot() (*models.TeamMember, error) {
	count, err := s.repo.Count()
	if err != nil {
		return nil, fmt.Errorf("team: count failed: %w", err)
	}
	if count >= 5 {
		return nil, fmt.Errorf("team: maximum 5 slots allowed")
	}

	maxSlot, err := s.repo.MaxSlot()
	if err != nil {
		return nil, fmt.Errorf("team: max slot failed: %w", err)
	}

	newMember := &models.TeamMember{
		Slot:      maxSlot + 1,
		UpdatedAt: time.Now(),
	}
	if err := s.repo.Upsert(newMember); err != nil {
		return nil, fmt.Errorf("team: create slot failed: %w", err)
	}
	return newMember, nil
}

// RemoveSlot deletes a slot, cleans Cloudinary, and re-indexes remaining slots.
func (s *TeamService) RemoveSlot(ctx context.Context, slot int) error {
	member, err := s.repo.FindBySlot(slot)
	if err != nil {
		return fmt.Errorf("team: slot %d not found", slot)
	}
	if member.CloudinaryID != "" {
		s.cloudinary.Delete(ctx, member.CloudinaryID)
	}
	if err := s.repo.DeleteSlot(slot); err != nil {
		return fmt.Errorf("team: delete slot failed: %w", err)
	}
	return s.repo.ReindexSlots()
}
