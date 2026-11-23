package shop

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/mail"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

const cookieName = "keymarket_session"

var ErrBadInput = errors.New("invalid input")
var ErrOutOfStock = errors.New("one or more offers are unavailable or out of stock")
var ErrEmptyCart = errors.New("cart is empty")

type Shop struct {
	DB           *pgxpool.Pool
	Secret       []byte
	SecureCookie bool
}

func New(db *pgxpool.Pool) *Shop {
	secret := os.Getenv("SESSION_SECRET")
	if secret == "" {
		if os.Getenv("GIN_MODE") == "release" {
			panic("SESSION_SECRET must be configured for production")
		}
		secret = "development-only-change-this-secret-before-deploying"
	}
	return &Shop{DB: db, Secret: []byte(secret), SecureCookie: os.Getenv("COOKIE_SECURE") == "true"}
}
func (s *Shop) session(userID int64) string {
	payload, _ := json.Marshal(struct {
		User int64 `json:"uid"`
		Exp  int64 `json:"exp"`
	}{userID, time.Now().Add(7 * 24 * time.Hour).Unix()})
	part := base64.RawURLEncoding.EncodeToString(payload)
	mac := hmac.New(sha256.New, s.Secret)
	mac.Write([]byte(part))
	return part + "." + base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}
func (s *Shop) readSession(token string) (int64, bool) {
	pieces := strings.Split(token, ".")
	if len(pieces) != 2 {
		return 0, false
	}
	mac := hmac.New(sha256.New, s.Secret)
	mac.Write([]byte(pieces[0]))
	sig, e := base64.RawURLEncoding.DecodeString(pieces[1])
	if e != nil || !hmac.Equal(sig, mac.Sum(nil)) {
		return 0, false
	}
	body, e := base64.RawURLEncoding.DecodeString(pieces[0])
	if e != nil {
		return 0, false
	}
	var v struct {
		User int64 `json:"uid"`
		Exp  int64 `json:"exp"`
	}
	if json.Unmarshal(body, &v) != nil || v.User < 1 || v.Exp <= time.Now().Unix() {
		return 0, false
	}
	return v.User, true
}
func (s *Shop) setCookie(c *gin.Context, value string, maxAge int) {
	http.SetCookie(c.Writer, &http.Cookie{Name: cookieName, Value: value, Path: "/", HttpOnly: true, Secure: s.SecureCookie, SameSite: http.SameSiteLaxMode, MaxAge: maxAge})
}
func (s *Shop) User(c *gin.Context) (int64, bool) {
	token, e := c.Cookie(cookieName)
	if e != nil {
		return 0, false
	}
	return s.readSession(token)
}
func (s *Shop) Require(c *gin.Context) {
	if _, ok := s.User(c); !ok {
		c.AbortWithStatusJSON(401, gin.H{"error": "Please sign in first"})
	}
}
func emailValid(email string) bool {
	a, e := mail.ParseAddress(email)
	return e == nil && a.Address == email && len(email) <= 254
}
func (s *Shop) Register(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if c.ShouldBindJSON(&req) != nil {
		c.JSON(400, gin.H{"error": "Invalid registration data"})
		return
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	if !emailValid(req.Email) || len(req.Password) < 8 || len(req.Password) > 72 {
		c.JSON(400, gin.H{"error": "Enter a valid email and a password of 8–72 characters"})
		return
	}
	hash, e := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if e != nil {
		c.JSON(500, gin.H{"error": "Could not register"})
		return
	}
	var id int64
	e = s.DB.QueryRow(c.Request.Context(), `INSERT INTO users(email,password_hash) VALUES ($1,$2) ON CONFLICT(email) DO NOTHING RETURNING id`, req.Email, string(hash)).Scan(&id)
	if errors.Is(e, pgx.ErrNoRows) {
		c.JSON(409, gin.H{"error": "An account with this email already exists"})
		return
	}
	if e != nil {
		c.JSON(500, gin.H{"error": "Could not register"})
		return
	}
	s.setCookie(c, s.session(id), 7*86400)
	c.JSON(201, gin.H{"data": gin.H{"id": id, "email": req.Email}})
}
func (s *Shop) Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if c.ShouldBindJSON(&req) != nil {
		c.JSON(400, gin.H{"error": "Invalid login data"})
		return
	}
	var id int64
	var email, hash string
	e := s.DB.QueryRow(c.Request.Context(), `SELECT id,email,password_hash FROM users WHERE email=$1`, strings.ToLower(strings.TrimSpace(req.Email))).Scan(&id, &email, &hash)
	if e != nil || bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)) != nil {
		c.JSON(401, gin.H{"error": "Invalid email or password"})
		return
	}
	s.setCookie(c, s.session(id), 7*86400)
	c.JSON(200, gin.H{"data": gin.H{"id": id, "email": email}})
}
func (s *Shop) Logout(c *gin.Context) {
	s.setCookie(c, "", -1)
	c.JSON(200, gin.H{"data": gin.H{"ok": true}})
}
func (s *Shop) Me(c *gin.Context) {
	id, ok := s.User(c)
	if !ok {
		c.JSON(401, gin.H{"error": "Not signed in"})
		return
	}
	var email string
	if s.DB.QueryRow(c.Request.Context(), `SELECT email FROM users WHERE id=$1`, id).Scan(&email) != nil {
		c.JSON(401, gin.H{"error": "Account not found"})
		return
	}
	c.JSON(200, gin.H{"data": gin.H{"id": id, "email": email}})
}

