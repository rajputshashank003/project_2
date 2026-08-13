package dto

// EventImageInput is a single image within a CreateEventRequest.
type EventImageInput struct {
	ImageB64 string `json:"imageBase64" binding:"required"`
	Caption  string `json:"caption"`
}

// CreateEventRequest is the body for POST /events.
type CreateEventRequest struct {
	Title       string           `json:"title"       binding:"required"`
	Description string           `json:"description"`
	Images      []EventImageInput `json:"images"`
}

// UpdateEventRequest is the body for PATCH /events/:id.
type UpdateEventRequest struct {
	Title       string           `json:"title"`
	Description string           `json:"description"`
	Images      []EventImageInput `json:"images"` // replaces all images if provided
}
