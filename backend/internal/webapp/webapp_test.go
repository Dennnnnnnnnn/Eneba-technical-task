package webapp

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestWrap(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "index.html"), []byte("<h1>app</h1>"), 0600); err != nil {
		t.Fatal(err)
	}
	if err := os.Mkdir(filepath.Join(dir, "assets"), 0700); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "assets", "app.js"), []byte("console.log(1)"), 0600); err != nil {
		t.Fatal(err)
	}
	if err := os.Mkdir(filepath.Join(dir, "shortcut-icons"), 0700); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "shortcut-icons", "games.svg"), []byte("<svg></svg>"), 0600); err != nil {
		t.Fatal(err)
	}
	handler := Wrap(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(202) }), dir)
	for _, tc := range []struct {
		path, method string
		status       int
		body         string
	}{
		{"/", "GET", 200, "<h1>app</h1>"}, {"/orders/12", "GET", 200, "<h1>app</h1>"},
		{"/assets/app.js", "GET", 200, "console.log(1)"},
		{"/shortcut-icons/games.svg", "GET", 200, "<svg>"}, {"/api/v1/products", "GET", 202, ""},
		{"/health/live", "GET", 202, ""}, {"/assets/missing.js", "GET", 404, ""},
		{"/secret.env", "GET", 404, ""}, {"/", "POST", 405, ""},
	} {
		t.Run(tc.path+tc.method, func(t *testing.T) {
			rr := httptest.NewRecorder()
			req := httptest.NewRequest(tc.method, tc.path, nil)
			handler.ServeHTTP(rr, req)
			if rr.Code != tc.status {
				t.Fatalf("status %d want %d", rr.Code, tc.status)
			}
			if tc.body != "" && !strings.Contains(rr.Body.String(), tc.body) {
				t.Fatalf("body %q missing %q", rr.Body.String(), tc.body)
			}
		})
	}
}
