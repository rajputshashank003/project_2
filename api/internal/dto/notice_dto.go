package dto

// CreateNoticeRequest is the body for POST /notices.
type CreateNoticeRequest struct {
	Title    string `json:"title"   binding:"required"`
	Content  string `json:"content" binding:"required"`
	ImageB64 string `json:"imageBase64"`
	IsActive *bool  `json:"isActive"` // optional; defaults to true if nil
}

// UpdateNoticeRequest is the body for PATCH /notices/:id (toggle isActive).
type UpdateNoticeRequest struct {
	IsActive *bool `json:"isActive" binding:"required"`
}
