package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shashankrajput/whatsapp_service/internal/wa"
)

// StatusHandler handles GET /status — returns WhatsApp connection state.
type StatusHandler struct {
	client *wa.WAClient
}

// NewStatusHandler constructs a StatusHandler.
func NewStatusHandler(client *wa.WAClient) *StatusHandler {
	return &StatusHandler{client: client}
}

// Status godoc — GET /status
// Returns: { "data": { "status": "connected" | "qr_pending" | "disconnected" } }
func (h *StatusHandler) Status(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"status": h.client.Status()}})
}
