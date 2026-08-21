package service

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"strings"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/rs/zerolog/log"
	"github.com/shashankrajput/ngo-platform/api/internal/config"
)

// CloudinaryResult holds the result of an upload.
type CloudinaryResult struct {
	SecureURL string
	PublicID  string
}

// CloudinaryService handles image uploads and deletions via Cloudinary.
type CloudinaryService struct {
	cld    *cloudinary.Cloudinary
	folder string
}

// NewCloudinaryService constructs a CloudinaryService.
func NewCloudinaryService(cfg *config.Config) *CloudinaryService {
	cld, err := cloudinary.NewFromParams(cfg.CloudinaryCloudName, cfg.CloudinaryAPIKey, cfg.CloudinaryAPISecret)
	if err != nil {
		panic(fmt.Sprintf("cloudinary: init failed: %v", err))
	}
	return &CloudinaryService{cld: cld, folder: cfg.CloudinaryUploadFolder}
}

// UploadFile streams an io.Reader (such as a multipart.File) directly to Cloudinary.
// Returns (CloudinaryResult, error). On error the caller must NOT persist the record.
func (s *CloudinaryService) UploadFile(ctx context.Context, file io.Reader) (CloudinaryResult, error) {
	resp, err := s.cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder:         s.folder,
		Transformation: "c_limit,w_1600,h_1600,q_auto:good",
	})
	if err != nil {
		return CloudinaryResult{}, fmt.Errorf("cloudinary: file upload failed: %w", err)
	}

	return CloudinaryResult{
		SecureURL: resp.SecureURL,
		PublicID:  resp.PublicID,
	}, nil
}

// Upload decodes a Base64 string and uploads it to Cloudinary.
// Deprecated: Use UploadFile with multipart file streaming instead.
func (s *CloudinaryService) Upload(ctx context.Context, base64Str string) (CloudinaryResult, error) {
	// Strip data URI prefix if present (data:image/png;base64,...)
	if idx := strings.Index(base64Str, ","); idx != -1 {
		base64Str = base64Str[idx+1:]
	}

	raw, err := base64.StdEncoding.DecodeString(base64Str)
	if err != nil {
		return CloudinaryResult{}, fmt.Errorf("cloudinary: base64 decode failed: %w", err)
	}

	return s.UploadFile(ctx, bytes.NewReader(raw))
}

// Delete removes an asset from Cloudinary by its public_id.
// A failure is logged but not fatal — caller continues with DB delete.
func (s *CloudinaryService) Delete(ctx context.Context, publicID string) {
	if publicID == "" {
		return
	}
	_, err := s.cld.Upload.Destroy(ctx, uploader.DestroyParams{PublicID: publicID})
	if err != nil {
		log.Error().Err(err).Str("publicId", publicID).Msg("cloudinary: failed to delete asset")
	}
}
