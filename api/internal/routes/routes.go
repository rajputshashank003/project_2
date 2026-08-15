package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/shashankrajput/ngo-platform/api/internal/handler"
	"github.com/shashankrajput/ngo-platform/api/internal/middleware"
	"github.com/shashankrajput/ngo-platform/api/internal/repository"
	"github.com/shashankrajput/ngo-platform/api/internal/service"
	"gorm.io/gorm"
)

// Setup wires all routes onto the gin Engine and returns it.
func Setup(
	db *gorm.DB,
	authSvc *service.AuthService,
	donationSvc *service.DonationService,
	idCardSvc *service.IDCardService,
	noticeSvc *service.NoticeService,
	gallerySvc *service.GalleryService,
	eventSvc *service.EventService,
	teamSvc *service.TeamService,
	ngoSvc *service.NgoService,
	userSvc *service.UserService,
	smsSvc *service.SMSService,
	emailSvc *service.EmailService,
	whatsappTwilioSvc *service.WhatsAppTwilioService,
	whatsappLocalSvc *service.WhatsAppLocalService,
	userRepo *repository.UserRepository,
	idempotencyRepo *repository.IdempotencyRepository,
	bodyLimitBytes int64,
) *gin.Engine {
	r := gin.New()

	// ---- Global middleware --------------------------------------------------
	r.Use(middleware.RequestID())
	r.Use(gin.Recovery())
	r.Use(middleware.BodyLimit(bodyLimitBytes))
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type", "X-Request-ID", "Idempotency-Key"},
		ExposeHeaders:    []string{"X-Request-ID"},
		AllowCredentials: false,
	}))

	// ---- Handlers ----------------------------------------------------------
	authH := handler.NewAuthHandler(authSvc)
	donationH := handler.NewDonationHandler(donationSvc, idempotencyRepo)
	idCardH := handler.NewIDCardHandler(idCardSvc, idempotencyRepo)
	noticeH := handler.NewNoticeHandler(noticeSvc)
	galleryH := handler.NewGalleryHandler(gallerySvc)
	eventH := handler.NewEventHandler(eventSvc)
	teamH := handler.NewTeamHandler(teamSvc)
	ngoH := handler.NewNgoHandler(ngoSvc)
	userH := handler.NewUserHandler(userSvc)
	notifyH := handler.NewNotifyHandler(smsSvc, emailSvc, whatsappTwilioSvc, whatsappLocalSvc)
	healthH := handler.NewHealthHandler(db)

	// ---- Infra routes (no version prefix) ----------------------------------
	r.GET("/healthz", healthH.Liveness)
	r.GET("/readyz", healthH.Readiness)

	// ---- API v1 routes -----------------------------------------------------
	v1 := r.Group("/api/v1")

	// Auth (public)
	auth := v1.Group("/auth")
	{
		auth.POST("/send-otp", authH.SendOTP)
		auth.POST("/verify-otp", authH.VerifyOTP)
	}

	// NGO config
	ngo := v1.Group("/ngo")
	{
		ngo.GET("/config", ngoH.GetConfig)
		ngo.PATCH("/config", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), ngoH.UpdateConfig)
	}

	// Notices
	notices := v1.Group("/notices")
	{
		notices.GET("", noticeH.List)
		notices.POST("", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), noticeH.Create)
		notices.PATCH("/:id", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), noticeH.Update)
		notices.DELETE("/:id", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), noticeH.Delete)
	}

	// Gallery
	gallery := v1.Group("/gallery")
	{
		gallery.GET("", galleryH.List)
		gallery.POST("", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), galleryH.Upload)
		gallery.DELETE("/:id", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), galleryH.Delete)
	}

	// Events
	events := v1.Group("/events")
	{
		events.GET("", eventH.List)
		events.POST("", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), eventH.Create)
		events.PATCH("/:id", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), eventH.Update)
		events.DELETE("/:id", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), eventH.Delete)
	}

	// Team
	team := v1.Group("/team")
	{
		team.GET("", teamH.List)
		team.POST("/add-slot", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), teamH.AddSlot)
		team.PATCH("/:slot", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), teamH.UpdateSlot)
		team.PATCH("/:slot/clear", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), teamH.ClearSlot)
		team.DELETE("/slot/:slot", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), teamH.RemoveSlot)
	}

	// Donations
	donations := v1.Group("/donations")
	{
		donations.GET("", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), donationH.List)
		donations.GET("/:id", middleware.Auth(authSvc, userRepo), donationH.GetByID)
		donations.POST("", middleware.Auth(authSvc, userRepo), donationH.Create)
		donations.PATCH("/:id/status", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), donationH.UpdateStatus)
	}

	// ID Cards
	idCards := v1.Group("/id-cards")
	{
		idCards.GET("", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), idCardH.List)
		idCards.GET("/:id", middleware.Auth(authSvc, userRepo), idCardH.GetByID)
		idCards.POST("", middleware.Auth(authSvc, userRepo), idCardH.Create)
		idCards.PATCH("/:id/status", middleware.Auth(authSvc, userRepo), middleware.AdminOnly(), idCardH.UpdateStatus)
	}

	// Users
	users := v1.Group("/users")
	users.Use(middleware.Auth(authSvc, userRepo), middleware.AdminOnly())
	{
		users.GET("", userH.List)
		users.PATCH("/:id", userH.Update)
		users.PATCH("/:id/promote", userH.Promote)
		users.PATCH("/:id/demote", userH.Demote)
	}

	// Notifications (manual)
	notify := v1.Group("/notify")
	notify.Use(middleware.Auth(authSvc, userRepo))
	{
		notify.POST("/sms", notifyH.SendSMS)
		notify.POST("/email", notifyH.SendEmail)
		notify.POST("/whatsapp_twilio", notifyH.SendWhatsAppTwilio)
		notify.POST("/whatsapp_local", notifyH.SendWhatsAppLocal)
	}

	return r
}
