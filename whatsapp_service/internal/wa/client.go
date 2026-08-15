package wa

import (
	"context"
	"encoding/base64"
	"sync"

	"github.com/rs/zerolog/log"
	"go.mau.fi/whatsmeow"
	wastore "go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types/events"
	waLog "go.mau.fi/whatsmeow/util/log"
)

// Status values returned by Status().
const (
	StatusConnected    = "connected"
	StatusQRPending    = "qr_pending"
	StatusDisconnected = "disconnected"
)

// WAClient wraps a whatsmeow client with connection lifecycle management.
type WAClient struct {
	mu     sync.RWMutex
	client *whatsmeow.Client
	qrCode string // base64 PNG of current QR code (only set when qr_pending)
	status string
}

// NewWAClient creates a WAClient, loads session from SQLite, and connects.
// If no session exists, the client enters qr_pending state — call GetQR().
func NewWAClient(container *wastore.Container) (*WAClient, error) {
	deviceStore, err := container.GetFirstDevice(context.Background())
	if err != nil {
		return nil, err
	}

	clientLog := waLog.Stdout("Client", "WARN", true)
	wac := &WAClient{status: StatusDisconnected}
	wac.client = whatsmeow.NewClient(deviceStore, clientLog)

	wac.client.AddEventHandler(func(evt interface{}) {
		switch v := evt.(type) {
		case *events.QR:
			// Multiple QR codes offered; use the first one
			if len(v.Codes) > 0 {
				png, err := qrToPNG(v.Codes[0])
				if err != nil {
					log.Error().Err(err).Msg("wa: failed to encode QR code")
					return
				}
				wac.mu.Lock()
				wac.qrCode = base64.StdEncoding.EncodeToString(png)
				wac.status = StatusQRPending
				wac.mu.Unlock()
				log.Info().Msg("wa: QR code ready — open /qr in browser to scan")
			}
		case *events.Connected:
			wac.mu.Lock()
			wac.status = StatusConnected
			wac.qrCode = ""
			wac.mu.Unlock()
			log.Info().Msg("wa: connected to WhatsApp")
		case *events.Disconnected:
			wac.mu.Lock()
			wac.status = StatusDisconnected
			wac.mu.Unlock()
			log.Warn().Msg("wa: disconnected from WhatsApp")
		}
	})

	if err := wac.client.Connect(); err != nil {
		return nil, err
	}

	return wac, nil
}

// GetQR returns the current QR code as a base64-encoded PNG.
// Returns empty string if not in qr_pending state.
func (w *WAClient) GetQR() string {
	w.mu.RLock()
	defer w.mu.RUnlock()
	return w.qrCode
}

// Status returns the current connection status string.
func (w *WAClient) Status() string {
	w.mu.RLock()
	defer w.mu.RUnlock()
	return w.status
}

// Disconnect cleanly disconnects the WhatsApp client.
func (w *WAClient) Disconnect() {
	w.client.Disconnect()
}

// Client returns the underlying whatsmeow client (used by Sender).
func (w *WAClient) Client() *whatsmeow.Client {
	return w.client
}
