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

// IDCardService handles ID card business logic.
type IDCardService struct {
	repo       *repository.IDCardRepository
	orgRepo    *repository.OrgSettingsRepository
	cloudinary *CloudinaryService
	messenger  Messenger
	email      *EmailService
	appBaseURL string
}

// NewIDCardService constructs an IDCardService.
func NewIDCardService(
	repo *repository.IDCardRepository,
	orgRepo *repository.OrgSettingsRepository,
	cloudinary *CloudinaryService,
	messenger Messenger,
	email *EmailService,
	appBaseURL string,
) *IDCardService {
	return &IDCardService{
		repo:       repo,
		orgRepo:    orgRepo,
		cloudinary: cloudinary,
		messenger:  messenger,
		email:      email,
		appBaseURL: appBaseURL,
	}
}

// Create uploads images to Cloudinary via streaming then creates an ID card record.
// Orphan protection: if DB fails, Cloudinary assets are deleted.
func (s *IDCardService) Create(ctx context.Context, req dto.CreateIDCardRequest, userID *uuid.UUID, passportFile io.Reader, paymentFile io.Reader) (*models.IDCard, error) {
	passportResult, err := s.cloudinary.UploadFile(ctx, passportFile)
	if err != nil {
		return nil, fmt.Errorf("id_card: passport photo upload failed: %w", err)
	}

	screenshotResult, err := s.cloudinary.UploadFile(ctx, paymentFile)
	if err != nil {
		s.cloudinary.Delete(ctx, passportResult.PublicID)
		return nil, fmt.Errorf("id_card: screenshot upload failed: %w", err)
	}

	card := &models.IDCard{
		UserID:               userID,
		UserName:             req.UserName,
		Phone:                req.Phone,
		Email:                req.Email,
		Address:              req.Address,
		Designation:          req.Designation,
		PassportPhotoURL:     passportResult.SecureURL,
		PaymentScreenshotURL: screenshotResult.SecureURL,
		Status:               "pending",
	}

	if err := s.repo.Create(card); err != nil {
		s.cloudinary.Delete(ctx, passportResult.PublicID)
		s.cloudinary.Delete(ctx, screenshotResult.PublicID)
		return nil, fmt.Errorf("id_card: db create failed: %w", err)
	}

	// Asynchronously notify manager of new ID card request
	go s.notifyManagerNewIDCard(card)

	return card, nil
}

// GetByID returns an ID card by UUID.
func (s *IDCardService) GetByID(id uuid.UUID) (*models.IDCard, error) {
	return s.repo.FindByID(id)
}

// List returns paginated ID cards with optional status and search filters (admin — all users).
func (s *IDCardService) List(page, limit int, status, search string) ([]models.IDCard, int64, error) {
	offset := (page - 1) * limit
	return s.repo.ListPaginated(offset, limit, status, search)
}

// GetStats returns global database-wide ID card metrics.
func (s *IDCardService) GetStats() (repository.IDCardStats, error) {
	return s.repo.GetStats()
}

// ListByUser returns paginated ID cards for a specific user.
func (s *IDCardService) ListByUser(userID uuid.UUID, page, limit int) ([]models.IDCard, int64, error) {
	offset := (page - 1) * limit
	return s.repo.ListByUserID(userID, offset, limit)
}

// UpdateStatus approves or rejects an ID card in a DB transaction.
// On approval: generates unique card number, sets issue/expiry dates.
// Fires notifications asynchronously.
func (s *IDCardService) UpdateStatus(ctx context.Context, id uuid.UUID, req dto.UpdateIDCardStatusRequest, reviewerName string) (*models.IDCard, error) {
	card, err := s.repo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("id_card: not found")
	}

	// Idempotency guard: if already in this status, return early without re-notifying.
	if card.Status == req.Status {
		return card, nil
	}

	now := time.Now()
	updates := map[string]interface{}{
		"status":      req.Status,
		"reviewed_at": now,
		"reviewed_by": reviewerName,
	}

	if req.Status == "rejected" {
		updates["rejection_reason"] = req.RejectionReason
	}

	var cardNumber string
	if req.Status == "approved" {
		if req.ValidityYears == nil {
			return nil, fmt.Errorf("id_card: validityYears is required for approval")
		}
		cardNumber, err = s.generateUniqueCardNumber()
		if err != nil {
			return nil, err
		}
		updates["unique_card_number"] = cardNumber
		updates["issue_date"] = now
		updates["validity_years"] = *req.ValidityYears
		if *req.ValidityYears > 0 {
			expiry := now.AddDate(*req.ValidityYears, 0, 0)
			updates["expiry_date"] = expiry
		}
		// If ValidityYears == 0 → Lifetime → expiry_date stays NULL
	}

	tx := s.repo.Begin()
	if err := s.repo.UpdateStatus(tx, id, updates); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("id_card: update status failed: %w", err)
	}
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("id_card: commit failed: %w", err)
	}

	updated, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	go s.notify(card, req.Status, cardNumber)

	return updated, nil
}

func (s *IDCardService) generateUniqueCardNumber() (string, error) {
	year := time.Now().Year()
	for i := 0; i < 3; i++ {
		suffix := fmt.Sprintf("%06d", rand.New(rand.NewSource(time.Now().UnixNano())).Intn(1000000))
		number := fmt.Sprintf("NGO-%d-%s", year, suffix)
		taken, err := s.repo.IsCardNumberTaken(number)
		if err != nil {
			return "", fmt.Errorf("id_card: card number check failed: %w", err)
		}
		if !taken {
			return number, nil
		}
	}
	return "", fmt.Errorf("id_card: could not generate unique card number after 3 attempts")
}

