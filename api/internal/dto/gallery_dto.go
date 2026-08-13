package dto

// UploadGalleryRequest is the body for POST /gallery.
type UploadGalleryRequest struct {
	ImageB64 string `json:"imageBase64" binding:"required"`
	Caption  string `json:"caption"`
}
