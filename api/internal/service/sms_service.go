package service

import (
	"fmt"
	"strings"

	"github.com/rs/zerolog/log"
	"github.com/shashankrajput/ngo-platform/api/internal/config"
	openapi "github.com/twilio/twilio-go/rest/api/v2010"
	"github.com/twilio/twilio-go"
)

// SMSService sends OTP SMS via Twilio.
type SMSService struct {
	client    *twilio.RestClient
	fromPhone string
	devMode   bool
}

// NewSMSService constructs an SMSService.
func NewSMSService(cfg *config.Config) *SMSService {
	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: cfg.TwilioAccountSID,
		Password: cfg.TwilioAuthToken,
	})
	return &SMSService{
		client:    client,
		fromPhone: cfg.TwilioFromPhone,
		devMode:   cfg.DevMode,
	}
}

// Send sends an SMS message. In dev mode it only logs.
func (s *SMSService) Send(to, message string) {
	if to == "" {
		return
	}

	if s.devMode {
		log.Info().Str("to", to).Str("message", message).Msg("[DEV] SMS send skipped")
		return
	}

	cleanTo := strings.TrimSpace(to)
	cleanTo = strings.TrimPrefix(cleanTo, "+91")
	cleanTo = strings.TrimPrefix(cleanTo, "+")
	toFormatted := fmt.Sprintf("+91%s", cleanTo) // Indian phone prefix
	params := &openapi.CreateMessageParams{}
	params.SetTo(toFormatted)
	params.SetFrom(s.fromPhone)
	params.SetBody(message)

	_, err := s.client.Api.CreateMessage(params)
	if err != nil {
		log.Error().Err(err).Str("to", to).Msg("sms: send failed")
	}
}
