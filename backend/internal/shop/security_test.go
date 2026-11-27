package shop

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func signedTestToken(secret []byte, uid, expiry int64) string {
	payload, _ := json.Marshal(map[string]int64{"uid": uid, "exp": expiry})
	body := base64.RawURLEncoding.EncodeToString(payload)
	mac := hmac.New(sha256.New, secret)
	_, _ = mac.Write([]byte(body))
	return body + "." + base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

func TestSessionRejectsBadClaimsAndMalformedTokens(t *testing.T) {
	s := &Shop{Secret: []byte("test-only-secret")}
	future := time.Now().Add(time.Hour).Unix()
	cases := []string{
		"", "not-a-session", "a.b.c", "x.!",
		signedTestToken(s.Secret, 0, future),
		signedTestToken(s.Secret, -2, future),
		signedTestToken(s.Secret, 12, time.Now().Add(-time.Minute).Unix()),
		strings.Repeat("invalid", 200),
	}
	for _, token := range cases {
		if user, ok := s.readSession(token); ok {
			t.Errorf("accepted invalid session with user id %d", user)
		}
	}
}

func TestSessionCookieSecurityAttributes(t *testing.T) {
	gin.SetMode(gin.TestMode)
	s := &Shop{Secret: []byte("test-only-secret"), SecureCookie: true}
	ctx, recorder := gin.CreateTestContext(httptest.NewRecorder())
	s.setCookie(ctx, s.session(8), 3600)
	cookies := recorder.Result().Cookies()
	if len(cookies) != 1 {
		t.Fatalf("want 1 cookie, got %d", len(cookies))
	}
	cookie := cookies[0]
	if !cookie.Secure || !cookie.HttpOnly || cookie.SameSite != http.SameSiteLaxMode || cookie.Path != "/" {
		t.Fatalf("session cookie security flags incorrect: %#v", cookie)
	}
}

func TestProtectedRouteRejectsUnauthenticatedRequests(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	s := &Shop{Secret: []byte("test-only-secret")}
	router.GET("/orders", s.Require, func(c *gin.Context) { c.Status(200) })
	for _, token := range []string{"", "forged-cookie", signedTestToken(s.Secret, 1, time.Now().Add(-time.Hour).Unix())} {
		request := httptest.NewRequest(http.MethodGet, "/orders", nil)
		if token != "" {
			request.AddCookie(&http.Cookie{Name: cookieName, Value: token})
		}
		response := httptest.NewRecorder()
		router.ServeHTTP(response, request)
		if response.Code != http.StatusUnauthorized {
			t.Fatalf("token %q: got %d, want 401", token, response.Code)
		}
	}
}

func TestValidSessionPassesProtectedRoute(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	s := &Shop{Secret: []byte("test-only-secret")}
	router.GET("/orders", s.Require, func(c *gin.Context) { c.Status(204) })
	req := httptest.NewRequest(http.MethodGet, "/orders", nil)
	req.AddCookie(&http.Cookie{Name: cookieName, Value: s.session(11)})
	response := httptest.NewRecorder()
	router.ServeHTTP(response, req)
	if response.Code != 204 {
		t.Fatalf("got %d, want 204", response.Code)
	}
}
