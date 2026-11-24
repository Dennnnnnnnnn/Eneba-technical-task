package shop

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"strings"
	"testing"
	"time"
)

func TestSessionSignatureAndExpiry(t *testing.T) {
	s := &Shop{Secret: []byte("unit-test-secret")}
	token := s.session(42)
	if id, ok := s.readSession(token); !ok || id != 42 {
		t.Fatalf("expected session 42; got %d %v", id, ok)
	}
	if _, ok := s.readSession(token + "x"); ok {
		t.Fatal("tampered session accepted")
	}
	if _, ok := (&Shop{Secret: []byte("another-secret")}).readSession(token); ok {
		t.Fatal("wrong secret accepted")
	}
	if _, ok := s.readSession(strings.Repeat("a", 100)); ok {
		t.Fatal("invalid token accepted")
	}
}
func TestEmailValidation(t *testing.T) {
	if !emailValid("tester@example.com") {
		t.Fatal("valid email rejected")
	}
	for _, v := range []string{"oops", "bad email@test.com", "someone@"} {
		if emailValid(v) {
			t.Fatalf("invalid email accepted: %q", v)
		}
	}
}

func TestExpiredSessionRejected(t *testing.T) {
	s := &Shop{Secret: []byte("test-secret")}
	payload, _ := json.Marshal(map[string]int64{"uid": 1, "exp": time.Now().Add(-time.Hour).Unix()})
	part := base64.RawURLEncoding.EncodeToString(payload)
	mac := hmac.New(sha256.New, s.Secret)
	mac.Write([]byte(part))
	token := part + "." + base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	if _, ok := s.readSession(token); ok {
		t.Fatal("expired session accepted")
	}
}
