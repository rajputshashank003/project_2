package service

import (
	"context"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/shashankrajput/ngo-platform/api/internal/repository"
)

// CleanupService encapsulates periodic purging of expired temporary records (Idempotency keys, OTPs).
type CleanupService struct {
	idempotencyRepo *repository.IdempotencyRepository
	otpRepo         *repository.OTPRepository
	interval        time.Duration
	retentionPeriod time.Duration
}

// NewCleanupService constructs a new CleanupService instance.
func NewCleanupService(
	idempotencyRepo *repository.IdempotencyRepository,
	otpRepo *repository.OTPRepository,
	interval time.Duration,
	retentionPeriod time.Duration,
) *CleanupService {
	if interval <= 0 {
		interval = 1 * time.Hour
	}
	if retentionPeriod <= 0 {
		retentionPeriod = 24 * time.Hour
	}
	return &CleanupService{
		idempotencyRepo: idempotencyRepo,
		otpRepo:         otpRepo,
		interval:        interval,
		retentionPeriod: retentionPeriod,
	}
}

// Run starts the background cleanup loop and listens for graceful shutdown context cancellation.
func (s *CleanupService) Run(ctx context.Context) {
	ticker := time.NewTicker(s.interval)
	defer ticker.Stop()

	// Initial run upon startup
	s.PerformCleanup()

	for {
		select {
		case <-ticker.C:
			s.PerformCleanup()
		case <-ctx.Done():
			log.Info().Msg("cleanup: background cleanup service stopped")
			return
		}
	}
}

// PerformCleanup executes all registered cleanup routines.
func (s *CleanupService) PerformCleanup() {
	// 1. Expired Idempotency keys older than 24h
	if err := s.idempotencyRepo.Cleanup(); err != nil {
		log.Error().Err(err).Msg("cleanup: idempotency keys cleanup failed")
	} else {
		log.Info().Msg("cleanup: expired idempotency keys cleaned up")
	}

	// 2. Expired OTP records older than 24h (safely after 5m expiry and 10m rate-limit window)
	if err := s.otpRepo.CleanupOlderThan(s.retentionPeriod); err != nil {
		log.Error().Err(err).Msg("cleanup: OTPs cleanup failed")
	} else {
		log.Info().Str("retention", s.retentionPeriod.String()).Msg("cleanup: expired OTP records cleaned up")
	}
}
