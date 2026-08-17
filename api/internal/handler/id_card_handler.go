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

// IDCardHandler handles ID card HTTP requests.
type IDCardHandler struct {
	svc             *service.IDCardService
	idempotencyRepo *repository.IdempotencyRepository
}

// NewIDCardHandler constructs an IDCardHandler.
func NewIDCardHandler(svc *service.IDCardService, idempotencyRepo *repository.IdempotencyRepository) *IDCardHandler {
	return &IDCardHandler{svc: svc, idempotencyRepo: idempotencyRepo}
}

// List godoc — GET /api/v1/id-cards
func (h *IDCardHandler) List(c *gin.Context) {
	var pq dto.PaginationQuery
	_ = c.ShouldBindQuery(&pq)
	pq.Normalize()

	status := c.Query("status")
	search := c.Query("search")
	if search == "" {
		search = c.Query("q")
	}

	cards, total, err := h.svc.List(pq.Page, pq.Limit, status, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": "Failed to fetch ID cards"}})
		return
	}

	totalPages := int(total) / pq.Limit
	if int(total)%pq.Limit != 0 {
		totalPages++
	}

	stats, _ := h.svc.GetStats()

	c.JSON(http.StatusOK, gin.H{
		"data":       cards,
		"pagination": gin.H{"page": pq.Page, "limit": pq.Limit, "total": total, "totalPages": totalPages},
		"stats":      stats,
	})
}

// GetByID godoc — GET /api/v1/id-cards/:id
func (h *IDCardHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_ID", "message": "Invalid ID card ID"}})
		return
	}

	card, err := h.svc.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "NOT_FOUND", "message": "ID card not found"}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": card})
}

// Create godoc — POST /api/v1/id-cards
func (h *IDCardHandler) Create(c *gin.Context) {
	idempKey := c.GetHeader("Idempotency-Key")
	if idempKey != "" {
		if cached, err := h.idempotencyRepo.Find(idempKey, "POST:/id-cards"); err == nil && cached != nil {
			c.Data(http.StatusOK, "application/json", cached.Response)
			return
		}
	}

	var req dto.CreateIDCardRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}

	// Passport photo file
	passportHeader, err := c.FormFile("passportPhoto")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": "passportPhoto file is required"}})
		return
	}
	passportFile, err := passportHeader.Open()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "FILE_READ_ERROR", "message": "Failed to read passport photo file"}})
		return
	}
	defer passportFile.Close()

	// Payment screenshot / proof file
	paymentHeader, err := c.FormFile("paymentScreenshot")
	if err != nil {
		paymentHeader, err = c.FormFile("paymentProof")
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": "paymentScreenshot/paymentProof file is required"}})
		return
	}
	paymentFile, err := paymentHeader.Open()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "FILE_READ_ERROR", "message": "Failed to read payment screenshot file"}})
		return
	}
	defer paymentFile.Close()

	// Get authenticated user ID
	rawID, _ := c.Get(middleware.AuthUserIDKey)
	userUUID, _ := rawID.(uuid.UUID)

	card, err := h.svc.Create(c.Request.Context(), req, &userUUID, passportFile, paymentFile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "CREATE_FAILED", "message": err.Error()}})
		return
	}

	resp := gin.H{"data": card}
	if idempKey != "" {
		_ = h.idempotencyRepo.Save(idempKey, "POST:/id-cards", resp)
	}

	c.JSON(http.StatusCreated, resp)
}

// UpdateStatus godoc — PATCH /api/v1/id-cards/:id/status
func (h *IDCardHandler) UpdateStatus(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_ID", "message": "Invalid ID card ID"}})
		return
	}

	var req dto.UpdateIDCardStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}

	reviewerName, _ := c.Get(middleware.AuthUserNameKey)
	name, _ := reviewerName.(string)

	card, err := h.svc.UpdateStatus(c.Request.Context(), id, req, name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "UPDATE_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": card})
}

// ListMy godoc — GET /api/v1/my/id-cards
// Returns the authenticated user's own ID card requests (all statuses), paginated.
func (h *IDCardHandler) ListMy(c *gin.Context) {
	userIDRaw, _ := c.Get(middleware.AuthUserIDKey)
	userID, ok := userIDRaw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": gin.H{"code": "UNAUTHORIZED", "message": "Invalid user session"}})
		return
	}

	var pq dto.PaginationQuery
	_ = c.ShouldBindQuery(&pq)
	pq.Normalize()

	cards, total, err := h.svc.ListByUser(userID, pq.Page, pq.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": "Failed to fetch your ID cards"}})
		return
	}

	totalPages := int(total) / pq.Limit
	if int(total)%pq.Limit != 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       cards,
		"pagination": gin.H{"page": pq.Page, "limit": pq.Limit, "total": total, "totalPages": totalPages},
	})
}
