package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shashankrajput/ngo-platform/api/internal/dto"
	"github.com/shashankrajput/ngo-platform/api/internal/service"
)

// NotifyHandler handles manual SMS/email notification requests.
type NotifyHandler struct {
	sms   *service.SMSService
	email *service.EmailService
}

// NewNotifyHandler constructs a NotifyHandler.
func NewNotifyHandler(sms *service.SMSService, email *service.EmailService) *NotifyHandler {
	return &NotifyHandler{sms: sms, email: email}
}

// SendSMS godoc — POST /api/v1/notify/sms
func (h *NotifyHandler) SendSMS(c *gin.Context) {
	var req dto.SendSMSRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}
	h.sms.Send(req.Phone, req.Message)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "SMS queued"}})
}

// SendEmail godoc — POST /api/v1/notify/email
func (h *NotifyHandler) SendEmail(c *gin.Context) {
	var req dto.SendEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}
	h.email.Send(req.To, req.Subject, req.HTML)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "Email queued"}})
}
