package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/rs/zerolog/log"
	"github.com/shashankrajput/ngo-platform/api/internal/config"
)

// WhatsAppLocalService sends WhatsApp messages via the standalone whatsapp_service
// microservice (which uses the unofficial whatsmeow library internally).
// This service calls the microservice over HTTP — no whatsmeow dependency in N_P.
// Implements the Messenger interface.
type WhatsAppLocalService struct {
	baseURL string // e.g. "http://localhost:8080"
	apiKey  string // secret API key for authentication
	devMode bool
}

// NewWhatsAppLocalService constructs a WhatsAppLocalService.
func NewWhatsAppLocalService(cfg *config.Config) *WhatsAppLocalService {
	return &WhatsAppLocalService{
		baseURL: cfg.WhatsAppLocalURL,
		apiKey:  cfg.WhatsAppLocalAPIKey,
		devMode: cfg.DevMode,
	}
}

// Send sends a WhatsApp message via the local whatsapp_service microservice.
// In dev mode it only logs.
// phone: raw 10-digit Indian number (e.g. "9876543210").
func (s *WhatsAppLocalService) Send(phone, message string) {
	if phone == "" {
		return
	}

	if s.devMode {
		log.Info().Str("to", phone).Str("message", message).
			Msg("[DEV] WhatsApp local send skipped")
		return
	}

	payload, err := json.Marshal(map[string]string{
		"phone":   phone,
		"message": message,
	})
	if err != nil {
		log.Error().Err(err).Str("to", phone).Msg("whatsapp_local: marshal failed")
		return
	}

	req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("%s/send", s.baseURL), bytes.NewBuffer(payload))
	if err != nil {
		log.Error().Err(err).Str("to", phone).Msg("whatsapp_local: request creation failed")
		return
	}
	req.Header.Set("Content-Type", "application/json")
	if s.apiKey != "" {
		req.Header.Set("X-API-Key", s.apiKey)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Error().Err(err).Str("to", phone).Msg("whatsapp_local: send failed")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		log.Error().Int("status", resp.StatusCode).Str("to", phone).Str("response", string(bodyBytes)).
			Msg("whatsapp_local: non-2xx response from whatsapp_service")
	}
}
