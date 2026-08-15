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

// List returns paginated ID cards (admin — all users).
func (s *IDCardService) List(page, limit int) ([]models.IDCard, int64, error) {
	offset := (page - 1) * limit
	return s.repo.ListPaginated(offset, limit)
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
	if status == "approved" {
		cardLink := fmt.Sprintf("%s/id-card/%s", baseURL, card.ID.String())
		userMsg = fmt.Sprintf(
			"✅ Hi %s, your NGO ID Card has been approved!\nCard No: %s\nDownload it here: %s",
			card.UserName, cardNumber, cardLink,
		)
		subject = "NGO ID Card Approved"
		html = fmt.Sprintf(`<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;">
<div style="background:#059669;padding:20px 24px;border-radius:12px 12px 0 0;">
  <h2 style="color:#fff;margin:0;font-size:20px;">✅ ID Card Approved</h2>
</div>
<div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;">
  <p style="color:#334155;margin-top:0;">Hi <strong>%s</strong>,</p>
  <p style="color:#334155;">Your NGO ID card has been <strong style="color:#059669;">approved</strong>.</p>
  <p style="color:#334155;">Card No: <strong style="font-family:monospace;">%s</strong></p>
  <div style="text-align:center;margin:24px 0;">
    <a href="%s" style="display:inline-block;background:#059669;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">View &amp; Download ID Card →</a>
  </div>
  <p style="color:#64748b;font-size:13px;">If the button doesn't work, copy this link: <a href="%s" style="color:#059669;">%s</a></p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
  <p style="color:#94a3b8;font-size:12px;text-align:center;">%s — <a href="%s" style="color:#059669;">%s</a></p>
</div>
</div>`,
			card.UserName, cardNumber, cardLink, cardLink, cardLink,
			"NGO Platform", baseURL, baseURL,
		)
	} else {
		userMsg = fmt.Sprintf(
			"Hi %s, your NGO ID card request has been declined. Please reapply at %s",
			card.UserName, baseURL,
		)
		subject = "NGO ID Card Request Update"
		html = fmt.Sprintf(`<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
<p>Hi <strong>%s</strong>,</p>
<p>Your ID card request was <strong style="color:#dc2626;">declined</strong>. Please <a href="%s">reapply here</a>.</p>
</div>`, card.UserName, baseURL)
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
