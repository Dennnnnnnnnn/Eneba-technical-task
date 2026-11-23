package homepage

import (
	"context"
	"fmt"
	"github.com/example/eneba-marketplace/backend/internal/catalog"
)

type Banner struct {
	ID       int64  `json:"id"`
	Title    string `json:"title"`
	Eyebrow  string `json:"eyebrow"`
	Subtitle string `json:"subtitle"`
	CTA      string `json:"cta"`
	Href     string `json:"href"`
	ImageURL string `json:"imageUrl"`
	Theme    string `json:"theme"`
}
type Genre struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Icon  string `json:"icon"`
	Count int64  `json:"count"`
}
type SectionMeta struct {
	ID       int64  `json:"id"`
	Title    string `json:"title"`
	Subtitle string `json:"subtitle"`
}
type SectionDetail struct {
	SectionMeta
	Products []catalog.Product `json:"products"`
}

func (r *Repository) Banners(ctx context.Context) ([]Banner, error) {
	rows, err := r.pool.Query(ctx, `SELECT id,title,eyebrow,subtitle,cta,href,image_url,theme FROM homepage_banners ORDER BY position`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]Banner, 0)
	for rows.Next() {
		var b Banner
		if err := rows.Scan(&b.ID, &b.Title, &b.Eyebrow, &b.Subtitle, &b.CTA, &b.Href, &b.ImageURL, &b.Theme); err != nil {
			return nil, err
		}
		result = append(result, b)
	}
	return result, rows.Err()
}
func (r *Repository) Categories(ctx context.Context) ([]Category, error) {
	rows, err := r.pool.Query(ctx, `SELECT name,icon,href FROM homepage_categories ORDER BY position`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]Category, 0)
	for rows.Next() {
		var c Category
		if err := rows.Scan(&c.Name, &c.Icon, &c.Href); err != nil {
			return nil, err
		}
		result = append(result, c)
	}
	return result, rows.Err()
}
func (r *Repository) Genres(ctx context.Context) ([]Genre, error) {
	rows, err := r.pool.Query(ctx, `SELECT g.id,g.name,g.icon,COUNT(gp.product_id)::bigint FROM homepage_genres g LEFT JOIN homepage_genre_products gp ON gp.genre_id=g.id GROUP BY g.id ORDER BY g.position`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]Genre, 0)
	for rows.Next() {
		var g Genre
		if err := rows.Scan(&g.ID, &g.Name, &g.Icon, &g.Count); err != nil {
			return nil, err
		}
		result = append(result, g)
	}
	return result, rows.Err()
}
func (r *Repository) SectionList(ctx context.Context) ([]SectionMeta, error) {
	rows, err := r.pool.Query(ctx, `SELECT id,title,subtitle FROM homepage_sections ORDER BY position`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]SectionMeta, 0)
	for rows.Next() {
		var s SectionMeta
		if err := rows.Scan(&s.ID, &s.Title, &s.Subtitle); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}
func (r *Repository) SectionByID(ctx context.Context, id int64) (SectionDetail, error) {
	var s SectionDetail
	err := r.pool.QueryRow(ctx, `SELECT id,title,subtitle FROM homepage_sections WHERE id=$1`, id).Scan(&s.ID, &s.Title, &s.Subtitle)
	if err != nil {
		return s, err
	}
	s.Products = make([]catalog.Product, 0)
	rows, err := r.pool.Query(ctx, `SELECT p.id,p.slug,p.title,p.description,p.platform,p.cover_color,p.cover_image_url,
 COALESCE(MIN(o.price_cents),0)::bigint,COALESCE(MIN(o.currency),'EUR'),COUNT(o.id)::bigint,(ARRAY_AGG(o.region ORDER BY o.price_cents,o.id))[1],p.cashback_percent
 FROM homepage_section_products h JOIN products p ON p.id=h.product_id
 JOIN offers o ON o.product_id=p.id AND o.active=TRUE WHERE h.section_id=$1
 GROUP BY p.id,h.position ORDER BY h.position`, id)
	if err != nil {
		return s, fmt.Errorf("section products: %w", err)
	}
	defer rows.Close()
	for rows.Next() {
		var p catalog.Product
		if err := rows.Scan(&p.ID, &p.Slug, &p.Title, &p.Description, &p.Platform, &p.CoverColor, &p.CoverImageURL, &p.MinPriceCents, &p.Currency, &p.OfferCount, &p.Region, &p.CashbackPercent); err != nil {
			return s, err
		}
		s.Products = append(s.Products, p)
	}
	return s, rows.Err()
}
