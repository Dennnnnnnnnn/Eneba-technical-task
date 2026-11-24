# Single-origin deployment: React is built and served by the Go HTTP server.
FROM node:22-alpine AS frontend
WORKDIR /src/frontend
COPY frontend/package*.json ./
RUN npm install --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

FROM golang:1.23-alpine AS backend
WORKDIR /src/backend
COPY backend/go.mod ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 go build -trimpath -o /out/api ./cmd/api && \
    CGO_ENABLED=0 go build -trimpath -o /out/migrate ./cmd/migrate

FROM alpine:3.21
RUN apk add --no-cache ca-certificates && adduser -D -u 10001 app
WORKDIR /app
COPY --from=backend /out/api /app/api
COPY --from=backend /out/migrate /app/migrate
COPY --from=frontend /src/frontend/dist /app/public
COPY backend/migrations /app/migrations
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh && chown -R app:app /app
USER app
ENV PORT=10000 GIN_MODE=release STATIC_DIR=/app/public COOKIE_SECURE=true
EXPOSE 10000
CMD ["/app/start.sh"]
