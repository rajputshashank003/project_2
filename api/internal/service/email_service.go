package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/rs/zerolog/log"
	"github.com/shashankrajput/ngo-platform/api/internal/config"
)

// EmailService sends transactional emails via Resend.
type EmailService struct {
	apiKey    string
	fromEmail string
	devMode   bool
}

// NewEmailService constructs an EmailService.
func NewEmailService(cfg *config.Config) *EmailService {
	return &EmailService{
		apiKey:    cfg.ResendAPIKey,
		fromEmail: cfg.ResendFromEmail,
		devMode:   cfg.DevMode,
	}
}

// Send fires an email via Resend. In dev mode it only logs.
func (s *EmailService) Send(to, subject, htmlBody string) {
	if to == "" {
		return
	}

	if s.devMode {
		log.Info().Str("to", to).Str("subject", subject).Msg("[DEV] email send skipped")
		return
	}

	payload := map[string]interface{}{
		"from":    s.fromEmail,
		"to":      []string{to},
		"subject": subject,
		"html":    htmlBody,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		log.Error().Err(err).Msg("email: marshal payload failed")
		return
	}

	req, err := http.NewRequest(http.MethodPost, "https://api.resend.com/emails", bytes.NewBuffer(body))
	if err != nil {
		log.Error().Err(err).Msg("email: create request failed")
		return
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.apiKey))
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Error().Err(err).Str("to", to).Msg("email: send failed")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		log.Error().Int("status", resp.StatusCode).Str("to", to).Msg("email: non-2xx response")
	}
}