func (s *IDCardService) notify(card *models.IDCard, status, cardNumber string) {
	baseURL := s.appBaseURL
	var userMsg, subject, html string

	ngoName := "Sarv Brahman Ekta Manch"
	if s.orgRepo != nil {
		if name, err := s.orgRepo.GetValue(models.OrgKeyName); err == nil && name != "" {
			ngoName = name
		}
	}

	if status == "approved" {
		cardLink := fmt.Sprintf("%s/id-card/%s", baseURL, card.ID.String())
		userMsg = fmt.Sprintf(
			"✅ Hi %s, your NGO ID Card has been approved!\nCard No: %s\nDownload it here: %s",
			card.UserName, cardNumber, cardLink,
		)
		subject = fmt.Sprintf("NGO ID Card Approved — %s", ngoName)
		html = fmt.Sprintf(`<div style="font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;">
<div style="background:#059669;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;">
  <h2 style="color:#fff;margin:0;font-size:18px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">%s</h2>
</div>
<div style="background:#fff;padding:28px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
  <div style="display:inline-block;background:#d1fae5;color:#065f46;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">
    Approved ✓
  </div>
  <h3 style="color:#0f172a;margin:0 0 16px 0;font-size:20px;font-weight:700;">ID Card Approved</h3>
  <p style="color:#334155;font-size:15px;margin-top:0;">Hi <strong>%s</strong>,</p>
  <p style="color:#334155;font-size:14px;line-height:1.6;">Your NGO ID card request has been <strong style="color:#059669;">approved</strong>.</p>
  <p style="color:#334155;font-size:14px;">Card No: <strong style="font-family:monospace;color:#0f172a;">%s</strong></p>
  <div style="text-align:center;margin:28px 0;">
    <a href="%s" style="display:inline-block;background:#059669;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;box-shadow:0 2px 4px rgba(5,150,105,0.2);">View &amp; Download ID Card →</a>
  </div>
  <p style="color:#64748b;font-size:13px;line-height:1.5;">If the button doesn't work, copy this link: <a href="%s" style="color:#059669;word-break:break-all;">%s</a></p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
  <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">%s — <a href="%s" style="color:#059669;text-decoration:none;">%s</a></p>
</div>
</div>`,
			ngoName, card.UserName, cardNumber, cardLink, cardLink, cardLink,
			ngoName, baseURL, baseURL,
		)
	} else {
		rejectionReason := "Submitted details or photo could not be verified."
		if card.RejectionReason != nil && *card.RejectionReason != "" {
			rejectionReason = *card.RejectionReason
		}
		reapplyLink := fmt.Sprintf("%s/id-card/generate", baseURL)

		userMsg = fmt.Sprintf(
			"Hi %s, your NGO ID card request has been declined.\nReason: %s\nPlease reapply at %s",
			card.UserName, rejectionReason, reapplyLink,
		)
		subject = fmt.Sprintf("NGO ID Card Request Update — %s", ngoName)
		html = fmt.Sprintf(`<div style="font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;">
<div style="background:#065f46;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;">
  <h2 style="color:#ffffff;margin:0;font-size:18px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">%s</h2>
</div>
<div style="background:#ffffff;padding:28px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
  <div style="display:inline-block;background:#fee2e2;color:#dc2626;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">
    Application Update
  </div>
  <h3 style="color:#0f172a;margin:0 0 16px 0;font-size:20px;font-weight:700;">ID Card Request Declined</h3>
  <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 12px 0;">Hi <strong>%s</strong>,</p>
  <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px 0;">
    Thank you for your interest in volunteering with us. We reviewed your ID card request, but were unable to approve the application with the current details.
  </p>
  <div style="background:#fff1f2;border-left:4px solid #e11d48;border-radius:6px;padding:14px 16px;margin:20px 0;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#be123c;margin-bottom:4px;">Reason for Rejection</div>
    <div style="font-size:14px;color:#1e293b;font-weight:600;line-height:1.5;">%s</div>
  </div>
  <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px 0;">
    You are welcome to reapply with updated information and a clear passport photo.
  </p>
  <div style="text-align:center;margin:28px 0;">
    <a href="%s" style="display:inline-block;background:#059669;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;box-shadow:0 2px 4px rgba(5,150,105,0.2);">Reapply for ID Card →</a>
  </div>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
  <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
    %s — <a href="%s" style="color:#059669;text-decoration:none;">%s</a>
  </p>
</div>
</div>`,
			ngoName, card.UserName, rejectionReason, reapplyLink,
			ngoName, baseURL, baseURL,
		)
	}

	if card.Phone != "" {
		s.messenger.Send(card.Phone, userMsg)
	}
	if card.Email != "" {
		s.email.Send(card.Email, subject, html)
	}
	log.Info().Str("cardId", card.ID.String()).Str("status", status).Msg("id_card: notifications sent")
}

func (s *IDCardService) notifyManagerNewIDCard(c *models.IDCard) {
	if s.orgRepo == nil {
		return
	}
	managerPhone, err := s.orgRepo.GetValue(models.OrgKeyManagerPhone)
	if err != nil || managerPhone == "" {
		return
	}

	adminLink := fmt.Sprintf("%s/admin/request/id-card", s.appBaseURL)
	msg := fmt.Sprintf(
		"New Volunteer ID Card Request Received\n\nApplicant: %s\nPhone: %s\nDesignation: %s\nAddress: %s\n\nReview in Admin Panel:\n%s",
		c.UserName,
		c.Phone,
		c.Designation,
		c.Address,
		adminLink,
	)

	s.messenger.Send(managerPhone, msg)
	log.Info().Str("managerPhone", managerPhone).Str("cardId", c.ID.String()).Msg("id_card: manager notified")
}