type CartItem struct {
	OfferID         int64  `json:"offerId"`
	Slug            string `json:"slug"`
	Title           string `json:"title"`
	Platform        string `json:"platform"`
	CoverImageURL   string `json:"coverImageUrl"`
	Seller          string `json:"seller"`
	Region          string `json:"region"`
	PriceCents      int64  `json:"priceCents"`
	Currency        string `json:"currency"`
	Available       bool   `json:"available"`
	CashbackPercent int    `json:"cashbackPercent"`
}
type Cart struct {
	Items      []CartItem `json:"items"`
	TotalCents int64      `json:"totalCents"`
	Currency   string     `json:"currency"`
}

func (s *Shop) cart(ctx context.Context, user int64) (Cart, error) {
	rows, e := s.DB.Query(ctx, `SELECT o.id,p.slug,p.title,p.platform,p.cover_image_url,s.name,o.region,o.price_cents,o.currency,
 o.active AND EXISTS(SELECT 1 FROM game_keys g WHERE g.offer_id=o.id AND g.order_item_id IS NULL),p.cashback_percent
 FROM cart_items ci JOIN offers o ON ci.offer_id=o.id JOIN products p ON p.id=o.product_id
 JOIN sellers s ON s.id=o.seller_id WHERE ci.user_id=$1 ORDER BY ci.created_at,o.id`, user)
	if e != nil {
		return Cart{}, e
	}
	defer rows.Close()
	cart := Cart{Items: []CartItem{}, Currency: "EUR"}
	for rows.Next() {
		var i CartItem
		if e = rows.Scan(&i.OfferID, &i.Slug, &i.Title, &i.Platform, &i.CoverImageURL, &i.Seller, &i.Region, &i.PriceCents, &i.Currency, &i.Available, &i.CashbackPercent); e != nil {
			return Cart{}, e
		}
		cart.Items = append(cart.Items, i)
		cart.TotalCents += i.PriceCents
	}
	return cart, rows.Err()
}
func (s *Shop) Cart(c *gin.Context) {
	user, _ := s.User(c)
	cart, e := s.cart(c.Request.Context(), user)
	if e != nil {
		c.JSON(500, gin.H{"error": "Could not load cart"})
		return
	}
	c.JSON(200, gin.H{"data": cart})
}

