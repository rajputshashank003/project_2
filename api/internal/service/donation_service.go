package service

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/shashankrajput/ngo-platform/api/internal/dto"
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"github.com/shashankrajput/ngo-platform/api/internal/repository"
)

// DonationService handles donation business logic.
type DonationService struct {
	repo       *repository.DonationRepository
	cloudinary *CloudinaryService
	sms        *SMSService
	email      *EmailService
}

// NewDonationService constructs a DonationService.
func NewDonationService(
	repo *repository.DonationRepository,
	cloudinary *CloudinaryService,
	sms *SMSService,
	email *EmailService,
) *DonationService {
	return &DonationService{repo: repo, cloudinary: cloudinary, sms: sms, email: email}
}

// Create creates a donation request. Uploads screenshot to Cloudinary first.
// Uses orphan-protection: if DB write fails, Cloudinary asset is deleted.
func (s *DonationService) Create(ctx context.Context, req dto.CreateDonationRequest) (*models.Donation, error) {
	// Upload payment screenshot to Cloudinary
	result, err := s.cloudinary.Upload(ctx, req.PaymentScreenshotB64)
	if err != nil {
		return nil, fmt.Errorf("donation: screenshot upload failed: %w", err)
	}

	donation := &models.Donation{
		DonorName:            req.DonorName,
		Phone:                req.Phone,
		Email:                req.Email,
		Amount:               req.Amount,
		PaymentScreenshotURL: result.SecureURL,
		UTRNumber:            req.UTRNumber,
		Status:               "pending",
	}

	if err := s.repo.Create(donation); err != nil {
		// Orphan protection: clean up Cloudinary asset
		s.cloudinary.Delete(ctx, result.PublicID)
		return nil, fmt.Errorf("donation: db create failed: %w", err)
	}

	return donation, nil
}

// GetByID returns a donation by ID.
func (s *DonationService) GetByID(id uuid.UUID) (*models.Donation, error) {
	return s.repo.FindByID(id)
}

// List returns paginated donations.
func (s *DonationService) List(page, limit int) ([]models.Donation, int64, error) {
	offset := (page - 1) * limit
	return s.repo.ListPaginated(offset, limit)
}

// UpdateStatus approves or rejects a donation inside a DB transaction.
// On approval: generates a unique certificate number with collision retry.
// Fires SMS + Email asynchronously after commit.
func (s *DonationService) UpdateStatus(ctx context.Context, id uuid.UUID, req dto.UpdateDonationStatusRequest, reviewerName string) (*models.Donation, error) {
	donation, err := s.repo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("donation: not found")
	}

	updates := map[string]interface{}{
		"status":      req.Status,
		"reviewed_at": time.Now(),
		"reviewed_by": reviewerName,
	}

	if req.Status == "rejected" {
		updates["rejection_reason"] = req.RejectionReason
	}

	var certNumber string
	if req.Status == "approved" {
		// Generate unique certificate number with up to 3 collision retries
		certNumber, err = s.generateUniqueCertNumber()
		if err != nil {
			return nil, err
		}
		updates["certificate_number"] = certNumber
	}

	// Wrap in transaction
	tx := s.repo.Begin()
	if err := s.repo.UpdateStatus(tx, id, updates); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("donation: update status failed: %w", err)
	}
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("donation: commit failed: %w", err)
	}

	// Reload updated record
	updated, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Fire notifications asynchronously (failure does not fail the approval)
	go s.notify(donation, req.Status, certNumber)

	return updated, nil
}

func (s *DonationService) generateUniqueCertNumber() (string, error) {
	year := time.Now().Year()
	for i := 0; i < 3; i++ {
		suffix := fmt.Sprintf("%06d", rand.New(rand.NewSource(time.Now().UnixNano())).Intn(1000000))
		number := fmt.Sprintf("CERT-%d-%s", year, suffix)
		taken, err := s.repo.IsCertNumberTaken(number)
		if err != nil {
			return "", fmt.Errorf("donation: cert number check failed: %w", err)
		}
		if !taken {
			return number, nil
		}
	}
	return "", fmt.Errorf("donation: could not generate unique certificate number after 3 attempts")
}

func (s *DonationService) notify(d *models.Donation, status, certNumber string) {
	var userMsg, subject, html string
	if status == "approved" {
		userMsg = fmt.Sprintf("Hi %s, your donation of ₹%.0f has been verified! Certificate No: %s. Login to download.", d.DonorName, d.Amount, certNumber)
		subject = "Donation Receipt Verified — Certificate Issued"
		html = fmt.Sprintf(`<div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
<div style="background:#059669;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
<h2 style="color:#fff;margin:0;">Donation Verified ✓</h2></div>
<p>Dear <strong>%s</strong>,</p>
<p>Your donation of <strong style="color:#059669;">₹%.0f</strong> has been verified.</p>
<p>Certificate No: <strong>%s</strong></p>
<p>Please login to download your certificate. Thank you! 🙏</p></div>`, d.DonorName, d.Amount, certNumber)
	} else {
		userMsg = fmt.Sprintf("Hi %s, your donation receipt for ₹%.0f could not be verified. Please resubmit.", d.DonorName, d.Amount)
		subject = "Donation Receipt — Action Required"
		html = fmt.Sprintf(`<p>Dear %s, your donation receipt for ₹%.0f could not be verified.</p>`, d.DonorName, d.Amount)
	}

	if d.Phone != "" {
		s.sms.Send(d.Phone, userMsg)
	}
	if d.Email != "" {
		s.email.Send(d.Email, subject, html)
	}
	log.Info().Str("donationId", d.ID.String()).Str("status", status).Msg("donation: notifications sent")
}
