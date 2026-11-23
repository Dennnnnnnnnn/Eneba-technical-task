package homepage

import (
	"context"
	"fmt"
	"github.com/example/eneba-marketplace/backend/internal/catalog"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Hero struct {
	Eyebrow    string `json:"eyebrow"`
	Title      string `json:"title"`
	Subtitle   string `json:"subtitle"`
	ButtonText string `json:"buttonText"`
	ButtonHref string `json:"buttonHref"`
	ImageURL   string `json:"imageUrl"`
	Theme      string `json:"theme"`
}
type Category struct {
	Name string `json:"name"`
	Icon string `json:"icon"`
	Href string `json:"href"`
}
type Section struct {
	Title    string            `json:"title"`
	Subtitle string            `json:"subtitle"`
	Products []catalog.Product `json:"products"`
}
type Page struct {
	Hero       Hero       `json:"hero"`
	Categories []Category `json:"categories"`
	Sections   []Section  `json:"sections"`
}
type Repository struct{ pool *pgxpool.Pool }

func NewRepository(pool *pgxpool.Pool) *Repository { return &Repository{pool: pool} }

func (r *Repository) Get(ctx context.Context) (Page, error) {
	page := Page{Categories: make([]Category, 0), Sections: make([]Section, 0)}
	err := r.pool.QueryRow(ctx, `SELECT eyebrow,title,subtitle,button_text,button_href,image_url,theme FROM homepage_hero WHERE id=1`).Scan(&page.Hero.Eyebrow, &page.Hero.Title, &page.Hero.Subtitle, &page.Hero.ButtonText, &page.Hero.ButtonHref, &page.Hero.ImageURL, &page.Hero.Theme)
	if err != nil {
		return Page{}, fmt.Errorf("hero: %w", err)
	}
	cats, err := r.pool.Query(ctx, `SELECT name,icon,href FROM homepage_categories ORDER BY position`)
	if err != nil {
		return Page{}, fmt.Errorf("categories: %w", err)
	}
	for cats.Next() {
		var c Category
		if err = cats.Scan(&c.Name, &c.Icon, &c.Href); err != nil {
			break
		}
		page.Categories = append(page.Categories, c)
	}
	if err == nil {
		err = cats.Err()
	}
	cats.Close()
	if err != nil {
		return Page{}, fmt.Errorf("categories rows: %w", err)
	}
	sections, err := r.pool.Query(ctx, `SELECT id,title,subtitle FROM homepage_sections ORDER BY position`)
	if err != nil {
		return Page{}, fmt.Errorf("sections: %w", err)
	}
	type secID struct {
		ID              int64
		Title, Subtitle string
	}
	ids := make([]secID, 0)
	for sections.Next() {
		var s secID
		if err = sections.Scan(&s.ID, &s.Title, &s.Subtitle); err != nil {
			break
		}
		ids = append(ids, s)
	}
	if err == nil {
		err = sections.Err()
	}
	sections.Close()
	if err != nil {
		return Page{}, fmt.Errorf("sections rows: %w", err)
	}
	for _, s := range ids {
		section := Section{Title: s.Title, Subtitle: s.Subtitle, Products: make([]catalog.Product, 0)}
		rows, e := r.pool.Query(ctx, `SELECT p.id,p.slug,p.title,p.description,p.platform,p.cover_color,p.cover_image_url,
COALESCE(MIN(o.price_cents),0)::bigint,COALESCE(MIN(o.currency),'EUR'),COUNT(o.id)::bigint
FROM homepage_section_products h JOIN products p ON p.id=h.product_id
JOIN offers o ON o.product_id=p.id AND o.active=TRUE
WHERE h.section_id=$1 GROUP BY p.id,h.position ORDER BY h.position`, s.ID)
		if e != nil {
			return Page{}, fmt.Errorf("section products: %w", e)
		}
		for rows.Next() {
			var p catalog.Product
			e = rows.Scan(&p.ID, &p.Slug, &p.Title, &p.Description, &p.Platform, &p.CoverColor, &p.CoverImageURL, &p.MinPriceCents, &p.Currency, &p.OfferCount)
			if e != nil {
				break
			}
			section.Products = append(section.Products, p)
		}
		if e == nil {
			e = rows.Err()
		}
		rows.Close()
		if e != nil {
			return Page{}, fmt.Errorf("section product rows: %w", e)
		}
		page.Sections = append(page.Sections, section)
	}
	return page, nil
}
