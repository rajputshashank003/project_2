package handler

import (
	"encoding/base64"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shashankrajput/whatsapp_service/internal/wa"
)

// QRHandler handles GET /qr — returns the QR code image as base64 PNG.
type QRHandler struct {
	client *wa.WAClient
}

// NewQRHandler constructs a QRHandler.
func NewQRHandler(client *wa.WAClient) *QRHandler {
	return &QRHandler{client: client}
}

// QR godoc — GET /qr
// Returns an HTML page with the embedded QR code image when status is qr_pending.
// Returns 503 if WhatsApp is already connected or disconnected.
func (h *QRHandler) QR(c *gin.Context) {
	if h.client.Status() != wa.StatusQRPending {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": gin.H{
				"code":    "QR_NOT_AVAILABLE",
				"message": "WhatsApp is not in QR pending state. Status: " + h.client.Status(),
			},
		})
		return
	}

	qrBase64 := h.client.GetQR()
	if qrBase64 == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": gin.H{"code": "QR_NOT_READY", "message": "QR code not yet generated"},
		})
		return
	}

	// Decode to verify it's valid
	_, err := base64.StdEncoding.DecodeString(qrBase64)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{"code": "QR_DECODE_ERROR", "message": "invalid QR data"},
		})
		return
	}

	// Serve as an HTML page for easy browser scanning
	html := `<!DOCTYPE html>
<html>
<head>
  <title>WhatsApp Service — Scan QR</title>
  <meta http-equiv="refresh" content="20">
  <style>
    body { font-family: sans-serif; display: flex; flex-direction: column;
           align-items: center; justify-content: center; height: 100vh; margin: 0;
           background: #f0f2f5; }
    img  { border: 4px solid #25d366; border-radius: 12px; }
    p    { color: #555; margin-top: 16px; }
  </style>
</head>
<body>
  <h2>Scan with WhatsApp → Linked Devices → Link a Device</h2>
  <img src="data:image/png;base64,` + qrBase64 + `" width="256" height="256" alt="QR Code"/>
  <p>Page auto-refreshes every 20 seconds. QR is valid for ~60 seconds.</p>
</body>
</html>`

	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}
