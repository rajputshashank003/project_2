package service

import "github.com/rs/zerolog/log"

// MultiMessenger implements Messenger and dispatches to the correct channel
// based on the MESSAGING_TYPE environment variable.
// Valid values: "sms" | "whatsapp_twilio" | "whatsapp_local"
type MultiMessenger struct {
	sms            *SMSService
	whatsappTwilio *WhatsAppTwilioService
	whatsappLocal  *WhatsAppLocalService
	messagingType  string
}

// NewMultiMessenger constructs a MultiMessenger.
func NewMultiMessenger(
	sms *SMSService,
	whatsappTwilio *WhatsAppTwilioService,
	whatsappLocal *WhatsAppLocalService,
	messagingType string,
) *MultiMessenger {
	return &MultiMessenger{
		sms:            sms,
		whatsappTwilio: whatsappTwilio,
		whatsappLocal:  whatsappLocal,
		messagingType:  messagingType,
	}
}

// Send dispatches to the configured messaging channel.
func (m *MultiMessenger) Send(phone, message string) {
	switch m.messagingType {
	case "whatsapp_twilio":
		m.whatsappTwilio.Send(phone, message)
	case "whatsapp_local":
		m.whatsappLocal.Send(phone, message)
	default:
		if m.messagingType != "sms" {
			log.Warn().Str("messagingType", m.messagingType).
				Msg("multi_messenger: unknown MESSAGING_TYPE, falling back to sms")
		}
		m.sms.Send(phone, message)
	}
}
