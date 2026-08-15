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

// IDCardService handles ID card business logic.
type IDCardService struct {
	repo       *repository.IDCardRepository
	cloudinary *CloudinaryService
	messenger  Messenger
	email      *EmailService
}

// NewIDCardService constructs an IDCardService.
func NewIDCardService(
	repo *repository.IDCardRepository,
	cloudinary *CloudinaryService,
	messenger Messenger,
	email *EmailService,
) *IDCardService {
	return &IDCardService{repo: repo, cloudinary: cloudinary, messenger: messenger, email: email}
}

// Create uploads images to Cloudinary then creates an ID card record.
// Orphan protection: if DB fails, Cloudinary assets are deleted.
func (s *IDCardService) Create(ctx context.Context, req dto.CreateIDCardRequest, userID *uuid.UUID) (*models.IDCard, error) {
	passportResult, err := s.cloudinary.Upload(ctx, req.PassportPhotoB64)
	if err != nil {
		return nil, fmt.Errorf("id_card: passport photo upload failed: %w", err)
	}

	screenshotResult, err := s.cloudinary.Upload(ctx, req.PaymentScreenshotB64)
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

	return card, nil
}

// GetByID returns an ID card by UUID.
func (s *IDCardService) GetByID(id uuid.UUID) (*models.IDCard, error) {
	return s.repo.FindByID(id)
}

// List returns paginated ID cards.
func (s *IDCardService) List(page, limit int) ([]models.IDCard, int64, error) {
	offset := (page - 1) * limit
	return s.repo.ListPaginated(offset, limit)
}

// UpdateStatus approves or rejects an ID card in a DB transaction.
// On approval: generates unique card number, sets issue/expiry dates.
// Fires notifications asynchronously.
func (s *IDCardService) UpdateStatus(ctx context.Context, id uuid.UUID, req dto.UpdateIDCardStatusRequest, reviewerName string) (*models.IDCard, error) {
	card, err := s.repo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("id_card: not found")
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
	var userMsg, subject, html string
	if status == "approved" {
		userMsg = fmt.Sprintf("Hi %s, your NGO ID card has been approved! Card No: %s. Login to download.", card.UserName, cardNumber)
		subject = "NGO ID Card Approved"
		html = fmt.Sprintf(`<div style="font-family:Inter,sans-serif;max-width:500px;padding:24px;">
<div style="background:#059669;padding:16px;border-radius:8px;margin-bottom:24px;">
<h2 style="color:#fff;margin:0;">ID Card Approved ✓</h2></div>
<p>Hi <strong>%s</strong>, your ID card has been approved.</p>
<p>Card No: <strong>%s</strong></p>
<p>Login to download your ID card.</p></div>`, card.UserName, cardNumber)
	} else {
		userMsg = fmt.Sprintf("Hi %s, your NGO ID card request has been declined. Please reapply.", card.UserName)
		subject = "NGO ID Card Request Update"
		html = fmt.Sprintf(`<p>Hi %s, your ID card request was declined. Please reapply.</p>`, card.UserName)
	}

	if card.Phone != "" {
		s.messenger.Send(card.Phone, userMsg)
	}
	if card.Email != "" {
		s.email.Send(card.Email, subject, html)
	}
	log.Info().Str("cardId", card.ID.String()).Str("status", status).Msg("id_card: notifications sent")
}
