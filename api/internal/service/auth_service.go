package service

import (
	"errors"
	"fmt"
	"regexp"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/shashankrajput/ngo-platform/api/internal/config"
	"github.com/shashankrajput/ngo-platform/api/internal/models"
	"github.com/shashankrajput/ngo-platform/api/internal/repository"
	"gorm.io/gorm"
	"time"
)

var phoneRegex = regexp.MustCompile(`^[6-9]\d{9}$`)

// AuthService handles OTP login and JWT issuance.
type AuthService struct {
	userRepo *repository.UserRepository
	otpSvc   *OTPService
	cfg      *config.Config
}

// NewAuthService constructs an AuthService.
func NewAuthService(userRepo *repository.UserRepository, otpSvc *OTPService, cfg *config.Config) *AuthService {
	return &AuthService{userRepo: userRepo, otpSvc: otpSvc, cfg: cfg}
}

// SendOTP validates phone and sends OTP.
func (s *AuthService) SendOTP(phone string) error {
	if !phoneRegex.MatchString(phone) {
		return fmt.Errorf("invalid Indian phone number")
	}
	return s.otpSvc.Send(phone)
}

// VerifyOTP verifies OTP, upserts user, returns JWT + user.
func (s *AuthService) VerifyOTP(phone, code string) (string, *models.User, error) {
	if err := s.otpSvc.Verify(phone, code); err != nil {
		return "", nil, err
	}

	user, err := s.userRepo.FindByPhone(phone)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// First login — auto-register
			role := "user"
			if phone == s.cfg.AdminPhone {
				role = "admin"
			}
			user = &models.User{
				Phone:    phone,
				Role:     role,
				JoinedAt: time.Now(),
				IsActive: true,
			}
			if err := s.userRepo.Create(user); err != nil {
				return "", nil, fmt.Errorf("auth: failed to create user: %w", err)
			}
			log.Info().Str("phone", phone).Str("role", role).Msg("auth: new user registered")
		} else {
			return "", nil, fmt.Errorf("auth: db error: %w", err)
		}
	}

	token, err := s.signJWT(user)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

// SeedAdmin ensures the admin phone has an admin user on first startup.
func (s *AuthService) SeedAdmin() {
	if s.cfg.AdminPhone == "" {
		return
	}
	_, err := s.userRepo.FindByPhone(s.cfg.AdminPhone)
	if err == nil {
		return // already exists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		log.Error().Err(err).Msg("auth: seed admin DB error")
		return
	}

	admin := &models.User{
		Phone:    s.cfg.AdminPhone,
		Name:     s.cfg.AdminName,
		Role:     "admin",
		JoinedAt: time.Now(),
		IsActive: true,
	}
	if err := s.userRepo.Create(admin); err != nil {
		log.Error().Err(err).Msg("auth: failed to seed admin")
		return
	}
	log.Info().Str("phone", s.cfg.AdminPhone).Msg("auth: admin user seeded")
}

// JWTClaims holds the claims embedded in the JWT.
type JWTClaims struct {
	UserID string `json:"userId"`
	Phone  string `json:"phone"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func (s *AuthService) signJWT(user *models.User) (string, error) {
	claims := JWTClaims{
		UserID: user.ID.String(),
		Phone:  user.Phone,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(s.cfg.JWTExpiryHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ID:        uuid.New().String(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

// ParseJWT validates a token string and returns its claims.
func (s *AuthService) ParseJWT(tokenStr string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &JWTClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(s.cfg.JWTSecret), nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*JWTClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	return claims, nil
}
