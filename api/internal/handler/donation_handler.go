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

	status := c.Query("status")
	search := c.Query("search")
	if search == "" {
		search = c.Query("q")
	}

	donations, total, err := h.svc.List(pq.Page, pq.Limit, status, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": "Failed to fetch donations"}})
		return
	}

	totalPages := int(total) / pq.Limit
	if int(total)%pq.Limit != 0 {
		totalPages++
	}

	stats, _ := h.svc.GetStats()

	c.JSON(http.StatusOK, gin.H{
		"data":       donations,
		"pagination": gin.H{"page": pq.Page, "limit": pq.Limit, "total": total, "totalPages": totalPages},
		"stats":      stats,
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
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}

	// Extract payment proof file from multipart form
	fileHeader, err := c.FormFile("paymentProof")
	if err != nil {
		fileHeader, err = c.FormFile("paymentScreenshot")
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": "Payment screenshot/proof file is required"}})
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "FILE_READ_ERROR", "message": "Failed to read payment screenshot file"}})
		return
	}
	defer file.Close()

	// Extract authenticated user ID set by Auth middleware
	userIDRaw, _ := c.Get(middleware.AuthUserIDKey)
	userID, _ := userIDRaw.(uuid.UUID)

	donation, err := h.svc.Create(c.Request.Context(), userID, req, file)
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

// ListMy godoc — GET /api/v1/my/donations
// Returns the authenticated user's own donations (all statuses), paginated.
func (h *DonationHandler) ListMy(c *gin.Context) {
	userIDRaw, _ := c.Get(middleware.AuthUserIDKey)
	userID, ok := userIDRaw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": gin.H{"code": "UNAUTHORIZED", "message": "Invalid user session"}})
		return
	}

	var pq dto.PaginationQuery
	_ = c.ShouldBindQuery(&pq)
	pq.Normalize()

	donations, total, err := h.svc.ListByUser(userID, pq.Page, pq.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": "Failed to fetch your donations"}})
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
