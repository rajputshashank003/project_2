# API Knowledge Transfer (KT)

> **Maintained by:** Backend Team
> **Last Updated:** 2026-08-13
> **Module:** `github.com/shashankrajput/ngo-platform/api`

---

## 1. Overview

RESTful Go backend for the NGO Platform — serves the React client at `/client`.
Handles authentication (OTP via Twilio), donations, ID cards, notices, gallery, events, team, NGO config, and manual notifications.

---

## 2. Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Go | 1.22+ | Language |
| Gin | Latest | HTTP framework |
| GORM v2 | Latest | ORM |
| PostgreSQL | 16 | Primary database |
| golang-migrate | v4 | Versioned SQL migrations |
| zerolog | v1 | Structured JSON logging |
| golang-jwt/jwt | v5 | JWT authentication |
| Cloudinary Go SDK | v2 | Image storage + CDN |
| Twilio Go SDK | v1 | SMS OTP delivery |
| Resend HTTP | REST | Email notifications |
| Docker | Latest | Containerisation |
| GitHub Actions | — | CI/CD |

---

## 3. Architecture

```
HTTP Request
    │
    ├─ RequestID middleware  (UUID per request, X-Request-ID header)
    ├─ gin.Recovery()        (panics → zerolog ERROR)
    ├─ BodyLimit middleware   (MaxBytesReader, default 20 MB)
    ├─ CORS                  (AllowAllOrigins in dev)
    │
    ▼
Handler (internal/handler/)
    │  Parses request, validates, calls service, returns JSON
    ▼
Service (internal/service/)
    │  Business logic, Cloudinary, Twilio, Resend, DB transactions
    ▼
Repository (internal/repository/)
    │  GORM queries only — no business logic
    ▼
PostgreSQL
```

**Rules:**
- Handlers never touch DB.
- Services never import `gin` or write HTTP responses.
- Repositories contain only DB logic.
- Constructor DI: `NewXxxHandler(svc XxxService)`.
- Every error explicitly handled — no `_` on errors.

---

## 4. Directory Map

```
api/
├── cmd/server/main.go           Entry point, DI, graceful shutdown
├── internal/
│   ├── config/config.go         Typed env config
│   ├── database/postgres.go     GORM connect + golang-migrate
│   ├── migrations/              000001...000010 SQL pairs
│   ├── models/                  GORM structs (9 models)
│   ├── dto/                     Request/response DTOs
│   ├── repository/              DB queries per domain
│   ├── service/                 Business logic per domain
│   ├── middleware/              body_limit, request_id, auth, admin
│   ├── handler/                 HTTP handlers (10 files)
│   └── routes/routes.go         All route registrations
├── Dockerfile                   Multi-stage build
├── docker-compose.yml           Local dev (postgres + api)
├── .env.example                 Env vars template
├── prompts/                     LLM prompt logs
└── kt.md                        This file
```

---

## 5. Environment Variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| PORT | — | 3000 | HTTP listen port |
| GIN_MODE | — | debug | `release` in prod |
| BODY_LIMIT_MB | — | 20 | Max request body (MB) |
| LOG_LEVEL | — | info | debug/info/warn/error |
| DB_HOST | — | localhost | PostgreSQL host |
| DB_PORT | — | 5432 | PostgreSQL port |
| DB_USER | **Yes** | — | DB username |
| DB_PASSWORD | **Yes** | — | DB password |
| DB_NAME | **Yes** | — | DB name |
| DB_SSLMODE | — | disable | `require` in prod |
| DB_MAX_OPEN_CONNS | — | 25 | Pool max open |
| DB_MAX_IDLE_CONNS | — | 10 | Pool max idle |
| JWT_SECRET | **Yes** | — | Min 32 chars |
| JWT_EXPIRY_HOURS | — | 72 | Token validity |
| ADMIN_PHONE | — | — | Seeds first admin on startup |
| ADMIN_NAME | — | Admin | Admin display name |
| DEV_MODE | — | false | `true` → logs OTP, skips Twilio/Resend |
| DEV_OTP | — | 123456 | Accepted OTP in dev mode |
| TWILIO_ACCOUNT_SID | — | — | Required if DEV_MODE=false |
| TWILIO_AUTH_TOKEN | — | — | Required if DEV_MODE=false |
| TWILIO_FROM_PHONE | — | — | E.164 format |
| RESEND_API_KEY | — | — | Required if DEV_MODE=false |
| RESEND_FROM_EMAIL | — | noreply@example.com | Sender address |
| CLOUDINARY_CLOUD_NAME | **Yes** | — | Cloudinary cloud |
| CLOUDINARY_API_KEY | **Yes** | — | Cloudinary key |
| CLOUDINARY_API_SECRET | **Yes** | — | Cloudinary secret |
| CLOUDINARY_UPLOAD_FOLDER | — | ngo_platform | CDN folder prefix |
| OTP_EXPIRY_MINUTES | — | 5 | OTP TTL |
| OTP_MAX_PER_10MIN | — | 3 | Rate limit per phone |

