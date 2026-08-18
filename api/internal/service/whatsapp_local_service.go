package service

import (
	"github.com/rs/zerolog/log"
	"github.com/shashankrajput/ngo-platform/api/internal/wa"
)

// WhatsAppLocalService sends WhatsApp messages via the in-memory whatsmeow client.
// Implements the Messenger interface.
type WhatsAppLocalService struct {
	waClient *wa.WAClient
	devMode  bool
}

// NewWhatsAppLocalService constructs a WhatsAppLocalService.
func NewWhatsAppLocalService(waClient *wa.WAClient, devMode bool) *WhatsAppLocalService {
	return &WhatsAppLocalService{
		waClient: waClient,
		devMode:  devMode,
	}
}

// Send sends a WhatsApp message via the in-memory WhatsApp client.
// In dev mode it only logs without sending.
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

	if s.waClient == nil {
		log.Warn().Str("to", phone).Msg("whatsapp_local: WhatsApp client is not initialized")
		return
	}

	if s.waClient.Status() != wa.StatusConnected {
		log.Warn().Str("to", phone).Str("status", s.waClient.Status()).
			Msg("whatsapp_local: WhatsApp client is not connected")
		return
	}

	if err := s.waClient.Send(phone, message); err != nil {
		log.Error().Err(err).Str("to", phone).Msg("whatsapp_local: send failed")
	}
}
