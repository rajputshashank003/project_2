package service

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/shashankrajput/ngo-platform/api/internal/dto"
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"github.com/shashankrajput/ngo-platform/api/internal/repository"
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
// UpdateSlot updates name, designation, and optional photo for a team slot.
// Deletes old Cloudinary photo if replacing.
func (s *TeamService) UpdateSlot(ctx context.Context, slot int, req dto.UpdateTeamMemberRequest, file io.Reader) (*models.TeamMember, error) {
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

	if file != nil {
		// Delete old Cloudinary asset
		if member.CloudinaryID != "" {
			s.cloudinary.Delete(ctx, member.CloudinaryID)
		}
		result, err := s.cloudinary.UploadFile(ctx, file)
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
// Returns the cleared TeamMember so the caller can update UI state.
func (s *TeamService) ClearSlot(ctx context.Context, slot int) (*models.TeamMember, error) {
	member, err := s.repo.FindBySlot(slot)
	if err != nil {
		return nil, fmt.Errorf("team: slot %d not found", slot)
	}
	if member.CloudinaryID != "" {
		s.cloudinary.Delete(ctx, member.CloudinaryID)
	}
	if err := s.repo.Clear(slot); err != nil {
		return nil, fmt.Errorf("team: clear slot failed: %w", err)
	}
	// Reload cleared member from DB
	cleared, err := s.repo.FindBySlot(slot)
	if err != nil {
		return nil, fmt.Errorf("team: reload after clear failed: %w", err)
	}
	return cleared, nil
}

// AddSlot adds a new slot (max 5).
// Returns the full updated team list so the caller can re-sync UI state.
func (s *TeamService) AddSlot() ([]models.TeamMember, error) {
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

	// Return the full updated list so the frontend can replace its state
	return s.repo.ListAll()
}

// RemoveSlot deletes a slot, cleans Cloudinary, and re-indexes remaining slots.
// Returns the full updated team list so the caller can re-sync UI state.
func (s *TeamService) RemoveSlot(ctx context.Context, slot int) ([]models.TeamMember, error) {
	member, err := s.repo.FindBySlot(slot)
	if err != nil {
		return nil, fmt.Errorf("team: slot %d not found", slot)
	}
	if member.CloudinaryID != "" {
		s.cloudinary.Delete(ctx, member.CloudinaryID)
	}
	if err := s.repo.DeleteSlot(slot); err != nil {
		return nil, fmt.Errorf("team: delete slot failed: %w", err)
	}
	if err := s.repo.ReindexSlots(); err != nil {
		return nil, fmt.Errorf("team: reindex failed: %w", err)
	}

	// Return the full updated list so the frontend can replace its state
	return s.repo.ListAll()
}
