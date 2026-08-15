FROM golang:1.22-alpine AS builder

# CGO required for sqlite3
RUN apk add --no-cache gcc musl-dev

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=1 go build -o whatsapp_service ./cmd/main.go

# ---- Runtime image --------------------------------------------------
FROM alpine:latest
RUN apk add --no-cache ca-certificates

WORKDIR /app
COPY --from=builder /app/whatsapp_service .

# Persist WhatsApp session DB across container restarts
RUN mkdir -p store
VOLUME ["/app/store"]

EXPOSE 8080
CMD ["./whatsapp_service"]
