package api

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/example/eneba-marketplace/backend/internal/catalog"
	"github.com/example/eneba-marketplace/backend/internal/homepage"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Catalog interface {
	List(context.Context, catalog.Filters) (catalog.Page, error)
	BySlug(context.Context, string) (catalog.Product, error)
	OffersBySlug(context.Context, string) ([]catalog.Offer, error)
}

func parsePositive(c *gin.Context, name string, defaultValue int) (int, error) {
	raw := c.Query(name)
	if raw == "" {
		return defaultValue, nil
	}
	n, err := strconv.Atoi(raw)
	if err != nil || n < 1 {
		return 0, errors.New(name + " must be a positive integer")
	}
	return n, nil
}
func parseCents(c *gin.Context, name string) (*int64, error) {
	raw := c.Query(name)
	if raw == "" {
		return nil, nil
	}
	v, err := strconv.ParseInt(raw, 10, 64)
	if err != nil || v < 0 {
		return nil, errors.New(name + " must be a non-negative integer in cents")
	}
	return &v, nil
}

func NewRouter(pool *pgxpool.Pool, repo Catalog, corsOrigin string) *gin.Engine {
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())
	router.Use(func(c *gin.Context) {
		if c.GetHeader("Origin") == corsOrigin {
			c.Header("Access-Control-Allow-Origin", corsOrigin)
			c.Header("Vary", "Origin")
			c.Header("Access-Control-Allow-Methods", "GET, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		}
		if c.Request.Method == http.MethodOptions {
			c.Status(http.StatusNoContent)
			c.Abort()
			return
		}
		c.Next()
	})
	router.GET("/health/live", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })
	router.GET("/health/ready", func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
		defer cancel()
		if err := pool.Ping(ctx); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "database unavailable"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	v1 := router.Group("/api/v1")
	homeRepo := homepage.NewRepository(pool)
	v1.GET("/home", func(c *gin.Context) {
		page, err := homeRepo.Get(c.Request.Context())
		if err != nil {
			c.JSON(500, gin.H{"error": "could not load homepage"})
			return
		}
		c.JSON(200, gin.H{"data": page})
	})
	v1.GET("/products", func(c *gin.Context) {
		page, err := parsePositive(c, "page", 1)
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		pageSize, err := parsePositive(c, "pageSize", 12)
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		minPrice, err := parseCents(c, "minPriceCents")
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		maxPrice, err := parseCents(c, "maxPriceCents")
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		if minPrice != nil && maxPrice != nil && *minPrice > *maxPrice {
			c.JSON(400, gin.H{"error": "minimum price cannot exceed maximum price"})
			return
		}
		products, err := repo.List(c.Request.Context(), catalog.Filters{Query: c.Query("q"), Platform: c.Query("platform"), Region: c.Query("region"), Sort: c.DefaultQuery("sort", "name_asc"), MinPriceCents: minPrice, MaxPriceCents: maxPrice, Page: page, PageSize: pageSize})
		if err != nil {
			c.JSON(500, gin.H{"error": "could not list products"})
			return
		}
		c.JSON(200, gin.H{"data": products})
	})
	v1.GET("/search", func(c *gin.Context) {
		page, err := parsePositive(c, "page", 1)
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		products, err := repo.List(c.Request.Context(), catalog.Filters{Query: c.Query("q"), Sort: "relevance", Page: page, PageSize: 12})
		if err != nil {
			c.JSON(500, gin.H{"error": "could not search products"})
			return
		}
		c.JSON(200, gin.H{"data": products})
	})
	v1.GET("/products/:slug", func(c *gin.Context) {
		product, err := repo.BySlug(c.Request.Context(), c.Param("slug"))
		if errors.Is(err, catalog.ErrNotFound) {
			c.JSON(404, gin.H{"error": "product not found"})
			return
		}
		if err != nil {
			c.JSON(500, gin.H{"error": "could not get product"})
			return
		}
		c.JSON(200, gin.H{"data": product})
	})
	v1.GET("/products/:slug/offers", func(c *gin.Context) {
		offers, err := repo.OffersBySlug(c.Request.Context(), c.Param("slug"))
		if errors.Is(err, catalog.ErrNotFound) {
			c.JSON(404, gin.H{"error": "product not found"})
			return
		}
		if err != nil {
			c.JSON(500, gin.H{"error": "could not get offers"})
			return
		}
		c.JSON(200, gin.H{"data": offers})
	})
	return router
}
