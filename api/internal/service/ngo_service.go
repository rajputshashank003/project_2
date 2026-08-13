package service

import (
	"context"
	"fmt"
	"time"

	"github.com/shashankrajput/ngo-platform/api/internal/dto"
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"github.com/shashankrajput/ngo-platform/api/internal/repository"
)

// NgoService handles NGO config business logic.
type NgoService struct {
	repo       *repository.NgoRepository
	cloudinary *CloudinaryService
}

// NewNgoService constructs a NgoService.
func NewNgoService(repo *repository.NgoRepository, cloudinary *CloudinaryService) *NgoService {
	return &NgoService{repo: repo, cloudinary: cloudinary}
}

// Get returns the NGO config.
func (s *NgoService) Get() (*models.NgoConfig, error) {
	return s.repo.Get()
}

// Update partially updates the NGO config. Uploads new logo/signature to Cloudinary
// and deletes the old one if replaced.
func (s *NgoService) Update(ctx context.Context, req dto.UpdateNgoConfigRequest) (*models.NgoConfig, error) {
	current, err := s.repo.Get()
	if err != nil {
		return nil, fmt.Errorf("ngo: config not found")
	}

	updates := map[string]interface{}{"updated_at": time.Now()}

	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Tagline != nil {
		updates["tagline"] = *req.Tagline
	}
	if req.Address != nil {
		updates["address"] = *req.Address
	}
	if req.Phone != nil {
		updates["phone"] = *req.Phone
	}
	if req.Email != nil {
		updates["email"] = *req.Email
	}
	if req.Website != nil {
		updates["website"] = *req.Website
	}
	if req.RegistrationNumber != nil {
		updates["registration_number"] = *req.RegistrationNumber
	}
	if req.UPIID != nil {
		updates["upi_id"] = *req.UPIID
	}
	if req.UPIName != nil {
		updates["upi_name"] = *req.UPIName
	}
	if req.BankName != nil {
		updates["bank_name"] = *req.BankName
	}
	if req.AccountNumber != nil {
		updates["account_number"] = *req.AccountNumber
	}
	if req.IFSCCode != nil {
		updates["ifsc_code"] = *req.IFSCCode
	}
	if req.AccountHolderName != nil {
		updates["account_holder_name"] = *req.AccountHolderName
	}
	if req.PresidentName != nil {
		updates["president_name"] = *req.PresidentName
	}
	if req.SecretaryName != nil {
		updates["secretary_name"] = *req.SecretaryName
	}
	if req.FoundedYear != nil {
		updates["founded_year"] = *req.FoundedYear
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}

	// Logo replacement
	if req.LogoB64 != nil && *req.LogoB64 != "" {
		if current.LogoCloudinaryID != "" {
			s.cloudinary.Delete(ctx, current.LogoCloudinaryID)
		}
		result, err := s.cloudinary.Upload(ctx, *req.LogoB64)
		if err != nil {
			return nil, fmt.Errorf("ngo: logo upload failed: %w", err)
		}
		updates["logo_url"] = result.SecureURL
		updates["logo_cloudinary_id"] = result.PublicID
	}

	// Signature replacement
	if req.SignatureB64 != nil && *req.SignatureB64 != "" {
		if current.SignatureCloudinaryID != "" {
			s.cloudinary.Delete(ctx, current.SignatureCloudinaryID)
		}
		result, err := s.cloudinary.Upload(ctx, *req.SignatureB64)
		if err != nil {
			return nil, fmt.Errorf("ngo: signature upload failed: %w", err)
		}
		updates["signature_url"] = result.SecureURL
		updates["signature_cloudinary_id"] = result.PublicID
	}

	if err := s.repo.Update(updates); err != nil {
		return nil, fmt.Errorf("ngo: update failed: %w", err)
	}

	return s.repo.Get()
}
