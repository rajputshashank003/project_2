package dto

// UploadGalleryRequest is the form/body for POST /gallery.
type UploadGalleryRequest struct {
	Caption string `json:"caption" form:"caption"`
}
