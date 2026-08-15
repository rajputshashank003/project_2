package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/shashankrajput/ngo-platform/api/internal/dto"
	"github.com/shashankrajput/ngo-platform/api/internal/service"
)

// NgoHandler handles NGO config HTTP requests.
type NgoHandler struct {
	svc *service.NgoService
}

// NewNgoHandler constructs a NgoHandler.
func NewNgoHandler(svc *service.NgoService) *NgoHandler {
	return &NgoHandler{svc: svc}
}

// GetConfig godoc — GET /api/v1/ngo/config
func (h *NgoHandler) GetConfig(c *gin.Context) {
	cfg, err := h.svc.Get()
	if err != nil {
		log.Error().Err(err).Msg("ngo_handler: GetConfig failed")
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": "Failed to fetch NGO config"}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": cfg})
}

// UpdateConfig godoc — PATCH /api/v1/ngo/config
func (h *NgoHandler) UpdateConfig(c *gin.Context) {
	var req dto.UpdateNgoConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}

	cfg, err := h.svc.Update(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "UPDATE_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": cfg})
}
