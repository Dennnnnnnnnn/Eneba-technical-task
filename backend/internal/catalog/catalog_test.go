package catalog

import "testing"

func TestSortExprIsWhitelisted(t *testing.T) {
	tests := map[string]string{
		"price_asc":           "min_price_cents ASC, p.title ASC",
		"price_desc":          "min_price_cents DESC, p.title ASC",
		"name_desc":           "p.title DESC",
		"relevance":           "relevance DESC, p.title ASC",
		"DROP TABLE products": "p.title ASC",
		"":                    "p.title ASC",
	}
	for input, want := range tests {
		if got := SortExpr(input); got != want {
			t.Errorf("SortExpr(%q) = %q, want %q", input, got, want)
		}
	}
}
func TestNormalizePagination(t *testing.T) {
	for _, tc := range []struct{ page, size, wantPage, wantSize int }{{0, 0, 1, 12}, {2, 10, 2, 10}, {4, 100, 4, 48}, {-1, -5, 1, 12}} {
		p, s := NormalizePagination(tc.page, tc.size)
		if p != tc.wantPage || s != tc.wantSize {
			t.Errorf("NormalizePagination(%d,%d) = %d,%d", tc.page, tc.size, p, s)
		}
	}
}
