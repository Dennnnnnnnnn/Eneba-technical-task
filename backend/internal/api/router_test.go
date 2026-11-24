package api

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/example/eneba-marketplace/backend/internal/catalog"
)

type fakeCatalog struct{ calls int }

func (f *fakeCatalog) List(_ context.Context, filters catalog.Filters) (catalog.Page, error) {
	f.calls++
	return catalog.Page{}, nil
}
func (f *fakeCatalog) BySlug(_ context.Context, slug string) (catalog.Product, error) {
	return catalog.Product{}, catalog.ErrNotFound
}
func (f *fakeCatalog) OffersBySlug(_ context.Context, slug string) ([]catalog.Offer, error) {
	return nil, catalog.ErrNotFound
}
func TestBadCatalogQueries(t *testing.T) {
	repo := &fakeCatalog{}
	router := NewRouter(nil, repo, "http://localhost:5173")
	for _, url := range []string{
		"/api/v1/products?page=0", "/api/v1/products?page=bad",
		"/api/v1/products?pageSize=-1", "/api/v1/products?minPriceCents=invalid",
		"/api/v1/products?minPriceCents=200&maxPriceCents=100",
		"/api/v1/search?page=0",
	} {
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, httptest.NewRequest("GET", url, nil))
		if rr.Code != 400 {
			t.Errorf("%s got %d want 400", url, rr.Code)
		}
	}
	if repo.calls != 0 {
		t.Errorf("repository called %d times for invalid filters", repo.calls)
	}
}
func TestUnknownProductIs404(t *testing.T) {
	router := NewRouter(nil, &fakeCatalog{}, "http://localhost:5173")
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, httptest.NewRequest("GET", "/api/v1/products/missing", nil))
	if rr.Code != http.StatusNotFound {
		t.Fatalf("got %d", rr.Code)
	}
	var result map[string]any
	if err := json.Unmarshal(rr.Body.Bytes(), &result); err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(result["error"].(string), "not found") {
		t.Fatal(result)
	}
}
func TestOriginPolicyForMutations(t *testing.T) {
	router := NewRouter(nil, &fakeCatalog{}, "https://example.com")
	rr := httptest.NewRecorder()
	req := httptest.NewRequest("POST", "/api/v1/auth/logout", strings.NewReader("{}"))
	req.Header.Set("Origin", "https://untrusted.example")
	router.ServeHTTP(rr, req)
	if rr.Code != 403 {
		t.Fatalf("got %d want 403", rr.Code)
	}
}

func TestSameOriginAcceptedOnDeployedHost(t *testing.T) {
	req := httptest.NewRequest("POST", "https://internship-demo.onrender.com/api/v1/auth/logout", nil)
	req.Header.Set("Origin", "https://internship-demo.onrender.com")
	if !allowedMutationOrigin(req.Header.Get("Origin"), req, "http://localhost:5173") {
		t.Fatal("deployed same-origin request rejected")
	}
	req.Header.Set("Origin", "https://evil.example")
	if allowedMutationOrigin(req.Header.Get("Origin"), req, "http://localhost:5173") {
		t.Fatal("foreign origin accepted")
	}
}
