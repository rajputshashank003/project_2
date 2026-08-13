package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/shashankrajput/ngo-platform/api/internal/repository"
	"github.com/shashankrajput/ngo-platform/api/internal/service"
)

const (
	AuthUserIDKey   = "authUserId"
	AuthUserRoleKey = "authUserRole"
	AuthUserNameKey = "authUserName"
)

// Auth validates the Bearer JWT and sets user info into the gin context.
func Auth(authSvc *service.AuthService, userRepo *repository.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": gin.H{"code": "UNAUTHORIZED", "message": "Missing or invalid Authorization header"},
			})
			return
		}

		tokenStr := strings.TrimPrefix(header, "Bearer ")
		claims, err := authSvc.ParseJWT(tokenStr)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": gin.H{"code": "INVALID_TOKEN", "message": "Token is invalid or expired"},
			})
			return
		}

		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": gin.H{"code": "INVALID_TOKEN", "message": "Invalid user ID in token"},
			})
			return
		}

		// Load fresh user from DB (picks up role changes since token was issued)
		user, err := userRepo.FindByID(userID)
		if err != nil || !user.IsActive {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": gin.H{"code": "UNAUTHORIZED", "message": "User not found or inactive"},
			})
			return
		}

		c.Set(AuthUserIDKey, user.ID)
		c.Set(AuthUserRoleKey, user.Role)
		c.Set(AuthUserNameKey, user.Name)

		c.Next()
	}
}
