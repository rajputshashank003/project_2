package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shashankrajput/ngo-platform/api/internal/service"
)

// HealthHandler handles liveness, readiness, and WhatsApp microservice health probes.
type HealthHandler struct {
	svc *service.HealthService
}

// NewHealthHandler constructs a HealthHandler.
func NewHealthHandler(svc *service.HealthService) *HealthHandler {
	return &HealthHandler{svc: svc}
}

// Liveness godoc — GET /healthz, GET /health, GET /api/health
func (h *HealthHandler) Liveness(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// Readiness godoc — GET /readyz
func (h *HealthHandler) Readiness(c *gin.Context) {
	report := h.svc.GetOverallHealth(c.Request.Context())
	if report.Status == "error" {
		c.JSON(http.StatusServiceUnavailable, report)
		return
	}
	c.JSON(http.StatusOK, report)
}

// WhatsAppHealth godoc — GET /health/whatsapp, GET /api/v1/health/whatsapp
func (h *HealthHandler) WhatsAppHealth(c *gin.Context) {
	result := h.svc.CheckWhatsAppService(c.Request.Context())
	if result.Status == "error" || result.Status == "unreachable" {
		c.JSON(http.StatusServiceUnavailable, result)
		return
	}
	c.JSON(http.StatusOK, result)
}