---

## 6. Full API Reference

All routes under `/api/v1/` unless noted.

### Auth (Public)
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/auth/send-otp` | `{phone}` | Rate-limited 3/10 min |
| POST | `/auth/verify-otp` | `{phone, otp}` | Returns `{token, user}` |

### NGO Config
| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/ngo/config` | Public | — |
| PATCH | `/ngo/config` | Admin | `UpdateNgoConfigRequest` |

### Donations
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/donations?page=&limit=` | Admin | Paginated |
| GET | `/donations/:id` | Auth | |
| POST | `/donations` | Auth | Idempotency-Key header |
| PATCH | `/donations/:id/status` | Admin | Transactional |

### ID Cards
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/id-cards?page=&limit=` | Admin | Paginated |
| GET | `/id-cards/:id` | Auth | |
| POST | `/id-cards` | Auth | Idempotency-Key header |
| PATCH | `/id-cards/:id/status` | Admin | Transactional; validityYears required |

### Notices
| Method | Path | Auth |
|---|---|---|
| GET | `/notices?page=&limit=` | Public |
| POST | `/notices` | Admin |
| PATCH | `/notices/:id` | Admin |
| DELETE | `/notices/:id` | Admin |

### Gallery
| Method | Path | Auth |
|---|---|---|
| GET | `/gallery?page=&limit=` | Public |
| POST | `/gallery` | Admin |
| DELETE | `/gallery/:id` | Admin |

### Events
| Method | Path | Auth |
|---|---|---|
| GET | `/events?page=&limit=` | Public |
| POST | `/events` | Admin |
| PATCH | `/events/:id` | Admin |
| DELETE | `/events/:id` | Admin |

### Team
| Method | Path | Auth |
|---|---|---|
| GET | `/team` | Public |
| PATCH | `/team/:slot` | Admin |
| PATCH | `/team/:slot/clear` | Admin |
| POST | `/team/add-slot` | Admin |
| DELETE | `/team/slot/:slot` | Admin |

### Users
| Method | Path | Auth |
|---|---|---|
| GET | `/users?page=&limit=` | Admin |
| PATCH | `/users/:id` | Admin |
| PATCH | `/users/:id/promote` | Admin |
| PATCH | `/users/:id/demote` | Admin |

### Notifications
| Method | Path | Auth |
|---|---|---|
| POST | `/notify/sms` | Auth |
| POST | `/notify/email` | Auth |

### Health (no prefix)
| Method | Path |
|---|---|
| GET | `/healthz` |
| GET | `/readyz` |

---

## 7. Authentication Flow

```
Client → POST /auth/send-otp {phone}
Server → validates phone (Indian 10-digit), rate-limits, generates OTP
       → DEV_MODE: logs OTP; PROD: sends SMS via Twilio
       → stores OTP in DB (expires_at = NOW() + 5min)

Client → POST /auth/verify-otp {phone, otp}
Server → finds valid OTP (phone + used=false + expires_at > NOW())
       → wrong/expired → 400 INVALID_OTP
       → correct → marks used, upserts user, issues JWT (72h)
       → returns {token, user}
```

---

## 8. Image Flow (Cloudinary)

All images go through `CloudinaryService.Upload(ctx, base64Str)`:
1. Strip `data:image/...;base64,` prefix
2. Decode Base64 → bytes
3. Upload to Cloudinary folder `CLOUDINARY_UPLOAD_FOLDER`
4. Returns `{SecureURL, PublicID}`

