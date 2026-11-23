// Simple, forward-only migration runner for Phase 1. Run from the backend directory.
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/example/eneba-marketplace/backend/internal/config"
	"github.com/jackc/pgx/v5"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	conn, err := pgx.Connect(ctx, config.Load().DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close(context.Background())
	if _, err := conn.Exec(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`); err != nil {
		log.Fatal(err)
	}
	entries, err := os.ReadDir("migrations")
	if err != nil {
		log.Fatal("run from backend/: ", err)
	}
	var filenames []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".up.sql") {
			filenames = append(filenames, e.Name())
		}
	}
	sort.Strings(filenames)
	for _, name := range filenames {
		var present bool
		if err := conn.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE filename=$1)`, name).Scan(&present); err != nil {
			log.Fatal(err)
		}
		if present {
			log.Printf("skip %s (already applied)", name)
			continue
		}
		sqlBytes, err := os.ReadFile(filepath.Join("migrations", name))
		if err != nil {
			log.Fatal(err)
		}
		tx, err := conn.Begin(ctx)
		if err != nil {
			log.Fatal(err)
		}
		if _, err := tx.Exec(ctx, string(sqlBytes)); err != nil {
			_ = tx.Rollback(ctx)
			log.Fatal(fmt.Errorf("migration %s: %w", name, err))
		}
		if _, err := tx.Exec(ctx, `INSERT INTO schema_migrations(filename) VALUES ($1)`, name); err != nil {
			_ = tx.Rollback(ctx)
			log.Fatal(err)
		}
		if err := tx.Commit(ctx); err != nil {
			log.Fatal(err)
		}
		log.Printf("applied %s", name)
	}
}
