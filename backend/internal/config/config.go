package config

import "os"

type Config struct {
	DatabaseURL string
	Port        string
	CORSOrigin  string
}

func Load() Config {
	return Config{
		DatabaseURL: env("DATABASE_URL", "postgres://marketplace:marketplace_dev_only@localhost:5432/marketplace?sslmode=disable"),
		Port:        env("PORT", "8080"),
		CORSOrigin:  env("CORS_ORIGIN", "http://localhost:5173"),
	}
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
