#!/usr/bin/env python3
"""Opt-in HTTP integration test for the DEMO marketplace.

Run against a local, seeded test database (never a production/live database).
This script creates two users and consumes one fictional demo key per account.
Requires no third-party Python dependencies.
"""
import http.cookiejar
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
from dataclasses import dataclass

BASE = os.getenv("TEST_BASE_URL", "http://localhost:8080").rstrip("/")
if os.getenv("RUN_PURCHASE_TESTS") != "1":
    sys.exit("Safety guard: set RUN_PURCHASE_TESTS=1 to run purchase integration tests against an ISOLATED DEMO database")
if not (BASE.startswith("http://localhost:") or BASE.startswith("http://127.0.0.1:")) and os.getenv("ALLOW_REMOTE_DEMO_TESTS") != "1":
    sys.exit("Remote tests disabled by default; use an isolated demo instance and explicitly set ALLOW_REMOTE_DEMO_TESTS=1")

@dataclass
class Response:
    status: int
    body: dict

class Client:
    def __init__(self):
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

    def request(self, method, path, data=None):
        encoded = json.dumps(data).encode() if data is not None else None
        headers = {"Content-Type": "application/json", "Origin": BASE}
        request = urllib.request.Request(BASE + path, data=encoded, method=method, headers=headers)
        try:
            response = self.opener.open(request, timeout=20)
        except urllib.error.HTTPError as e:
            response = e
        with response:
            raw = response.read().decode()
            return Response(response.status, json.loads(raw) if raw else {})

def require(condition, detail):
    if not condition:
        raise AssertionError(detail)
    print("PASS:", detail)

try:
    anon = Client()
    live = anon.request("GET", "/health/live")
    require(live.status == 200, "liveness endpoint")
    require(anon.request("GET", "/api/v1/orders").status == 401, "anonymous order history is protected")
    require(anon.request("POST", "/api/v1/checkout", {"idempotencyKey": "test-checkout-anonymous"}).status == 401, "anonymous checkout is protected")
    require(anon.request("GET", "/api/v1/search?q=cyber").status == 200, "search endpoint responds")

    result = anon.request("GET", "/api/v1/products/cyberpunk-2077/offers")
    require(result.status == 200 and bool(result.body.get("data")), "Cyberpunk demo seller offers exist")
    offer = result.body["data"][0]
    require(isinstance(offer.get("id"), int), "offer IDs are available")

    keys = set()
    first_order = None
    for index in range(2):
        client = Client()
        email = f"phase6-{uuid.uuid4().hex[:14]}@example.invalid"
        register = client.request("POST", "/api/v1/auth/register", {"email": email, "password": "DemoPassw0rd!"})
        require(register.status == 201, f"user {index + 1} registers")
        cart = client.request("POST", "/api/v1/cart/items", {"offerId": offer["id"]})
        require(cart.status == 200, f"user {index + 1} adds offer to cart")
        request = {"idempotencyKey": str(uuid.uuid4())}
        checkout = client.request("POST", "/api/v1/checkout", request)
        require(checkout.status == 201, f"user {index + 1} completes demo checkout")
        receipt = checkout.body["data"]
        require(len(receipt.get("items", [])) == 1, "one purchased item in receipt")
        key = receipt["items"][0]["key"]
        require(key.startswith("DEMO-") and key not in keys, "issued key is fictional and unique")
        keys.add(key)
        repeat = client.request("POST", "/api/v1/checkout", request)
        require(repeat.status == 200 and repeat.body["data"]["id"] == receipt["id"], "repeated idempotency key returns same order")
        own = client.request("GET", "/api/v1/orders/" + str(receipt["id"]))
        require(own.status == 200 and own.body["data"]["items"][0]["key"] == key, "buyer can retrieve their own key")
        if first_order is not None:
            other = client.request("GET", "/api/v1/orders/" + str(first_order))
            require(other.status == 404, "other account cannot read first account's order")
        else:
            first_order = receipt["id"]
        client.request("POST", "/api/v1/auth/logout", {})
        require(client.request("GET", "/api/v1/orders").status == 401, "logout protects orders")
    print("ALL PHASE 6 HTTP INTEGRATION TESTS PASSED")
except Exception as exc:
    print("FAIL:", exc, file=sys.stderr)
    sys.exit(1)
