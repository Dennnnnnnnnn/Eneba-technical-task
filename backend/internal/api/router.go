package api

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/example/eneba-marketplace/backend/internal/catalog"
	"github.com/example/eneba-marketplace/backend/internal/homepage"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Catalog interface {
	List(ctx context.Context, filters catalog.Filters) ([]catalog.Product, error)
	BySlug(ctx context.Context, slug string) (catalog.Product, error)
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
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load homepage"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": page})
	})
	v1.GET("/products", func(c *gin.Context) {
		products, err := repo.List(c.Request.Context(), catalog.Filters{
			Query: c.Query("q"), Platform: c.Query("platform"), Sort: c.DefaultQuery("sort", "name_asc"),
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not list products"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": products})
	})
	v1.GET("/products/:slug", func(c *gin.Context) {
		product, err := repo.BySlug(c.Request.Context(), c.Param("slug"))
		if errors.Is(err, catalog.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not get product"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": product})
	})
	return router
}
