package catalog

import "testing"

func TestSortExprIsWhitelisted(t *testing.T) {
	tests := map[string]string{
		"price_asc":           "min_price_cents ASC, p.title ASC",
		"price_desc":          "min_price_cents DESC, p.title ASC",
		"name_desc":           "p.title DESC",
		"DROP TABLE products": "p.title ASC",
		"":                    "p.title ASC",
	}
	for input, want := range tests {
		if got := SortExpr(input); got != want {
			t.Errorf("SortExpr(%q) = %q, want %q", input, got, want)
		}
	}
}
