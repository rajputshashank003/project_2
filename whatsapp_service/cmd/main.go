package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/shashankrajput/whatsapp_service/internal/config"
	"github.com/shashankrajput/whatsapp_service/internal/handler"
	"github.com/shashankrajput/whatsapp_service/internal/wa"
	"github.com/shashankrajput/whatsapp_service/store"
)

func main() {
	// ---- Logging -----------------------------------------------------------
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339})

	// ---- Config ------------------------------------------------------------
	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("main: failed to load config")
	}

	logLevel, _ := zerolog.ParseLevel(cfg.LogLevel)
	if logLevel == zerolog.NoLevel {
		logLevel = zerolog.InfoLevel
	}
	zerolog.SetGlobalLevel(logLevel)

	// ---- Session Store (SQLite) --------------------------------------------
	container, err := store.OpenContainer(cfg.DBPath)
	if err != nil {
		log.Fatal().Err(err).Str("path", cfg.DBPath).Msg("main: failed to open session store")
	}

	// ---- WhatsApp Client ---------------------------------------------------
	waClient, err := wa.NewWAClient(container)
	if err != nil {
		log.Fatal().Err(err).Msg("main: failed to start WhatsApp client")
	}
	defer waClient.Disconnect()

	// ---- Handlers ----------------------------------------------------------
	sendH   := handler.NewSendHandler(waClient)
	statusH := handler.NewStatusHandler(waClient)
	qrH     := handler.NewQRHandler(waClient)

	// ---- Router ------------------------------------------------------------
	if cfg.DevMode {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Recovery())

	authMiddleware := handler.RequireAPIKey(cfg.APIKey)

	r.POST("/send",   authMiddleware, sendH.Send)
	r.GET("/status",  statusH.Status)
	r.GET("/qr",      qrH.QR)
	r.GET("/healthz", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })

	// ---- Server ------------------------------------------------------------
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		log.Info().Str("port", cfg.Port).Msg("main: whatsapp_service starting")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("main: server error")
		}
	}()

	<-ctx.Done()
	log.Info().Msg("main: shutdown signal received")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error().Err(err).Msg("main: shutdown error")
	}
	log.Info().Msg("main: exited cleanly")
}
