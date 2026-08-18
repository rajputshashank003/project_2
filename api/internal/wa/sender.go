package wa

import (
	"context"
	"fmt"
	"time"

	"github.com/rs/zerolog/log"
	"go.mau.fi/whatsmeow/proto/waE2E"
	"go.mau.fi/whatsmeow/types"
	"google.golang.org/protobuf/proto"
)

// Send sends a plain text WhatsApp message.
// phone: raw 10-digit Indian number (e.g. "9876543210") — 91 country code added automatically.
// JID user part must be pure digits (no '+' prefix).
func (w *WAClient) Send(phone, message string) error {
	if w == nil || w.Status() != StatusConnected {
		status := "uninitialized"
		if w != nil {
			status = w.Status()
		}
		return fmt.Errorf("wa: not connected (status: %s)", status)
	}

	// WhatsApp JIDs use plain digits — no '+' sign.
	jid := types.NewJID(fmt.Sprintf("91%s", phone), types.DefaultUserServer)

	msg := &waE2E.Message{
		Conversation: proto.String(message),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	resp, err := w.client.SendMessage(ctx, jid, msg)
	if err != nil {
		log.Error().Err(err).Str("to", phone).Msg("wa: send failed")
		return fmt.Errorf("wa: send failed: %w", err)
	}

	log.Info().Str("to", phone).Str("msgID", resp.ID).Msg("wa: message sent")
	return nil
}