// withCartLock serializes cart mutations and checkout for the same account.
func (s *Shop) withCartLock(ctx context.Context, user int64, fn func(pgx.Tx) error) error {
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	if _, err = tx.Exec(ctx, `SELECT pg_advisory_xact_lock($1)`, user); err != nil {
		return err
	}
	if err = fn(tx); err != nil {
		return err
	}
	return tx.Commit(ctx)
}
func (s *Shop) AddToCart(c *gin.Context) {
	user, _ := s.User(c)
	var v struct {
		OfferID int64 `json:"offerId"`
	}
	if c.ShouldBindJSON(&v) != nil || v.OfferID < 1 {
		c.JSON(400, gin.H{"error": "Valid offerId required"})
		return
	}
	err := s.withCartLock(c.Request.Context(), user, func(tx pgx.Tx) error {
		var available bool
		if err := tx.QueryRow(c.Request.Context(), `SELECT o.active AND EXISTS(SELECT 1 FROM game_keys g WHERE g.offer_id=o.id AND g.order_item_id IS NULL) FROM offers o WHERE o.id=$1`, v.OfferID).Scan(&available); err != nil || !available {
			return ErrOutOfStock
		}
		_, err := tx.Exec(c.Request.Context(), `INSERT INTO cart_items(user_id,offer_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, user, v.OfferID)
		return err
	})
	if errors.Is(err, ErrOutOfStock) {
		c.JSON(409, gin.H{"error": "Offer unavailable"})
		return
	}
	if err != nil {
		c.JSON(500, gin.H{"error": "Could not update cart"})
		return
	}
	cart, err := s.cart(c.Request.Context(), user)
	if err != nil {
		c.JSON(500, gin.H{"error": "Could not load cart"})
		return
	}
	c.JSON(200, gin.H{"data": cart})
}
func (s *Shop) RemoveFromCart(c *gin.Context) {
	user, _ := s.User(c)
	id, err := strconv.ParseInt(c.Param("offerId"), 10, 64)
	if err != nil || id < 1 {
		c.JSON(400, gin.H{"error": "Invalid offer ID"})
		return
	}
	err = s.withCartLock(c.Request.Context(), user, func(tx pgx.Tx) error {
		_, err := tx.Exec(c.Request.Context(), `DELETE FROM cart_items WHERE user_id=$1 AND offer_id=$2`, user, id)
		return err
	})
	if err != nil {
		c.JSON(500, gin.H{"error": "Could not remove item"})
		return
	}
	cart, err := s.cart(c.Request.Context(), user)
	if err != nil {
		c.JSON(500, gin.H{"error": "Could not load cart"})
		return
	}
	c.JSON(200, gin.H{"data": cart})
}

type OrderItem struct {
	ID         int64  `json:"id"`
	Title      string `json:"title"`
	Seller     string `json:"seller"`
	Platform   string `json:"platform"`
	Region     string `json:"region"`
	PriceCents int64  `json:"priceCents"`
	Currency   string `json:"currency"`
	Key        string `json:"key"`
}
type Order struct {
	ID         int64       `json:"id"`
	Status     string      `json:"status"`
	TotalCents int64       `json:"totalCents"`
	Currency   string      `json:"currency"`
	CreatedAt  time.Time   `json:"createdAt"`
	Items      []OrderItem `json:"items"`
}

func (s *Shop) order(ctx context.Context, user, id int64) (Order, error) {
	var o Order
	e := s.DB.QueryRow(ctx, `SELECT id,status,total_cents,currency,created_at FROM orders WHERE id=$1 AND user_id=$2`, id, user).Scan(&o.ID, &o.Status, &o.TotalCents, &o.Currency, &o.CreatedAt)
	if e != nil {
		return o, e
	}
	o.Items = []OrderItem{}
	rows, e := s.DB.Query(ctx, `SELECT oi.id,oi.product_title,oi.seller_name,oi.platform,oi.region,oi.price_cents,oi.currency,g.key_value
 FROM order_items oi JOIN game_keys g ON g.order_item_id=oi.id WHERE oi.order_id=$1 ORDER BY oi.id`, id)
	if e != nil {
		return o, e
	}
	defer rows.Close()
	for rows.Next() {
		var i OrderItem
		if e = rows.Scan(&i.ID, &i.Title, &i.Seller, &i.Platform, &i.Region, &i.PriceCents, &i.Currency, &i.Key); e != nil {
			return o, e
		}
		o.Items = append(o.Items, i)
	}
	return o, rows.Err()
}
func (s *Shop) Orders(c *gin.Context) {
	user, _ := s.User(c)
	rows, e := s.DB.Query(c.Request.Context(), `SELECT id,status,total_cents,currency,created_at FROM orders WHERE user_id=$1 ORDER BY id DESC LIMIT 100`, user)
	if e != nil {
		c.JSON(500, gin.H{"error": "Could not load orders"})
		return
	}
	defer rows.Close()
	list := []Order{}
	for rows.Next() {
		var o Order
		if e = rows.Scan(&o.ID, &o.Status, &o.TotalCents, &o.Currency, &o.CreatedAt); e != nil {
			c.JSON(500, gin.H{"error": "Could not load orders"})
			return
		}
		list = append(list, o)
	}
	if rows.Err() != nil {
		c.JSON(500, gin.H{"error": "Could not load orders"})
		return
	}
	c.JSON(200, gin.H{"data": list})
}
func (s *Shop) Order(c *gin.Context) {
	user, _ := s.User(c)
	id, e := strconv.ParseInt(c.Param("id"), 10, 64)
	if e != nil || id < 1 {
		c.JSON(400, gin.H{"error": "Invalid order ID"})
		return
	}
	o, e := s.order(c.Request.Context(), user, id)
	if errors.Is(e, pgx.ErrNoRows) {
		c.JSON(404, gin.H{"error": "Order not found"})
		return
	}
	if e != nil {
		c.JSON(500, gin.H{"error": "Could not load order"})
		return
	}
	c.JSON(200, gin.H{"data": o})
}

// Checkout is a SIMULATED payment. Each selected offer consumes precisely one unique key.
// A per-user advisory transaction lock serializes this user's cart changes through checkout;
// row locks on keys ensure different customers cannot consume the same key.
func (s *Shop) Checkout(c *gin.Context) {
	user, _ := s.User(c)
	var req struct {
		IdempotencyKey string `json:"idempotencyKey"`
	}
	if c.ShouldBindJSON(&req) != nil || len(req.IdempotencyKey) < 16 || len(req.IdempotencyKey) > 128 {
		c.JSON(400, gin.H{"error": "idempotencyKey must contain 16–128 characters"})
		return
	}
	ctx := c.Request.Context()
	tx, e := s.DB.Begin(ctx)
	if e != nil {
		c.JSON(500, gin.H{"error": "Could not start checkout"})
		return
	}
	defer tx.Rollback(ctx)
	if _, e = tx.Exec(ctx, `SELECT pg_advisory_xact_lock($1)`, user); e != nil {
		c.JSON(500, gin.H{"error": "Could not lock cart"})
		return
	}
	var existing int64
	e = tx.QueryRow(ctx, `SELECT id FROM orders WHERE user_id=$1 AND idempotency_key=$2`, user, req.IdempotencyKey).Scan(&existing)
	if e == nil {
		if tx.Commit(ctx) != nil {
			c.JSON(500, gin.H{"error": "Checkout failed"})
			return
		}
		o, e := s.order(ctx, user, existing)
		if e != nil {
			c.JSON(500, gin.H{"error": "Could not load order"})
			return
		}
		c.JSON(200, gin.H{"data": o})
		return
	}
	if !errors.Is(e, pgx.ErrNoRows) {
		c.JSON(500, gin.H{"error": "Checkout failed"})
		return
	}
	// Stable offer ordering reduces the likelihood of lock inversion during concurrent checkouts.
	rows, e := tx.Query(ctx, `SELECT o.id,p.title,p.platform,s.name,o.region,o.price_cents,o.currency,o.active
 FROM cart_items ci JOIN offers o ON o.id=ci.offer_id JOIN products p ON p.id=o.product_id JOIN sellers s ON s.id=o.seller_id
 WHERE ci.user_id=$1 ORDER BY o.id`, user)
	if e != nil {
		c.JSON(500, gin.H{"error": "Checkout failed"})
		return
	}
	type selection struct {
		OfferID                                   int64
		Title, Platform, Seller, Region, Currency string
		Price                                     int64
		Active                                    bool
	}
	choices := []selection{}
	for rows.Next() {
		var x selection
		e = rows.Scan(&x.OfferID, &x.Title, &x.Platform, &x.Seller, &x.Region, &x.Price, &x.Currency, &x.Active)
		if e != nil {
			break
		}
		choices = append(choices, x)
	}
	if rows.Err() != nil {
		e = rows.Err()
	}
	rows.Close()
	if e != nil {
		c.JSON(500, gin.H{"error": "Checkout failed"})
		return
	}
	if len(choices) == 0 {
		c.JSON(409, gin.H{"error": ErrEmptyCart.Error()})
		return
	}
	var total int64
	for _, x := range choices {
		if !x.Active || x.Currency != "EUR" {
			c.JSON(409, gin.H{"error": ErrOutOfStock.Error()})
			return
		}
		total += x.Price
	}
	// Locks selected offer rows to stabilize prices and active flags during this transaction.
	for _, x := range choices {
		var price int64
		var active bool
		e = tx.QueryRow(ctx, `SELECT price_cents,active FROM offers WHERE id=$1 FOR UPDATE`, x.OfferID).Scan(&price, &active)
		if e != nil || !active || price != x.Price {
			c.JSON(409, gin.H{"error": "Offer changed; refresh cart and retry"})
			return
		}
	}
	type lockedKey struct {
		ID      int64
		OfferID int64
	}
	keys := []lockedKey{}
	for _, x := range choices {
		var keyID int64
		e = tx.QueryRow(ctx, `SELECT id FROM game_keys WHERE offer_id=$1 AND order_item_id IS NULL ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED`, x.OfferID).Scan(&keyID)
		if e != nil {
			c.JSON(409, gin.H{"error": ErrOutOfStock.Error()})
			return
		}
		keys = append(keys, lockedKey{ID: keyID, OfferID: x.OfferID})
	}
	var orderID int64
	e = tx.QueryRow(ctx, `INSERT INTO orders(user_id,idempotency_key,total_cents,currency,status) VALUES ($1,$2,$3,'EUR','paid') RETURNING id`, user, req.IdempotencyKey, total).Scan(&orderID)
	if e != nil {
		c.JSON(500, gin.H{"error": "Could not create order"})
		return
	}
	for i, x := range choices {
		var itemID int64
		e = tx.QueryRow(ctx, `INSERT INTO order_items(order_id,offer_id,product_title,seller_name,platform,region,price_cents,currency) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`, orderID, x.OfferID, x.Title, x.Seller, x.Platform, x.Region, x.Price, x.Currency).Scan(&itemID)
		if e != nil {
			c.JSON(500, gin.H{"error": "Could not create order item"})
			return
		}
		tag, err := tx.Exec(ctx, `UPDATE game_keys SET order_item_id=$1 WHERE id=$2 AND order_item_id IS NULL`, itemID, keys[i].ID)
		if err != nil || tag.RowsAffected() != 1 {
			c.JSON(409, gin.H{"error": ErrOutOfStock.Error()})
			return
		}
	}
	if _, e = tx.Exec(ctx, `DELETE FROM cart_items WHERE user_id=$1`, user); e != nil {
		c.JSON(500, gin.H{"error": "Could not clear cart"})
		return
	}
	if e = tx.Commit(ctx); e != nil {
		c.JSON(500, gin.H{"error": "Could not complete checkout"})
		return
	}
	o, e := s.order(ctx, user, orderID)
	if e != nil {
		c.JSON(500, gin.H{"error": fmt.Sprintf("Order #%d created, but could not load receipt. Visit order history.", orderID)})
		return
	}
	c.JSON(201, gin.H{"data": o})
}
func NewIdempotencyKey() string {
	b := make([]byte, 16)
	if _, e := rand.Read(b); e != nil {
		return strconv.FormatInt(time.Now().UnixNano(), 10) + "-fallback"
	}
	return base64.RawURLEncoding.EncodeToString(b)
}
