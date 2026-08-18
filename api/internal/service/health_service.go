package service

import (
	"context"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/shashankrajput/ngo-platform/api/internal/wa"
	"gorm.io/gorm"
)

// WhatsAppHealthResult holds the health probe result for WhatsApp.
type WhatsAppHealthResult struct {
	Status     string `json:"status"` // "ok" | "qr_pending" | "disconnected" | "not_configured"
	StatusCode int    `json:"statusCode,omitempty"`
	LatencyMs  int64  `json:"latencyMs"`
	URL        string `json:"url"`
	Error      string `json:"error,omitempty"`
}

// SystemHealthResult aggregates overall system readiness.
type SystemHealthResult struct {
	Status    string               `json:"status"` // "ok" | "degraded" | "error"
	Timestamp time.Time            `json:"timestamp"`
	Database  string               `json:"database"` // "connected" | "unreachable" | "unavailable"
	WhatsApp  WhatsAppHealthResult `json:"whatsapp"`
}

// HealthService manages system health checks.
type HealthService struct {
	db       *gorm.DB
	waClient *wa.WAClient
}

// NewHealthService constructs a new HealthService instance.
func NewHealthService(db *gorm.DB, waClient *wa.WAClient) *HealthService {
	return &HealthService{
		db:       db,
		waClient: waClient,
	}
}

// CheckDatabase validates PostgreSQL database connectivity.
func (s *HealthService) CheckDatabase(ctx context.Context) (string, error) {
	sqlDB, err := s.db.DB()
	if err != nil {
		return "unavailable", err
	}
	if err := sqlDB.PingContext(ctx); err != nil {
		return "unreachable", err
	}
	return "connected", nil
}

// CheckWhatsAppService returns the in-memory WhatsApp client connection status.
func (s *HealthService) CheckWhatsAppService(ctx context.Context) WhatsAppHealthResult {
	if s.waClient == nil {
		return WhatsAppHealthResult{
			Status: "not_configured",
			URL:    "in-memory",
		}
	}

	st := s.waClient.Status()
	switch st {
	case wa.StatusConnected:
		return WhatsAppHealthResult{
			Status:     "ok",
			StatusCode: 200,
			LatencyMs:  0,
			URL:        "in-memory",
		}
	case wa.StatusQRPending:
		return WhatsAppHealthResult{
			Status:     "qr_pending",
			StatusCode: 200,
			LatencyMs:  0,
			URL:        "in-memory",
		}
	default:
		return WhatsAppHealthResult{
			Status:     "disconnected",
			StatusCode: 503,
			LatencyMs:  0,
			URL:        "in-memory",
			Error:      "WhatsApp is disconnected",
		}
	}
}

// GetOverallHealth aggregates database connectivity and WhatsApp client health.
func (s *HealthService) GetOverallHealth(ctx context.Context) SystemHealthResult {
	dbStatus, dbErr := s.CheckDatabase(ctx)
	waHealth := s.CheckWhatsAppService(ctx)

	overallStatus := "ok"
	if dbErr != nil {
		overallStatus = "error"
	} else if waHealth.Status == "disconnected" {
		overallStatus = "degraded"
	}

	return SystemHealthResult{
		Status:    overallStatus,
		Timestamp: time.Now().UTC(),
		Database:  dbStatus,
		WhatsApp:  waHealth,
	}
}

// StartKeepAliveWorker logs that WhatsApp in-memory mode is active and waits for ctx.Done().
func (s *HealthService) StartKeepAliveWorker(ctx context.Context) {
	log.Info().Msg("health: WhatsApp in-memory service is active (no external ping needed)")
	<-ctx.Done()
}
