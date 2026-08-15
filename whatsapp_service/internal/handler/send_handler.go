package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shashankrajput/whatsapp_service/internal/wa"
)

// SendHandler handles POST /send — sends a WhatsApp message.
type SendHandler struct {
	client *wa.WAClient
}

// NewSendHandler constructs a SendHandler.
func NewSendHandler(client *wa.WAClient) *SendHandler {
	return &SendHandler{client: client}
}

type sendRequest struct {
	Phone   string `json:"phone"   binding:"required"`
	Message string `json:"message" binding:"required"`
}

// Send godoc — POST /send
func (h *SendHandler) Send(c *gin.Context) {
	var req sendRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}

	if err := h.client.Send(req.Phone, req.Message); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": gin.H{"code": "SEND_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "sent"}})
}
