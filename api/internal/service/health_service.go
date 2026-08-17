package service

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// WhatsAppHealthResult holds the health probe result for the standalone WhatsApp microservice.
type WhatsAppHealthResult struct {
	Status     string `json:"status"` // "ok" | "unreachable" | "degraded" | "not_configured"
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

// HealthService manages system health checks and the periodic WhatsApp keep-alive worker.
type HealthService struct {
	db           *gorm.DB
	whatsAppURL  string
	pingInterval time.Duration
	httpClient   *http.Client
}

// NewHealthService constructs a new HealthService instance.
func NewHealthService(db *gorm.DB, whatsAppURL string, pingInterval time.Duration) *HealthService {
	if pingInterval <= 0 {
		pingInterval = 13 * time.Minute
	}
	return &HealthService{
		db:           db,
		whatsAppURL:  strings.TrimRight(strings.TrimSpace(whatsAppURL), "/"),
		pingInterval: pingInterval,
		httpClient:   &http.Client{Timeout: 10 * time.Second},
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

// CheckWhatsAppService executes a health check against the WhatsApp microservice (/api/health).
func (s *HealthService) CheckWhatsAppService(ctx context.Context) WhatsAppHealthResult {
	if s.whatsAppURL == "" {
		return WhatsAppHealthResult{
			Status: "not_configured",
			URL:    s.whatsAppURL,
		}
	}

	targetURL := fmt.Sprintf("%s/api/health", s.whatsAppURL)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, targetURL, nil)
	if err != nil {
		return WhatsAppHealthResult{
			Status: "error",
			URL:    targetURL,
			Error:  err.Error(),
		}
	}

	start := time.Now()
	resp, err := s.httpClient.Do(req)
	latency := time.Since(start).Milliseconds()

	if err != nil {
		return WhatsAppHealthResult{
			Status:    "unreachable",
			LatencyMs: latency,
			URL:       targetURL,
			Error:     err.Error(),
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return WhatsAppHealthResult{
			Status:     "degraded",
			StatusCode: resp.StatusCode,
			LatencyMs:  latency,
			URL:        targetURL,
			Error:      fmt.Sprintf("received HTTP %d", resp.StatusCode),
		}
	}

	return WhatsAppHealthResult{
		Status:     "ok",
		StatusCode: resp.StatusCode,
		LatencyMs:  latency,
		URL:        targetURL,
	}
}

// GetOverallHealth aggregates database connectivity and WhatsApp microservice health.
func (s *HealthService) GetOverallHealth(ctx context.Context) SystemHealthResult {
	dbStatus, dbErr := s.CheckDatabase(ctx)
	waHealth := s.CheckWhatsAppService(ctx)

	overallStatus := "ok"
	if dbErr != nil {
		overallStatus = "error"
	} else if waHealth.Status != "ok" && waHealth.Status != "not_configured" {
		overallStatus = "degraded"
	}

	return SystemHealthResult{
		Status:    overallStatus,
		Timestamp: time.Now().UTC(),
		Database:  dbStatus,
		WhatsApp:  waHealth,
	}
}

// StartKeepAliveWorker runs a 13-minute periodic loop to ping the WhatsApp microservice,
// keeping it awake on Render/free tier hosting while logging status.
func (s *HealthService) StartKeepAliveWorker(ctx context.Context) {
	ticker := time.NewTicker(s.pingInterval)
	defer ticker.Stop()

	// Initial ping on server startup
	s.pingWhatsAppKeepAlive(ctx)

	for {
		select {
		case <-ticker.C:
			s.pingWhatsAppKeepAlive(ctx)
		case <-ctx.Done():
			log.Info().Msg("health: WhatsApp keep-alive worker stopped")
			return
		}
	}
}

func (s *HealthService) pingWhatsAppKeepAlive(ctx context.Context) {
	result := s.CheckWhatsAppService(ctx)
	if result.Status == "ok" {
		log.Info().
			Str("url", result.URL).
			Int64("latencyMs", result.LatencyMs).
			Int("statusCode", result.StatusCode).
			Msg("health: WhatsApp service keep-alive ping successful")
	} else if result.Status == "not_configured" {
		log.Debug().Msg("health: WhatsApp service URL not configured; skipping keep-alive ping")
	} else {
		log.Warn().
			Str("url", result.URL).
			Str("status", result.Status).
			Str("error", result.Error).
			Msg("health: WhatsApp service keep-alive ping failed")
	}
}
