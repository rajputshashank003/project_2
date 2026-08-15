package dto

import "io"

// EventImageUpload holds an uploaded file stream or existing URL and optional caption.
type EventImageUpload struct {
	File        io.Reader
	ExistingURL string
	Caption     string
}

// CreateEventRequest is the form/body for POST /events.
type CreateEventRequest struct {
	Title       string `json:"title"       form:"title"       binding:"required"`
	Description string `json:"description" form:"description"`
}

// UpdateEventRequest is the form/body for PATCH /events/:id.
type UpdateEventRequest struct {
	Title       string `json:"title"       form:"title"`
	Description string `json:"description" form:"description"`
}
