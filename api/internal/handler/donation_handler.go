package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/shashankrajput/ngo-platform/api/internal/dto"
	"github.com/shashankrajput/ngo-platform/api/internal/middleware"
	"github.com/shashankrajput/ngo-platform/api/internal/repository"
	"github.com/shashankrajput/ngo-platform/api/internal/service"
)

// DonationHandler handles donation HTTP requests.
type DonationHandler struct {
	svc            *service.DonationService
	idempotencyRepo *repository.IdempotencyRepository
}

// NewDonationHandler constructs a DonationHandler.
func NewDonationHandler(svc *service.DonationService, idempotencyRepo *repository.IdempotencyRepository) *DonationHandler {
	return &DonationHandler{svc: svc, idempotencyRepo: idempotencyRepo}
}

// List godoc — GET /api/v1/donations
func (h *DonationHandler) List(c *gin.Context) {
	var pq dto.PaginationQuery
	_ = c.ShouldBindQuery(&pq)
	pq.Normalize()

	donations, total, err := h.svc.List(pq.Page, pq.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": "Failed to fetch donations"}})
		return
	}

	totalPages := int(total) / pq.Limit
	if int(total)%pq.Limit != 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       donations,
		"pagination": gin.H{"page": pq.Page, "limit": pq.Limit, "total": total, "totalPages": totalPages},
	})
}

// GetByID godoc — GET /api/v1/donations/:id
func (h *DonationHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_ID", "message": "Invalid donation ID"}})
		return
	}

	donation, err := h.svc.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "NOT_FOUND", "message": "Donation not found"}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": donation})
}

// Create godoc — POST /api/v1/donations
func (h *DonationHandler) Create(c *gin.Context) {
	// Idempotency check
	idempKey := c.GetHeader("Idempotency-Key")
	if idempKey != "" {
		if cached, err := h.idempotencyRepo.Find(idempKey, "POST:/donations"); err == nil && cached != nil {
			c.Data(http.StatusOK, "application/json", cached.Response)
			return
		}
	}

	var req dto.CreateDonationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}

	donation, err := h.svc.Create(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "CREATE_FAILED", "message": err.Error()}})
		return
	}

	resp := gin.H{"data": donation}
	if idempKey != "" {
		_ = h.idempotencyRepo.Save(idempKey, "POST:/donations", resp)
	}

	c.JSON(http.StatusCreated, resp)
}

// UpdateStatus godoc — PATCH /api/v1/donations/:id/status
func (h *DonationHandler) UpdateStatus(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_ID", "message": "Invalid donation ID"}})
		return
	}

	var req dto.UpdateDonationStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}

	reviewerName, _ := c.Get(middleware.AuthUserNameKey)
	name, _ := reviewerName.(string)

	donation, err := h.svc.UpdateStatus(c.Request.Context(), id, req, name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "UPDATE_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": donation})
}
