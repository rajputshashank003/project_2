# API Knowledge Transfer (KT)

> **Maintained by:** Backend Team
> **Last Updated:** 2026-08-14
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

### Org / NGO Config
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| GET | `/ngo/config` | Public | — | Reads all rows from `org_settings` KV table |
| PATCH | `/ngo/config` | Admin | `UpdateNgoConfigRequest` | Upserts KV pairs into `org_settings` |

### User Profile (My Records)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/my/donations?page=&limit=` | Auth | Returns current user's donations (all statuses) |
| GET | `/my/id-cards?page=&limit=` | Auth | Returns current user's ID card requests (all statuses) |

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
| org_settings | key (UNIQUE) — key-value config store with 'meta' JSON key |
| donations | status, requested_at DESC, user_id (FK), certificate_number (UNIQUE) |
| id_cards | status, requested_at DESC, user_id (FK), unique_card_number (UNIQUE) |
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

- **GORM table names** — GORM v2 automatically pluralises struct names (e.g. `OrgSetting` -> `org_settings`). Always implement `func (Model) TableName() string` if the table name is singular or custom.
- **`org_settings` key-value model** — replaces the single-row `ngo_config` table. `GetAll()` returns a map, `BulkSet()` upserts atomically. Cloudinary IDs for logo/signature are stored inside the `meta` key as JSON: `{"logo_cloudinary_id":"...","signature_cloudinary_id":"..."}`.
- **User Profile records** — `donations` has `user_id` FK linked during `POST /donations`. `id_cards` has `user_id` FK linked during `POST /id-cards`. Authenticated users query `/api/v1/my/donations` and `/api/v1/my/id-cards`.

---

## 19. API Response Envelope Details

Every handler wraps its response in a consistent JSON envelope. Frontend must unwrap `.data`.

### Single-Item Responses
All create/get/update endpoints return:
```json
{ "data": { ...model_fields... } }
```

### List Responses (Paginated)
All list endpoints (donations, id-cards, notices, gallery, events, users) return:
```json
{
  "data": [ ...items... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 147,
    "totalPages": 8
  }
}
```

### Non-Paginated List Responses
`GET /team` returns `{ "data": [...slots...] }` without pagination (max 5 slots).

### Message-Only Responses
Some endpoints return only a confirmation message (not the entity):

| Endpoint | Response |
|---|---|
| `POST /auth/send-otp` | `{"data": {"message": "OTP sent successfully"}}` |
| `PATCH /users/:id/promote` | `{"data": {"message": "User promoted to admin"}}` |
| `PATCH /users/:id/demote` | `{"data": {"message": "Admin role revoked"}}` |
| `DELETE /notices/:id` | `{"data": {"message": "Notice deleted"}}` |
| `DELETE /gallery/:id` | `{"data": {"message": "Image deleted"}}` |
| `DELETE /events/:id` | `{"data": {"message": "Event deleted"}}` |

### Error Envelope
All errors follow the same shape:
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "human readable message" } }
```
Frontend reads: `response.data.error.message`

### Image Upload Field Names
Backend DTOs use `*Base64` suffix for upload fields — NOT the same as the model's `*Url` fields:

| Endpoint | Client field name | Backend DTO field |
|---|---|---|
| `POST /donations` | `paymentScreenshotBase64` | `paymentScreenshotBase64` |
| `POST /id-cards` | `passportPhotoBase64`, `paymentScreenshotBase64` | same |
| `POST /notices` | `imageBase64` | `imageBase64` |
| `POST /gallery` | `imageBase64` | `imageBase64` |
| `PATCH /ngo/config` | `logoBase64` | `logoBase64` (NOT `logoUrl`) |
| `PATCH /ngo/config` | `signatureBase64` | `signatureBase64` (NOT `signatureUrl`) |
| `PATCH /team/:slot` | `photoBase64` | `photoBase64` |

---

## 20. Repository Pattern — FindByID Availability

Every repository exposes `FindByID(id uuid.UUID)` for fetching a single record after mutation:

| Repository | FindByID available |
|---|---|
| UserRepository | ✅ |
| DonationRepository | ✅ |
| IdCardRepository | ✅ |
| NoticeRepository | ✅ |
| GalleryRepository | ✅ |
| EventRepository | ✅ |
| TeamRepository | ✅ (by slot) |
| NgoRepository | ✅ (GetConfig, single row) |

Used in: `NoticeService.ToggleActive()` fetches after update to return fresh record.

---

## 21. Messaging Architecture — Multi-Channel Notification

All outgoing phone notifications (OTP, donation approval, ID card approval) use the **`Messenger` interface**.

### Interface

```go
// api/internal/service/messenger.go
type Messenger interface {
    Send(phone, message string)
}
```

`SMSService`, `WhatsAppTwilioService`, and `WhatsAppLocalService` all implement it.

### Switching Channels

```env
MESSAGING_TYPE=sms              # Twilio SMS (DLT required for Indian prod)
MESSAGING_TYPE=whatsapp_twilio  # Twilio WhatsApp (sandbox or production number)
MESSAGING_TYPE=whatsapp_local   # standalone whatsapp_service microservice (free)
```

`MultiMessenger` reads this at startup and routes all `Send()` calls accordingly.
**Zero code changes needed to switch channels** — only restart with a new env var.

### Service Map

| Service | File | Sends via |
|---|---|---|
| `SMSService` | `sms_service.go` | Twilio SMS API |
| `WhatsAppTwilioService` | `whatsapp_twilio_service.go` | Twilio WhatsApp API (`whatsapp:` prefix on To/From) |
| `WhatsAppLocalService` | `whatsapp_local_service.go` | HTTP POST to `whatsapp_service` microservice |
| `MultiMessenger` | `multi_messenger.go` | Dispatcher — picks one of the above |

### Callers (all receive `Messenger`, not a concrete type)

| Service | Usage |
|---|---|
| `OTPService` | Sends OTP code on login |
| `DonationService` | Sends approval/rejection notification |
| `IDCardService` | Sends approval/rejection notification |

### Manual Notify API Endpoints

| Method | Route | Sends via |
|---|---|---|
| `POST` | `/api/v1/notify/sms` | `SMSService` directly (explicit) |
| `POST` | `/api/v1/notify/whatsapp_twilio` | `WhatsAppTwilioService` directly |
| `POST` | `/api/v1/notify/whatsapp_local` | `WhatsAppLocalService` directly |
| `POST` | `/api/v1/notify/email` | `EmailService` directly |

### Phone Format

All services receive raw 10-digit Indian numbers (`"9876543210"`).  
Country code `+91` is appended internally by each service.

### whatsapp_service Microservice

Located at `whatsapp_service/` (separate Go module — move to own git repo).  
Uses `go.mau.fi/whatsmeow` (unofficial WhatsApp Web protocol — 100% free, no Meta approval).  
Exposes `POST /send`, `GET /status`, `GET /qr`.  
Session persisted in SQLite (`store/whatsapp.db`) — auto-reconnects on restart.

See `whatsapp_service/kt.md` for full documentation.
