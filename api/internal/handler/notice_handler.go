package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/shashankrajput/ngo-platform/api/internal/dto"
	"github.com/shashankrajput/ngo-platform/api/internal/middleware"
	"github.com/shashankrajput/ngo-platform/api/internal/service"
)

// NoticeHandler handles notice HTTP requests.
type NoticeHandler struct {
	svc *service.NoticeService
}

// NewNoticeHandler constructs a NoticeHandler.
func NewNoticeHandler(svc *service.NoticeService) *NoticeHandler {
	return &NoticeHandler{svc: svc}
}

// List godoc — GET /api/v1/notices
func (h *NoticeHandler) List(c *gin.Context) {
	var pq dto.PaginationQuery
	_ = c.ShouldBindQuery(&pq)
	pq.Normalize()

	notices, total, err := h.svc.List(pq.Page, pq.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": "Failed to fetch notices"}})
		return
	}

	totalPages := int(total) / pq.Limit
	if int(total)%pq.Limit != 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       notices,
		"pagination": gin.H{"page": pq.Page, "limit": pq.Limit, "total": total, "totalPages": totalPages},
	})
}

// Create godoc — POST /api/v1/notices
func (h *NoticeHandler) Create(c *gin.Context) {
	var req dto.CreateNoticeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}

	createdBy, _ := c.Get(middleware.AuthUserNameKey)
	name, _ := createdBy.(string)

	notice, err := h.svc.Create(c.Request.Context(), req, name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "CREATE_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": notice})
}

// Update godoc — PATCH /api/v1/notices/:id (toggle isActive)
func (h *NoticeHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_ID", "message": "Invalid notice ID"}})
		return
	}

	var req dto.UpdateNoticeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}

	if err := h.svc.ToggleActive(id, *req.IsActive); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "UPDATE_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "Notice updated"}})
}

// Delete godoc — DELETE /api/v1/notices/:id
func (h *NoticeHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_ID", "message": "Invalid notice ID"}})
		return
	}

	if err := h.svc.Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DELETE_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "Notice deleted"}})
}
