package middleware

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

// BodyLimit caps the request body at maxBytes using http.MaxBytesReader.
// Requests exceeding the limit are rejected with 413 before reaching any handler.
func BodyLimit(maxBytes int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxBytes)
		c.Next()
		if c.Request.Body != nil {
			_, _ = io.Copy(io.Discard, c.Request.Body)
		}
	}
}