**Orphan protection:** If DB write fails after Cloudinary upload, `CloudinaryService.Delete(ctx, publicID)` is called immediately.

**On delete:** `Delete(ctx, id)` fetches `cloudinary_id` from DB, calls `cloudinary.Delete`, then hard-deletes the DB row.

---

## 9. Approval Flow (Transactions)

Both donations and ID cards wrap approval in a DB transaction:
```
BEGIN
  UPDATE status, reviewed_at, reviewed_by
  [approval] UPDATE certificate_number / unique_card_number
             (unique constraint → retry up to 3x on collision)
COMMIT
→ async goroutine: SMS + Email notification
```

If transaction fails → status stays `pending`, no notification sent.

---

## 10. Pagination

All list endpoints accept `?page=1&limit=20`. Defaults: page=1, limit=20, max limit=100.

Response:
```json
{
  "data": [...],
  "pagination": {"page": 1, "limit": 20, "total": 147, "totalPages": 8}
}
```

---

## 11. Error Envelope

All errors:
```json
{ "error": { "code": "ERROR_CODE", "message": "Human-readable message" } }
```

All successes:
```json
{ "data": { ... } }
```

---

## 12. Idempotency

`POST /donations` and `POST /id-cards` accept an `Idempotency-Key: <uuid>` header.
- Key + endpoint looked up in `idempotency_keys` WHERE `created_at > NOW() - INTERVAL '24 hours'`
- If found → cached response returned immediately
- If not found → process normally, store result with key
- Expired keys purged hourly by background goroutine in `main.go`

---

## 13. DB Schema Summary

| Table | Key Indexes |
|---|---|
| users | phone (UNIQUE) |
| otps | (phone, used, expires_at) |
| ngo_config | id=1 always |
| donations | status, requested_at DESC, certificate_number (UNIQUE) |
| id_cards | status, requested_at DESC, user_id, unique_card_number (UNIQUE) |
| notices | is_active |
| gallery_images | uploaded_at DESC |
| events | created_at DESC |
| event_images | event_id |
| team_members | slot (PK) |
| idempotency_keys | (key, endpoint) composite PK |

All timestamps: `TIMESTAMPTZ`.

---

## 14. Run Locally

```bash
# 1. Start PostgreSQL
docker compose up postgres -d

# 2. Copy env
cp .env.example .env
# fill in DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET

# 3. Run with hot-reload
air          # uses .air.toml

# 4. Or run directly
go run ./cmd/server
```

---

## 15. Migrations

Files in `internal/migrations/` — numbered SQL pairs (`up` / `down`).

```bash
# Apply all pending (runs automatically on startup too)
migrate -path ./internal/migrations -database "postgres://..." up

# Rollback 1 step
migrate -path ./internal/migrations -database "postgres://..." down 1
```

---

## 16. Docker

```bash
# Build + run everything
docker compose up --build

# Production image only
docker build -t ngo-api .
docker run -p 3000:3000 --env-file .env ngo-api
```

---

## 17. CI/CD

File: `.github/workflows/backend.yaml`
- Triggers on push to `main` only if `api/**` changed (path-filter)
- Builds multi-stage Docker image with GHA layer cache
- Pushes `ngo-api:latest` + `ngo-api:<sha>` to DockerHub
- Triggers Render deploy hook

**Secrets required:**
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `RENDER_API_DEPLOY_HOOK`

---

## 18. Gotchas

- **Migrations run on every startup** — `migrate.ErrNoChange` is silently ignored; real errors panic.
- **Admin phone bypass** — `ADMIN_PHONE` user is seeded only if not already in DB. After seed, they log in with OTP like anyone else.
- **DEV_MODE=true** — Twilio and Resend are completely skipped. OTP is logged. `DEV_OTP` is accepted for any phone.
- **Cloudinary Base64** — strip the data URI prefix before sending. The client should send raw Base64 or the full data URI (server strips it automatically).
- **Team slots** — max 5 slots enforced in service. Slot numbers re-index (1..N) after deletion.
- **TIMESTAMPTZ** — all timestamps stored with timezone. Go `time.Time` maps correctly with `TimeZone=UTC` in DSN.
- **`GIN_MODE=release`** hides stack traces in responses — always set in production.
