package service

import (
	"context"
	"fmt"
	"io"
	"strconv"
	"time"

	"github.com/shashankrajput/ngo-platform/api/internal/dto"
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"github.com/shashankrajput/ngo-platform/api/internal/repository"
)

// NgoService handles NGO/org config business logic.
// Data is stored in org_settings (key-value table); this service maps KV → struct.
type NgoService struct {
	repo      *repository.OrgSettingsRepository
	cloudinary *CloudinaryService
}

// NewNgoService constructs a NgoService.
func NewNgoService(repo *repository.OrgSettingsRepository, cloudinary *CloudinaryService) *NgoService {
	return &NgoService{repo: repo, cloudinary: cloudinary}
}

// Get returns the NGO config as a structured response by reading all KV rows.
func (s *NgoService) Get() (*models.NgoConfigResponse, error) {
	kvMap, err := s.repo.GetAll()
	if err != nil {
		return nil, err
	}
	return s.kvToResponse(kvMap), nil
}

// Update partially updates the org config. Uploads new logo/signature files to Cloudinary
// and deletes old assets if replaced or removed. Returns the updated config.
func (s *NgoService) Update(ctx context.Context, req dto.UpdateNgoConfigRequest, logoFile io.Reader, signatureFile io.Reader) (*models.NgoConfigResponse, error) {
	updates := map[string]string{
		// always touch updated_at indirectly via BulkSet's updated_at column
	}

	// --- Scalar fields ---
	if req.Name != nil {
		updates[models.OrgKeyName] = *req.Name
	}
	if req.Tagline != nil {
		updates[models.OrgKeyTagline] = *req.Tagline
	}
	if req.Address != nil {
		updates[models.OrgKeyAddress] = *req.Address
	}
	if req.Phone != nil {
		updates[models.OrgKeyPhone] = *req.Phone
	}
	if req.Email != nil {
		updates[models.OrgKeyEmail] = *req.Email
	}
	if req.Website != nil {
		updates[models.OrgKeyWebsite] = *req.Website
	}
	if req.RegistrationNumber != nil {
		updates[models.OrgKeyRegistrationNumber] = *req.RegistrationNumber
	}
	if req.UPIID != nil {
		updates[models.OrgKeyUPIID] = *req.UPIID
	}
	if req.UPIName != nil {
		updates[models.OrgKeyUPIName] = *req.UPIName
	}
	if req.BankName != nil {
		updates[models.OrgKeyBankName] = *req.BankName
	}
	if req.AccountNumber != nil {
		updates[models.OrgKeyAccountNumber] = *req.AccountNumber
	}
	if req.IFSCCode != nil {
		updates[models.OrgKeyIFSCCode] = *req.IFSCCode
	}
	if req.AccountHolderName != nil {
		updates[models.OrgKeyAccountHolderName] = *req.AccountHolderName
	}
	if req.PresidentName != nil {
		updates[models.OrgKeyPresidentName] = *req.PresidentName
	}
	if req.SecretaryName != nil {
		updates[models.OrgKeySecretaryName] = *req.SecretaryName
	}
	if req.FoundedYear != nil {
		updates[models.OrgKeyFoundedYear] = strconv.Itoa(*req.FoundedYear)
	}
	if req.Description != nil {
		updates[models.OrgKeyDescription] = *req.Description
	}
	if req.Mission != nil {
		updates[models.OrgKeyMission] = *req.Mission
	}
	if req.Vision != nil {
		updates[models.OrgKeyVision] = *req.Vision
	}
	if req.ManagerPhone != nil {
		updates[models.OrgKeyManagerPhone] = *req.ManagerPhone
	}

	// --- Logo replacement ---
	if logoFile != nil {
		assetMeta, _ := s.repo.GetAssetMeta(models.OrgKeyLogoURL)
		if assetMeta.CloudinaryPublicID != "" {
			s.cloudinary.Delete(ctx, assetMeta.CloudinaryPublicID)
		}
		uploadResult, err := s.cloudinary.UploadFile(ctx, logoFile)
		if err != nil {
			return nil, fmt.Errorf("ngo: logo upload failed: %w", err)
		}
		newMeta := models.CloudinaryAssetMeta{CloudinaryPublicID: uploadResult.PublicID}
		if err := s.repo.SetWithMeta(models.OrgKeyLogoURL, uploadResult.SecureURL, newMeta); err != nil {
			return nil, fmt.Errorf("ngo: logo update failed: %w", err)
		}
	} else if req.RemoveLogo != nil && *req.RemoveLogo {
		assetMeta, _ := s.repo.GetAssetMeta(models.OrgKeyLogoURL)
		if assetMeta.CloudinaryPublicID != "" {
			s.cloudinary.Delete(ctx, assetMeta.CloudinaryPublicID)
		}
		if err := s.repo.SetWithMeta(models.OrgKeyLogoURL, "", models.CloudinaryAssetMeta{}); err != nil {
			return nil, fmt.Errorf("ngo: logo removal failed: %w", err)
		}
	}

	// --- Signature replacement ---
	if signatureFile != nil {
		assetMeta, _ := s.repo.GetAssetMeta(models.OrgKeySignatureURL)
		if assetMeta.CloudinaryPublicID != "" {
			s.cloudinary.Delete(ctx, assetMeta.CloudinaryPublicID)
		}
		uploadResult, err := s.cloudinary.UploadFile(ctx, signatureFile)
		if err != nil {
			return nil, fmt.Errorf("ngo: signature upload failed: %w", err)
		}
		newMeta := models.CloudinaryAssetMeta{CloudinaryPublicID: uploadResult.PublicID}
		if err := s.repo.SetWithMeta(models.OrgKeySignatureURL, uploadResult.SecureURL, newMeta); err != nil {
			return nil, fmt.Errorf("ngo: signature update failed: %w", err)
		}
	} else if req.RemoveSignature != nil && *req.RemoveSignature {
		assetMeta, _ := s.repo.GetAssetMeta(models.OrgKeySignatureURL)
		if assetMeta.CloudinaryPublicID != "" {
			s.cloudinary.Delete(ctx, assetMeta.CloudinaryPublicID)
		}
		if err := s.repo.SetWithMeta(models.OrgKeySignatureURL, "", models.CloudinaryAssetMeta{}); err != nil {
			return nil, fmt.Errorf("ngo: signature removal failed: %w", err)
		}
	}

	if len(updates) > 0 {
		if err := s.repo.BulkSet(updates); err != nil {
			return nil, fmt.Errorf("ngo: update failed: %w", err)
		}
	}

	return s.Get()
}

