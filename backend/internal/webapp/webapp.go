// Package webapp serves the compiled SPA alongside the REST API on one origin.
package webapp

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// Wrap leaves API/health requests untouched and serves only the built public
// assets or index.html for SPA routes. Other filesystem files are never exposed.
func Wrap(api http.Handler, publicDir string) http.Handler {
	if publicDir == "" {
		return api
	} // Vite dev server serves the frontend locally.
	assets := http.FileServer(http.Dir(filepath.Join(publicDir, "assets")))
	publicFiles := http.FileServer(http.Dir(publicDir))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		if strings.HasPrefix(r.URL.Path, "/api/") || r.URL.Path == "/api" || strings.HasPrefix(r.URL.Path, "/health/") {
			api.ServeHTTP(w, r)
			return
		}
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		if strings.HasPrefix(r.URL.Path, "/assets/") {
			if strings.Contains(r.URL.Path, "..") {
				http.NotFound(w, r)
				return
			}
			http.StripPrefix("/assets/", assets).ServeHTTP(w, r)
			return
		}
		// Vite copies frontend/public/ directly into dist; allow only known asset folders.
		if strings.HasPrefix(r.URL.Path, "/shortcut-icons/") || strings.HasPrefix(r.URL.Path, "/category-icons/") || strings.HasPrefix(r.URL.Path, "/demo-gift-cards/") {
			publicFiles.ServeHTTP(w, r)
			return
		}
		if r.URL.Path == "/favicon.ico" {
			http.ServeFile(w, r, filepath.Join(publicDir, "favicon.ico"))
			return
		}
		// A missing file with an extension is not an SPA route.
		if filepath.Ext(r.URL.Path) != "" {
			http.NotFound(w, r)
			return
		}
		if _, err := os.Stat(filepath.Join(publicDir, "index.html")); err != nil {
			http.Error(w, "frontend build unavailable", http.StatusServiceUnavailable)
			return
		}
		w.Header().Set("Cache-Control", "no-cache")
		http.ServeFile(w, r, filepath.Join(publicDir, "index.html"))
	})
}
