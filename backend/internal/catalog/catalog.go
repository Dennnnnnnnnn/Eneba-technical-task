package catalog

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Product struct {
	ID            int64  `json:"id"`
	Slug          string `json:"slug"`
	Title         string `json:"title"`
	Description   string `json:"description"`
	Platform      string `json:"platform"`
	CoverColor    string `json:"coverColor"`
	CoverImageURL string `json:"coverImageUrl"`
	MinPriceCents int64  `json:"minPriceCents"`
	Currency      string `json:"currency"`
	OfferCount    int64  `json:"offerCount"`
}

type Filters struct {
	Query    string
	Platform string
	Sort     string
}

var ErrNotFound = errors.New("product not found")

type Repository struct{ pool *pgxpool.Pool }

func NewRepository(pool *pgxpool.Pool) *Repository { return &Repository{pool: pool} }

// SortExpr returns only server-owned SQL, never interpolated user input.
func SortExpr(sort string) string {
	switch sort {
	case "price_asc":
		return "min_price_cents ASC, p.title ASC"
	case "price_desc":
		return "min_price_cents DESC, p.title ASC"
	case "name_desc":
		return "p.title DESC"
	default:
		return "p.title ASC"
	}
}

const baseSelect = `
SELECT p.id, p.slug, p.title, p.description, p.platform, p.cover_color, p.cover_image_url,
       COALESCE(MIN(o.price_cents), 0)::bigint AS min_price_cents,
       COALESCE(MIN(o.currency), 'EUR') AS currency,
       COUNT(o.id)::bigint AS offer_count
FROM products p
JOIN offers o ON o.product_id = p.id AND o.active = TRUE
`

func (r *Repository) List(ctx context.Context, f Filters) ([]Product, error) {
	query := baseSelect + `
WHERE ($1 = '' OR p.title ILIKE '%' || $1 || '%')
  AND ($2 = '' OR LOWER(p.platform) = LOWER($2))
GROUP BY p.id
ORDER BY ` + SortExpr(f.Sort) + ` LIMIT 60`
	rows, err := r.pool.Query(ctx, query, strings.TrimSpace(f.Query), strings.TrimSpace(f.Platform))
	if err != nil {
		return nil, fmt.Errorf("list products: %w", err)
	}
	defer rows.Close()
	products := make([]Product, 0)
	for rows.Next() {
		var p Product
		if err := rows.Scan(&p.ID, &p.Slug, &p.Title, &p.Description, &p.Platform, &p.CoverColor, &p.CoverImageURL, &p.MinPriceCents, &p.Currency, &p.OfferCount); err != nil {
			return nil, fmt.Errorf("scan product: %w", err)
		}
		products = append(products, p)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate products: %w", err)
	}
	return products, nil
}

func (r *Repository) BySlug(ctx context.Context, slug string) (Product, error) {
	query := baseSelect + ` WHERE p.slug = $1 GROUP BY p.id`
	var p Product
	err := r.pool.QueryRow(ctx, query, slug).Scan(&p.ID, &p.Slug, &p.Title, &p.Description, &p.Platform, &p.CoverColor, &p.CoverImageURL, &p.MinPriceCents, &p.Currency, &p.OfferCount)
	if errors.Is(err, pgx.ErrNoRows) {
		return Product{}, ErrNotFound
	}
	if err != nil {
		return Product{}, fmt.Errorf("get product: %w", err)
	}
	return p, nil
}
