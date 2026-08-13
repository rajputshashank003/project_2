package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/shashankrajput/ngo-platform/api/internal/dto"
	"github.com/shashankrajput/ngo-platform/api/internal/service"
)

// TeamHandler handles team member HTTP requests.
type TeamHandler struct {
	svc *service.TeamService
}

// NewTeamHandler constructs a TeamHandler.
func NewTeamHandler(svc *service.TeamService) *TeamHandler {
	return &TeamHandler{svc: svc}
}

// List godoc — GET /api/v1/team
func (h *TeamHandler) List(c *gin.Context) {
	members, err := h.svc.ListAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": "Failed to fetch team"}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": members})
}

// UpdateSlot godoc — PATCH /api/v1/team/:slot
func (h *TeamHandler) UpdateSlot(c *gin.Context) {
	slot, err := strconv.Atoi(c.Param("slot"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_SLOT", "message": "Invalid slot number"}})
		return
	}

	var req dto.UpdateTeamMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}

	member, err := h.svc.UpdateSlot(c.Request.Context(), slot, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "UPDATE_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": member})
}

// ClearSlot godoc — PATCH /api/v1/team/:slot/clear
func (h *TeamHandler) ClearSlot(c *gin.Context) {
	slot, err := strconv.Atoi(c.Param("slot"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_SLOT", "message": "Invalid slot number"}})
		return
	}

	if err := h.svc.ClearSlot(c.Request.Context(), slot); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "CLEAR_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "Slot cleared"}})
}

// AddSlot godoc — POST /api/v1/team/add-slot
func (h *TeamHandler) AddSlot(c *gin.Context) {
	member, err := h.svc.AddSlot()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "ADD_SLOT_FAILED", "message": err.Error()}})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": member})
}

// RemoveSlot godoc — DELETE /api/v1/team/slot/:slot
func (h *TeamHandler) RemoveSlot(c *gin.Context) {
	slot, err := strconv.Atoi(c.Param("slot"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_SLOT", "message": "Invalid slot number"}})
		return
	}

	if err := h.svc.RemoveSlot(c.Request.Context(), slot); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "REMOVE_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "Slot removed and re-indexed"}})
}
