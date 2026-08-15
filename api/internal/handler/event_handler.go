package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/shashankrajput/ngo-platform/api/internal/dto"
	"github.com/shashankrajput/ngo-platform/api/internal/middleware"
	"github.com/shashankrajput/ngo-platform/api/internal/service"
)

// EventHandler handles event HTTP requests.
type EventHandler struct {
	svc *service.EventService
}

// NewEventHandler constructs an EventHandler.
func NewEventHandler(svc *service.EventService) *EventHandler {
	return &EventHandler{svc: svc}
}

// List godoc — GET /api/v1/events
func (h *EventHandler) List(c *gin.Context) {
	var pq dto.PaginationQuery
	_ = c.ShouldBindQuery(&pq)
	pq.Normalize()

	events, total, err := h.svc.List(pq.Page, pq.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": "Failed to fetch events"}})
		return
	}

	totalPages := int(total) / pq.Limit
	if int(total)%pq.Limit != 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       events,
		"pagination": gin.H{"page": pq.Page, "limit": pq.Limit, "total": total, "totalPages": totalPages},
	})
}

// Create godoc — POST /api/v1/events
func (h *EventHandler) Create(c *gin.Context) {
	var req dto.CreateEventRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}

	var imageUploads []dto.EventImageUpload
	form, _ := c.MultipartForm()
	if form != nil {
		files := form.File["images"]
		captions := form.Value["captions"]
		for i, fileHeader := range files {
			f, err := fileHeader.Open()
			if err != nil {
				continue
			}
			defer f.Close()
			capText := ""
			if i < len(captions) {
				capText = captions[i]
			}
			imageUploads = append(imageUploads, dto.EventImageUpload{
				File:    f,
				Caption: capText,
			})
		}
	}

	createdBy, _ := c.Get(middleware.AuthUserNameKey)
	name, _ := createdBy.(string)

	event, err := h.svc.Create(c.Request.Context(), req, imageUploads, name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "CREATE_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": event})
}

// Update godoc — PATCH /api/v1/events/:id
func (h *EventHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_ID", "message": "Invalid event ID"}})
		return
	}

	var req dto.UpdateEventRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": err.Error()}})
		return
	}

	var imageUploads []dto.EventImageUpload
	form, _ := c.MultipartForm()
	if form != nil {
		// Existing image URLs
		existingURLs := form.Value["existingUrls"]
		existingCaptions := form.Value["existingCaptions"]
		for i, url := range existingURLs {
			capText := ""
			if i < len(existingCaptions) {
				capText = existingCaptions[i]
			}
			imageUploads = append(imageUploads, dto.EventImageUpload{
				ExistingURL: url,
				Caption:     capText,
			})
		}

		// New image files
		newFiles := form.File["images"]
		newCaptions := form.Value["captions"]
		for i, fileHeader := range newFiles {
			f, err := fileHeader.Open()
			if err != nil {
				continue
			}
			defer f.Close()
			capText := ""
			if i < len(newCaptions) {
				capText = newCaptions[i]
			}
			imageUploads = append(imageUploads, dto.EventImageUpload{
				File:    f,
				Caption: capText,
			})
		}
	}

	event, err := h.svc.Update(c.Request.Context(), id, req, imageUploads)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "UPDATE_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": event})
}

// Delete godoc — DELETE /api/v1/events/:id
func (h *EventHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_ID", "message": "Invalid event ID"}})
		return
	}

	if err := h.svc.Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DELETE_FAILED", "message": err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "Event deleted"}})
}