// kvToResponse maps the raw KV map from org_settings into a NgoConfigResponse struct.
// Missing keys default to zero values (empty string / 0).
func (s *NgoService) kvToResponse(kv map[string]string) *models.NgoConfigResponse {
	foundedYear, _ := strconv.Atoi(kv[models.OrgKeyFoundedYear])
	return &models.NgoConfigResponse{
		Name:               kv[models.OrgKeyName],
		Tagline:            kv[models.OrgKeyTagline],
		LogoURL:            kv[models.OrgKeyLogoURL],
		Address:            kv[models.OrgKeyAddress],
		Phone:              kv[models.OrgKeyPhone],
		Email:              kv[models.OrgKeyEmail],
		Website:            kv[models.OrgKeyWebsite],
		RegistrationNumber: kv[models.OrgKeyRegistrationNumber],
		UPIID:              kv[models.OrgKeyUPIID],
		UPIName:            kv[models.OrgKeyUPIName],
		BankName:           kv[models.OrgKeyBankName],
		AccountNumber:      kv[models.OrgKeyAccountNumber],
		IFSCCode:           kv[models.OrgKeyIFSCCode],
		AccountHolderName:  kv[models.OrgKeyAccountHolderName],
		SignatureURL:       kv[models.OrgKeySignatureURL],
		PresidentName:      kv[models.OrgKeyPresidentName],
		SecretaryName:      kv[models.OrgKeySecretaryName],
		FoundedYear:        foundedYear,
		Description:        kv[models.OrgKeyDescription],
		Mission:            kv[models.OrgKeyMission],
		Vision:             kv[models.OrgKeyVision],
		ManagerPhone:       kv[models.OrgKeyManagerPhone],
		UpdatedAt:          time.Now(), // approximate; real per-key updated_at not surfaced
	}
}
