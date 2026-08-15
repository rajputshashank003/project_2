# ---- Stage 1: Builder -------------------------------------------------------
FROM golang:1.24-alpine AS builder

# Allow Go to auto-download the toolchain version required by go.mod
ENV GOTOOLCHAIN=auto

WORKDIR /app

# Cache dependencies separately from source code
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build — strip debug info for smallest binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o server ./cmd/server

# ---- Stage 2: Runtime -------------------------------------------------------
FROM alpine:3.19

# ca-certificates required for HTTPS calls (Cloudinary, Twilio, Resend)
# tzdata required for TIMESTAMPTZ timezone handling
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy compiled binary
COPY --from=builder /app/server .

# Copy migrations (golang-migrate reads from filesystem at runtime)
COPY --from=builder /app/internal/migrations ./internal/migrations

EXPOSE 3000

CMD ["./server"]
