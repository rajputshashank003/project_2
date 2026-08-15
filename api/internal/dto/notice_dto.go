package dto

// CreateNoticeRequest is the body/form for POST /notices.
type CreateNoticeRequest struct {
	Title    string `json:"title"    form:"title"    binding:"required"`
	Content  string `json:"content"  form:"content"  binding:"required"`
	IsActive *bool  `json:"isActive" form:"isActive"` // optional; defaults to true if nil
}

// UpdateNoticeRequest is the body for PATCH /notices/:id (toggle isActive).
type UpdateNoticeRequest struct {
	IsActive *bool `json:"isActive" binding:"required"`
}
