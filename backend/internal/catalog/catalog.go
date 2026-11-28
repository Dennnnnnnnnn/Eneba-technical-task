package catalog

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Product is the catalog record sent to React; seller-specific prices are
// represented separately as offers. Money is stored in integer cents.
type Product struct {
	ID              int64  `json:"id"`
	Slug            string `json:"slug"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	Platform        string `json:"platform"`
	CoverColor      string `json:"coverColor"`
	CoverImageURL   string `json:"coverImageUrl"`
	MinPriceCents   int64  `json:"minPriceCents"`
	Currency        string `json:"currency"`
	OfferCount      int64  `json:"offerCount"`
	Region          string `json:"region"`
	CashbackPercent int    `json:"cashbackPercent"`
}

type Offer struct {
	ID         int64  `json:"id"`
	SellerID   int64  `json:"sellerId"`
	SellerName string `json:"sellerName"`
	Region     string `json:"region"`
	PriceCents int64  `json:"priceCents"`
	Currency   string `json:"currency"`
}

type Filters struct {
	Query         string
	Platform      string
	Region        string
	Sort          string
	MinPriceCents *int64
	MaxPriceCents *int64
	Page          int
	PageSize      int
}

type Page struct {
	Items      []Product `json:"items"`
	Total      int64     `json:"total"`
	Page       int       `json:"page"`
	PageSize   int       `json:"pageSize"`
	TotalPages int64     `json:"totalPages"`
}

var ErrNotFound = errors.New("product not found")

// Repository reads catalog and offer data from PostgreSQL.
type Repository struct{ pool *pgxpool.Pool }

func NewRepository(pool *pgxpool.Pool) *Repository { return &Repository{pool: pool} }

// SortExpr is an allowlist; user-controlled SQL fragments are never interpolated.
func SortExpr(sort string) string {
	switch sort {
	case "price_asc":
		return "min_price_cents ASC, p.title ASC"
	case "price_desc":
		return "min_price_cents DESC, p.title ASC"
	case "name_desc":
		return "p.title DESC"
	case "relevance":
		return "relevance DESC, p.title ASC"
	default:
		return "p.title ASC"
	}
}

func NormalizePagination(page, pageSize int) (int, int) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 12
	}
	if pageSize > 48 {
		pageSize = 48
	}
	return page, pageSize
}

const selectProduct = `p.id,p.slug,p.title,p.description,p.platform,p.cover_color,p.cover_image_url,
 COALESCE(MIN(o.price_cents),0)::bigint AS min_price_cents,
 COALESCE(MIN(o.currency),'EUR') AS currency, COUNT(o.id)::bigint AS offer_count,
 (ARRAY_AGG(o.region ORDER BY o.price_cents,o.id))[1] AS lowest_region, p.cashback_percent`

func scanProduct(row pgx.Row) (Product, error) {
	var p Product
	err := row.Scan(&p.ID, &p.Slug, &p.Title, &p.Description, &p.Platform, &p.CoverColor, &p.CoverImageURL, &p.MinPriceCents, &p.Currency, &p.OfferCount, &p.Region, &p.CashbackPercent)
	return p, err
}

// Filter by price on individual eligible offers, then compute the lowest eligible price.
// pg_trgm similarity handles misspellings; ILIKE handles ordinary partial names.
const filtered = `
 FROM products p JOIN offers o ON o.product_id=p.id AND o.active=TRUE
 WHERE ($1='' OR p.title ILIKE '%' || $1 || '%' OR similarity(p.title,$1) >= 0.20)
 AND ($2='' OR LOWER(p.platform)=LOWER($2))
 AND ($3='' OR UPPER(o.region)=UPPER($3))
 AND ($4::bigint IS NULL OR o.price_cents >= $4)
 AND ($5::bigint IS NULL OR o.price_cents <= $5)
`

func (r *Repository) List(ctx context.Context, f Filters) (Page, error) {
	f.Page, f.PageSize = NormalizePagination(f.Page, f.PageSize)
	q := strings.TrimSpace(f.Query)
	args := []any{q, strings.TrimSpace(f.Platform), strings.TrimSpace(f.Region), f.MinPriceCents, f.MaxPriceCents}
	var total int64
	err := r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM (SELECT p.id `+filtered+` GROUP BY p.id) x`, args...).Scan(&total)
	if err != nil {
		return Page{}, fmt.Errorf("count products: %w", err)
	}
	sql := `SELECT ` + selectProduct + `, CASE WHEN $1='' THEN 0 ELSE similarity(p.title,$1) END AS relevance ` + filtered + `
 GROUP BY p.id ORDER BY ` + SortExpr(f.Sort) + ` LIMIT $6 OFFSET $7`
	args = append(args, f.PageSize, (f.Page-1)*f.PageSize)
	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		return Page{}, fmt.Errorf("list products: %w", err)
	}
	defer rows.Close()
	products := make([]Product, 0)
	for rows.Next() {
		var p Product
		var relevance float64
		if err = rows.Scan(&p.ID, &p.Slug, &p.Title, &p.Description, &p.Platform, &p.CoverColor, &p.CoverImageURL, &p.MinPriceCents, &p.Currency, &p.OfferCount, &p.Region, &p.CashbackPercent, &relevance); err != nil {
			return Page{}, fmt.Errorf("scan product: %w", err)
		}
		products = append(products, p)
	}
	if err = rows.Err(); err != nil {
		return Page{}, fmt.Errorf("iterate products: %w", err)
	}
	return Page{Items: products, Total: total, Page: f.Page, PageSize: f.PageSize, TotalPages: (total + int64(f.PageSize) - 1) / int64(f.PageSize)}, nil
}

func (r *Repository) BySlug(ctx context.Context, slug string) (Product, error) {
	p, err := scanProduct(r.pool.QueryRow(ctx, `SELECT `+selectProduct+` FROM products p JOIN offers o ON o.product_id=p.id AND o.active=TRUE WHERE p.slug=$1 GROUP BY p.id`, slug))
	if errors.Is(err, pgx.ErrNoRows) {
		return Product{}, ErrNotFound
	}
	if err != nil {
		return Product{}, fmt.Errorf("get product: %w", err)
	}
	return p, nil
}

func (r *Repository) OffersBySlug(ctx context.Context, slug string) ([]Offer, error) {
	var exists bool
	if err := r.pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM products WHERE slug=$1)`, slug).Scan(&exists); err != nil {
		return nil, err
	}
	if !exists {
		return nil, ErrNotFound
	}
	rows, err := r.pool.Query(ctx, `SELECT o.id,s.id,s.name,o.region,o.price_cents,o.currency
 FROM offers o JOIN sellers s ON s.id=o.seller_id JOIN products p ON p.id=o.product_id
 WHERE p.slug=$1 AND o.active=TRUE ORDER BY o.price_cents ASC,o.id ASC`, slug)
	if err != nil {
		return nil, fmt.Errorf("list offers: %w", err)
	}
	defer rows.Close()
	offers := make([]Offer, 0)
	for rows.Next() {
		var o Offer
		if err = rows.Scan(&o.ID, &o.SellerID, &o.SellerName, &o.Region, &o.PriceCents, &o.Currency); err != nil {
			return nil, err
		}
		offers = append(offers, o)
	}
	return offers, rows.Err()
}
