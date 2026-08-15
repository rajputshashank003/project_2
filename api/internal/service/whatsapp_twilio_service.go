package service

import (
	"fmt"
	"strings"

	"github.com/rs/zerolog/log"
	"github.com/shashankrajput/ngo-platform/api/internal/config"
	"github.com/twilio/twilio-go"
	openapi "github.com/twilio/twilio-go/rest/api/v2010"
)

// WhatsAppTwilioService sends WhatsApp messages via the Twilio WhatsApp API.
// Uses the same Twilio credentials as SMSService but with a whatsapp: prefix.
// Implements the Messenger interface.
type WhatsAppTwilioService struct {
	client  *twilio.RestClient
	from    string // e.g. "whatsapp:+14155238886" for sandbox
	devMode bool
}

// NewWhatsAppTwilioService constructs a WhatsAppTwilioService.
func NewWhatsAppTwilioService(cfg *config.Config) *WhatsAppTwilioService {
	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: cfg.TwilioAccountSID,
		Password: cfg.TwilioAuthToken,
	})
	return &WhatsAppTwilioService{
		client:  client,
		from:    cfg.TwilioWhatsAppFrom,
		devMode: cfg.DevMode,
	}
}

// Send sends a WhatsApp message via Twilio. In dev mode it only logs.
// phone: raw 10-digit Indian number (e.g. "9876543210") — country code added automatically.
func (s *WhatsAppTwilioService) Send(phone, message string) {
	if phone == "" {
		return
	}

	if s.devMode {
		log.Info().Str("to", phone).Str("message", message).
			Msg("[DEV] WhatsApp Twilio send skipped")
		return
	}

	cleanPhone := strings.TrimSpace(phone)
	cleanPhone = strings.TrimPrefix(cleanPhone, "+91")
	cleanPhone = strings.TrimPrefix(cleanPhone, "+")
	toFormatted := fmt.Sprintf("whatsapp:+91%s", cleanPhone)
	params := &openapi.CreateMessageParams{}
	params.SetTo(toFormatted)
	params.SetFrom(s.from)
	params.SetBody(message)

	_, err := s.client.Api.CreateMessage(params)
	if err != nil {
		log.Error().Err(err).Str("to", phone).Msg("whatsapp_twilio: send failed")
	}
}
