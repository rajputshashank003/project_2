package service

import (
	"context"
	"fmt"
	"io"
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
	orgRepo    *repository.OrgSettingsRepository
	cloudinary *CloudinaryService
	messenger  Messenger
	email      *EmailService
	appBaseURL string
}

// NewDonationService constructs a DonationService.
func NewDonationService(
	repo *repository.DonationRepository,
	orgRepo *repository.OrgSettingsRepository,
	cloudinary *CloudinaryService,
	messenger Messenger,
	email *EmailService,
	appBaseURL string,
) *DonationService {
	return &DonationService{
		repo:       repo,
		orgRepo:    orgRepo,
		cloudinary: cloudinary,
		messenger:  messenger,
		email:      email,
		appBaseURL: appBaseURL,
	}
}

// Create creates a donation request linked to the given userID.
// Streams the payment screenshot to Cloudinary. Orphan-protection applied on DB error.
func (s *DonationService) Create(ctx context.Context, userID uuid.UUID, req dto.CreateDonationRequest, file io.Reader) (*models.Donation, error) {
	// Upload payment screenshot to Cloudinary
	result, err := s.cloudinary.UploadFile(ctx, file)
	if err != nil {
		return nil, fmt.Errorf("donation: screenshot upload failed: %w", err)
	}

	var utrPtr *string
	if req.UTRNumber != "" {
		utrPtr = &req.UTRNumber
	}

	donation := &models.Donation{
		UserID:               &userID,
		DonorName:            req.DonorName,
		Phone:                req.Phone,
		Email:                req.Email,
		Amount:               req.Amount,
		PaymentScreenshotURL: result.SecureURL,
		UTRNumber:            utrPtr,
		Status:               "pending",
	}

	if err := s.repo.Create(donation); err != nil {
		// Orphan protection: clean up Cloudinary asset
		s.cloudinary.Delete(ctx, result.PublicID)
		return nil, fmt.Errorf("donation: db create failed: %w", err)
	}

	// Asynchronously notify manager of new donation request
	go s.notifyManagerNewDonation(donation)

	return donation, nil
}

// GetByID returns a donation by ID.
func (s *DonationService) GetByID(id uuid.UUID) (*models.Donation, error) {
	return s.repo.FindByID(id)
}

// List returns paginated donations (admin — all users).
func (s *DonationService) List(page, limit int) ([]models.Donation, int64, error) {
	offset := (page - 1) * limit
	return s.repo.ListPaginated(offset, limit)
}

// ListByUser returns paginated donations for a specific user.
func (s *DonationService) ListByUser(userID uuid.UUID, page, limit int) ([]models.Donation, int64, error) {
	offset := (page - 1) * limit
	return s.repo.ListByUserID(userID, offset, limit)
}

// UpdateStatus approves or rejects a donation inside a DB transaction.
// On approval: generates a unique certificate number with collision retry.
// Fires SMS + Email asynchronously after commit.
func (s *DonationService) UpdateStatus(ctx context.Context, id uuid.UUID, req dto.UpdateDonationStatusRequest, reviewerName string) (*models.Donation, error) {
	donation, err := s.repo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("donation: not found")
	}

	// Idempotency guard: if already in this status, return early without re-notifying.
	if donation.Status == req.Status {
		return donation, nil
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
	baseURL := s.appBaseURL
	var userMsg, subject, html string
	if status == "approved" {
		certLink := fmt.Sprintf("%s/certificate/%s", baseURL, d.ID.String())
		userMsg = fmt.Sprintf(
			"✅ Hi %s, your donation of ₹%.0f has been verified!\nCertificate No: %s\nDownload it here: %s",
			d.DonorName, d.Amount, certNumber, certLink,
		)
		subject = "Donation Receipt Verified — Certificate Issued"
		html = fmt.Sprintf(`<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;">
<div style="background:#059669;padding:20px 24px;border-radius:12px 12px 0 0;">
  <h2 style="color:#fff;margin:0;font-size:20px;">✅ Donation Verified</h2>
</div>
<div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;">
  <p style="color:#334155;margin-top:0;">Dear <strong>%s</strong>,</p>
  <p style="color:#334155;">Your donation of <strong style="color:#059669;font-size:18px;">₹%.0f</strong> has been <strong style="color:#059669;">verified</strong>.</p>
  <p style="color:#334155;">Certificate No: <strong style="font-family:monospace;">%s</strong></p>
  <div style="text-align:center;margin:24px 0;">
    <a href="%s" style="display:inline-block;background:#059669;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">View &amp; Download Certificate →</a>
  </div>
  <p style="color:#64748b;font-size:13px;">If the button doesn't work, copy this link: <a href="%s" style="color:#059669;">%s</a></p>
  <p style="color:#334155;font-size:13px;">Thank you for your generous support! 🙏</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
  <p style="color:#94a3b8;font-size:12px;text-align:center;">NGO Platform — <a href="%s" style="color:#059669;">%s</a></p>
</div>
</div>`,
			d.DonorName, d.Amount, certNumber, certLink, certLink, certLink,
			baseURL, baseURL,
		)
	} else {
		userMsg = fmt.Sprintf(
			"Hi %s, your donation receipt for ₹%.0f could not be verified. Please resubmit at %s",
			d.DonorName, d.Amount, baseURL,
		)
		subject = "Donation Receipt — Action Required"
		html = fmt.Sprintf(`<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
<p>Dear <strong>%s</strong>,</p>
<p>Your donation receipt for <strong>₹%.0f</strong> could not be verified. Please <a href="%s">resubmit here</a>.</p>
</div>`, d.DonorName, d.Amount, baseURL)
	}

	if d.Phone != "" {
		s.messenger.Send(d.Phone, userMsg)
	}
	if d.Email != "" {
		s.email.Send(d.Email, subject, html)
	}
	log.Info().Str("donationId", d.ID.String()).Str("status", status).Msg("donation: notifications sent")
}

func (s *DonationService) notifyManagerNewDonation(d *models.Donation) {
	if s.orgRepo == nil {
		return
	}
	managerPhone, err := s.orgRepo.GetValue(models.OrgKeyManagerPhone)
	if err != nil || managerPhone == "" {
		return
	}

	utr := "N/A"
	if d.UTRNumber != nil && *d.UTRNumber != "" {
		utr = *d.UTRNumber
	}

	adminLink := fmt.Sprintf("%s/admin/request/donation", s.appBaseURL)
	msg := fmt.Sprintf(
		"New Donation Request Received\n\nDonor: %s\nAmount: INR %.0f\nPhone: %s\nUTR: %s\n\nReview in Admin Panel:\n%s",
		d.DonorName,
		d.Amount,
		d.Phone,
		utr,
		adminLink,
	)

	s.messenger.Send(managerPhone, msg)
	log.Info().Str("managerPhone", managerPhone).Str("donationId", d.ID.String()).Msg("donation: manager notified")
}
