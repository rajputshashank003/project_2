package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// AdminOnly rejects requests where the authenticated user's role is not "admin".
// Must be used after the Auth middleware.
func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get(AuthUserRoleKey)
		if role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": gin.H{"code": "FORBIDDEN", "message": "Admin access required"},
			})
			return
		}
		c.Next()
	}
}
