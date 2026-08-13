package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

const RequestIDKey = "requestId"

// RequestID generates a UUID per request, sets it as X-Request-ID response header,
// and injects a zerolog logger with the request_id field into the gin context.
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		reqID := c.GetHeader("X-Request-ID")
		if reqID == "" {
			reqID = uuid.New().String()
		}
		c.Set(RequestIDKey, reqID)
		c.Header("X-Request-ID", reqID)

		// Inject logger with request_id into context
		logger := log.With().Str("request_id", reqID).Logger()
		c.Set("logger", logger)

		c.Next()
	}
}

// GetLogger retrieves the request-scoped zerolog.Logger from gin context.
func GetLogger(c *gin.Context) zerolog.Logger {
	if l, ok := c.Get("logger"); ok {
		if logger, ok := l.(zerolog.Logger); ok {
			return logger
		}
	}
	return log.Logger
}
