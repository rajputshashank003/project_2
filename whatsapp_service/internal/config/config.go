package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

// Config holds all environment-driven configuration for whatsapp_service.
type Config struct {
	Port     string // HTTP server port (default "8080")
	DBPath   string // SQLite path for WhatsApp session (default "store/whatsapp.db")
	DevMode  bool   // if true, log sends instead of actually sending
	LogLevel string // "debug" | "info" | "warn" | "error"
}

// Load reads .env (if present) then environment variables.
func Load() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{
		Port:     getEnv("PORT", "8080"),
		DBPath:   getEnv("WHATSAPP_DB_PATH", "store/whatsapp.db"),
		DevMode:  getEnv("DEV_MODE", "false") == "true",
		LogLevel: getEnv("LOG_LEVEL", "info"),
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func mustGetEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		panic(fmt.Sprintf("required environment variable %q is not set", key))
	}
	return v
}
