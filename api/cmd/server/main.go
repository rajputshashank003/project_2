package main

import (
	"context"
	"net/http"
	"os"
	"syscall"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/shashankrajput/ngo-platform/api/internal/config"
	"github.com/shashankrajput/ngo-platform/api/internal/database"
	"github.com/shashankrajput/ngo-platform/api/internal/repository"
	"github.com/shashankrajput/ngo-platform/api/internal/routes"
	"github.com/shashankrajput/ngo-platform/api/internal/service"
	"os/signal"
)

func main() {
	// ---- Logging -----------------------------------------------------------
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	logLevel, _ := zerolog.ParseLevel(os.Getenv("LOG_LEVEL"))
	if logLevel == zerolog.NoLevel {
		logLevel = zerolog.InfoLevel
	}
	zerolog.SetGlobalLevel(logLevel)
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339})

	// ---- Config ------------------------------------------------------------
	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("main: failed to load config")
	}

	// ---- Database ----------------------------------------------------------
	db := database.Connect(cfg)

	// ---- Repositories ------------------------------------------------------
	userRepo := repository.NewUserRepository(db)
	otpRepo := repository.NewOTPRepository(db)
	donationRepo := repository.NewDonationRepository(db)
	idCardRepo := repository.NewIDCardRepository(db)
	noticeRepo := repository.NewNoticeRepository(db)
	galleryRepo := repository.NewGalleryRepository(db)
	eventRepo := repository.NewEventRepository(db)
	teamRepo := repository.NewTeamRepository(db)
	ngoRepo := repository.NewOrgSettingsRepository(db)
	idempotencyRepo := repository.NewIdempotencyRepository(db)

	// ---- External services -------------------------------------------------
	cloudinarySvc     := service.NewCloudinaryService(cfg)
	smsSvc            := service.NewSMSService(cfg)
	emailSvc          := service.NewEmailService(cfg)
	whatsappTwilioSvc := service.NewWhatsAppTwilioService(cfg)
	whatsappLocalSvc  := service.NewWhatsAppLocalService(cfg)

	// MultiMessenger routes to the correct channel based on MESSAGING_TYPE env var
	messenger := service.NewMultiMessenger(smsSvc, whatsappTwilioSvc, whatsappLocalSvc, cfg.MessagingType)
	log.Info().Str("messagingType", cfg.MessagingType).Str("appBaseURL", cfg.AppBaseURL).Msg("main: messaging configured")

	// ---- Domain services ---------------------------------------------------
	otpSvc      := service.NewOTPService(otpRepo, messenger, cfg)
	authSvc     := service.NewAuthService(userRepo, otpSvc, cfg)
	donationSvc := service.NewDonationService(donationRepo, ngoRepo, cloudinarySvc, messenger, emailSvc, cfg.AppBaseURL)
	idCardSvc   := service.NewIDCardService(idCardRepo, ngoRepo, cloudinarySvc, messenger, emailSvc, cfg.AppBaseURL)
	noticeSvc   := service.NewNoticeService(noticeRepo, cloudinarySvc)
	gallerySvc  := service.NewGalleryService(galleryRepo, cloudinarySvc)
	eventSvc    := service.NewEventService(eventRepo, cloudinarySvc)
	teamSvc     := service.NewTeamService(teamRepo, cloudinarySvc)
	ngoSvc      := service.NewNgoService(ngoRepo, cloudinarySvc)
	userSvc     := service.NewUserService(userRepo)

	// ---- Seed admin user ---------------------------------------------------
	authSvc.SeedAdmin()

	// ---- Graceful shutdown context -----------------------------------------
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	// ---- Idempotency cleanup goroutine (hourly) ----------------------------
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				if err := idempotencyRepo.Cleanup(); err != nil {
					log.Error().Err(err).Msg("main: idempotency cleanup failed")
				} else {
					log.Info().Msg("main: idempotency keys cleaned up")
				}
			case <-ctx.Done():
				log.Info().Msg("main: idempotency cleanup goroutine stopped")
				return
			}
		}
	}()

	// ---- HTTP router -------------------------------------------------------
	bodyLimitBytes := cfg.BodyLimitMB * 1024 * 1024
	router := routes.Setup(
		db,
		authSvc, donationSvc, idCardSvc, noticeSvc,
		gallerySvc, eventSvc, teamSvc, ngoSvc, userSvc,
		smsSvc, emailSvc, whatsappTwilioSvc, whatsappLocalSvc,
		userRepo, idempotencyRepo,
		bodyLimitBytes,
	)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// ---- Start server ------------------------------------------------------
	go func() {
		log.Info().Str("port", cfg.Port).Msg("main: server starting")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("main: server error")
		}
	}()

	// ---- Wait for shutdown signal ------------------------------------------
	<-ctx.Done()
	log.Info().Msg("main: shutdown signal received")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error().Err(err).Msg("main: server shutdown error")
	}

	if sqlDB, err := db.DB(); err == nil {
		sqlDB.Close()
	}

	log.Info().Msg("main: server exited cleanly")
}
