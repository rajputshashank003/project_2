package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/shashankrajput/ngo-platform/api/internal/dto"
	"github.com/shashankrajput/ngo-platform/api/internal/middleware"
	"github.com/shashankrajput/ngo-platform/api/internal/service"
)

// UserHandler handles user HTTP requests.
type UserHandler struct {
	svc *service.UserService
}

// NewUserHandler constructs a UserHandler.
func NewUserHandler(svc *service.UserService) *UserHandler {
	return &UserHandler{svc: svc}
}

// List godoc — GET /api/v1/users
func (h *UserHandler) List(c *gin.Context) {
	var pq dto.PaginationQuery
	_ = c.ShouldBindQuery(&pq)
	pq.Normalize()

	bloodGroup := c.Query("blood_group")
	if bloodGroup == "" {
		bloodGroup = c.Query("bloodGroup")
	}

	search := c.Query("search")
	if search == "" {
		search = c.Query("q")
	}

	users, total, err := h.svc.List(pq.Page, pq.Limit, bloodGroup, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": "Failed to fetch users"}})
		return
	}

	totalPages := int(total) / pq.Limit
	if int(total)%pq.Limit != 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       users,
		"pagination": gin.H{"page": pq.Page, "limit": pq.Limit, "total": total, "totalPages": totalPages},
	})
}

// Update godoc — PATCH /api/v1/users/:id
func (h *UserHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_ID", "message": "Invalid user ID"}})
		return
	}

	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}

	user, err := h.svc.Update(id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "UPDATE_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}

// Promote godoc — PATCH /api/v1/users/:id/promote
func (h *UserHandler) Promote(c *gin.Context) {
	targetID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_ID", "message": "Invalid user ID"}})
		return
	}

	adminID, _ := c.Get(middleware.AuthUserIDKey)
	adminUUID, _ := adminID.(uuid.UUID)

	if err := h.svc.Promote(adminUUID, targetID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "PROMOTE_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "User promoted to admin"}})
}

// Demote godoc — PATCH /api/v1/users/:id/demote
func (h *UserHandler) Demote(c *gin.Context) {
	targetID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_ID", "message": "Invalid user ID"}})
		return
	}

	adminID, _ := c.Get(middleware.AuthUserIDKey)
	adminUUID, _ := adminID.(uuid.UUID)

	if err := h.svc.Demote(adminUUID, targetID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "DEMOTE_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "Admin role revoked"}})
}

// UpdateMyProfile godoc — PATCH /api/v1/my/profile
// Allows an authenticated user to update their own name and email.
// Used primarily for the onboarding modal on first login.
func (h *UserHandler) UpdateMyProfile(c *gin.Context) {
	userIDRaw, _ := c.Get(middleware.AuthUserIDKey)
	userID, ok := userIDRaw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": gin.H{"code": "UNAUTHORIZED", "message": "Invalid user session"}})
		return
	}

	var req dto.UpdateMyProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}

	user, err := h.svc.UpdateMyProfile(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "UPDATE_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}

// GetMyProfile godoc — GET /api/v1/my/profile
// Returns the profile of the currently authenticated user directly from the database.
func (h *UserHandler) GetMyProfile(c *gin.Context) {
	userIDRaw, _ := c.Get(middleware.AuthUserIDKey)
	userID, ok := userIDRaw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": gin.H{"code": "UNAUTHORIZED", "message": "Invalid user session"}})
		return
	}

	user, err := h.svc.GetMyProfile(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "NOT_FOUND", "message": "User not found"}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}

