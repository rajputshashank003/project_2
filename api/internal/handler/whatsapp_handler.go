package handler

import (
	"encoding/base64"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shashankrajput/ngo-platform/api/internal/wa"
)

// WhatsAppHandler handles WhatsApp QR and status endpoints.
type WhatsAppHandler struct {
	client *wa.WAClient
}

// NewWhatsAppHandler constructs a WhatsAppHandler.
func NewWhatsAppHandler(client *wa.WAClient) *WhatsAppHandler {
	return &WhatsAppHandler{client: client}
}

// Status godoc — GET /api/v1/whatsapp/status
func (h *WhatsAppHandler) Status(c *gin.Context) {
	status := "not_configured"
	if h.client != nil {
		status = h.client.Status()
	}
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"status": status,
		},
	})
}

// QR godoc — GET /qr or GET /api/v1/whatsapp/qr
// Returns an auto-refreshing HTML page with the embedded QR code image when status is qr_pending.
// If already connected, shows a clean success confirmation page.
func (h *WhatsAppHandler) QR(c *gin.Context) {
	if h.client == nil {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(`<!DOCTYPE html>
<html>
<head><title>WhatsApp Service</title></head>
<body style="font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;background:#f0f2f5;">
  <h2>WhatsApp Client Not Initialized</h2>
  <p style="color:#666;">Please check server logs.</p>
</body>
</html>`))
		return
	}

	status := h.client.Status()
	if status == wa.StatusConnected {
		html := `<!DOCTYPE html>
<html>
<head>
  <title>WhatsApp Service — Connected</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0fdf4; color: #166534; }
    .card { background: white; padding: 32px 48px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); text-align: center; border: 1px solid #bbf7d0; }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: #dcfce7; color: #15803d; font-weight: 700; font-size: 14px; padding: 6px 16px; border-radius: 9999px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">✓ Connected</div>
    <h2 style="margin:0 0 8px 0; color:#0f172a;">WhatsApp is Active</h2>
    <p style="color:#64748b; margin:0;">Your device is linked and ready to deliver OTPs and notifications.</p>
  </div>
</body>
</html>`
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
		return
	}

	qrBase64 := h.client.GetQR()
	if qrBase64 == "" {
		html := `<!DOCTYPE html>
<html>
<head>
  <title>WhatsApp Service — Loading QR</title>
  <meta http-equiv="refresh" content="3">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #334155; }
  </style>
</head>
<body>
  <h2>Generating WhatsApp QR Code...</h2>
  <p style="color:#64748b;">Please wait, refreshing automatically...</p>
</body>
</html>`
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
		return
	}

	// Verify base64
	if _, err := base64.StdEncoding.DecodeString(qrBase64); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{"code": "QR_DECODE_ERROR", "message": "invalid QR data"},
		})
		return
	}

	html := `<!DOCTYPE html>
<html>
<head>
  <title>WhatsApp Service — Scan QR</title>
  <meta http-equiv="refresh" content="20">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f2f5; }
    .card { background: white; padding: 32px 40px; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.08); text-align: center; max-width: 360px; }
    img { border: 4px solid #25d366; border-radius: 14px; margin: 16px 0; }
    h2 { margin: 0 0 8px 0; font-size: 20px; color: #0f172a; }
    p { color: #64748b; font-size: 13px; margin: 4px 0 0 0; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Link WhatsApp Account</h2>
    <p>Open WhatsApp → Settings → <strong>Linked Devices</strong> → <strong>Link a Device</strong> and point your camera here.</p>
    <img src="data:image/png;base64,` + qrBase64 + `" width="256" height="256" alt="WhatsApp QR Code"/>
    <p>Page auto-refreshes every 20 seconds.</p>
  </div>
</body>
</html>`

	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}
