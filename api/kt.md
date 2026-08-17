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
| APP_BASE_URL | — | https://ngo.costop.in | Public URL for notification deep links |
| MESSAGING_TYPE | — | sms | `sms` \| `whatsapp_twilio` \| `whatsapp_local` |
| WHATSAPP_LOCAL_URL | — | http://localhost:8080 | Microservice base URL |
| WHATSAPP_LOCAL_API_KEY | — | — | Microservice API key |
| TWILIO_ACCOUNT_SID | — | — | Required if MESSAGING_TYPE=sms/whatsapp_twilio |
| TWILIO_AUTH_TOKEN | — | — | Required if MESSAGING_TYPE=sms/whatsapp_twilio |
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
| PATCH | `/ngo/config` | Admin | `UpdateNgoConfigRequest` | Upserts KV pairs (including `mission`, `vision`) |

### User Profile (My Records & Onboarding)
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| GET | `/my/donations?page=&limit=` | Auth | — | Returns current user's donations (all statuses) |
| GET | `/my/id-cards?page=&limit=` | Auth | — | Returns current user's ID card requests (all statuses) |
| GET | `/my/profile` | Auth | — | Returns current user's fresh database profile and role |
| PATCH | `/my/profile` | Auth | `{name, email, bloodGroup}` | User self-onboarding / update |

### Donations
| Method | Path | Auth | Content-Type | Notes |
|---|---|---|---|---|
| GET | `/donations?page=&limit=` | Admin | — | Paginated |
| GET | `/donations/:id` | Auth | — | |
| POST | `/donations` | Auth | `multipart/form-data` | `paymentProof` file + form fields, Idempotency-Key header |
| PATCH | `/donations/:id/status` | Admin | `application/json` | Transactional |

### ID Cards
| Method | Path | Auth | Content-Type | Notes |
|---|---|---|---|---|
| GET | `/id-cards?page=&limit=` | Admin | — | Paginated |
| GET | `/id-cards/:id` | Auth | — | |
| POST | `/id-cards` | Auth | `multipart/form-data` | `passportPhoto` + `paymentScreenshot` files + form fields, Idempotency-Key header |
| PATCH | `/id-cards/:id/status` | Admin | `application/json` | Transactional; validityYears required |

### Notices
| Method | Path | Auth | Content-Type | Notes |
|---|---|---|---|---|
| GET | `/notices?page=&limit=` | Public | — | |
| POST | `/notices` | Admin | `multipart/form-data` | Optional `image` file + form fields |
| PATCH | `/notices/:id` | Admin | `application/json` | Toggle isActive |
| DELETE | `/notices/:id` | Admin | — | |

### Gallery
| Method | Path | Auth | Content-Type | Notes |
|---|---|---|---|---|
| GET | `/gallery?page=&limit=` | Public | — | |
| POST | `/gallery` | Admin | `multipart/form-data` | `image` file + optional `caption` |
| DELETE | `/gallery/:id` | Admin | — | |

### Events
| Method | Path | Auth | Content-Type | Notes |
|---|---|---|---|---|
| GET | `/events?page=&limit=` | Public | — | |
| POST | `/events` | Admin | `multipart/form-data` | `images` files array + `captions` array + form fields |
| PATCH | `/events/:id` | Admin | `multipart/form-data` | `images`, `existingUrls`, `captions` + form fields |
| DELETE | `/events/:id` | Admin | — | |

### Team
| Method | Path | Auth | Content-Type | Notes |
|---|---|---|---|---|
| GET | `/team` | Public | — | |
| PATCH | `/team/:slot` | Admin | `multipart/form-data` | Optional `photo` file + `name`, `designation` |
| PATCH | `/team/:slot/clear` | Admin | — | Resets slot and removes Cloudinary asset |
| POST | `/team/add-slot` | Admin | — | |
| DELETE | `/team/slot/:slot` | Admin | — | |

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

## 9. Request & Approval Flow (Transactions & Notifications)

### On Request Creation (`POST /donations`, `POST /id-cards`):
1. File uploaded via streaming to Cloudinary.
2. Record created in DB with `status = 'pending'`.
3. If `manager_phone` is configured in `org_settings`, an asynchronous goroutine sends an instant WhatsApp alert to the manager with applicant/donor details and a direct URL to review in the admin panel.

### On Review / Approval:
Both donations and ID cards wrap approval in a DB transaction:
```
BEGIN
  UPDATE status, reviewed_at, reviewed_by
  [approval] UPDATE certificate_number / unique_card_number
             (unique constraint → retry up to 3x on collision)
COMMIT
→ async goroutine: WhatsApp/SMS + Email notification to user
```

If transaction fails → status stays `pending`, no user notification sent.

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

| Table | Key Indexes / Columns |
|---|---|
| users | phone (UNIQUE) |
| otps | (phone, used, expires_at) |
| org_settings | key (UNIQUE) — key-value config store with JSONB `meta` column on every row (`id`, `key`, `value`, `meta`, `created_at`, `updated_at`) |
| donations | status, requested_at DESC, user_id (FK), certificate_number (UNIQUE) |
| id_cards | status, requested_at DESC, user_id (FK), unique_card_number (UNIQUE) |
| notices | is_active |
| gallery_images | uploaded_at DESC |
| events | created_at DESC |
| event_images | event_id |
| team_members | slot (PK) |
| idempotency_keys | (key, endpoint) composite PK |

All timestamps: `TIMESTAMPTZ`. Optional unique columns (`donations.certificate_number`, `id_cards.unique_card_number`) are modeled as `*string` so unassigned/pending rows store SQL `NULL` and avoid unique constraint collisions.

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
| `DonationService` | Sends approval/rejection notification (includes rejection reason, branded email, and CTA to `/donate`) |
| `IDCardService` | Sends approval/rejection notification (includes rejection reason, branded email, and CTA to `/id-card/generate`) |

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

---

## 15. Logging

- **HTTP Request Logger (`internal/middleware/logger.go`)**:
  - Automatically logs method, path, status, latency, client IP, and request ID for all incoming HTTP requests via Zerolog.
  - Formatted with console color and RFC3339 timestamps.
- **Database Query Logger (`internal/database/postgres.go`)**:
  - In `DEV_MODE=true`, GORM runs in `logger.Info` mode to output executed SQL statements and execution durations to stderr.
  - In production, GORM runs in `logger.Warn` mode.

---

## 16. Blood Group, Org Statistics & Event Image Updates

- **Blood Group (`users.blood_group`)**:
  - Added migration `000015_add_blood_group_to_users.up.sql`.
  - Supported in `GET /users?blood_group=...`, `PATCH /users/:id`, and `PATCH /my/profile`.
- **Org Impact Statistics**:
  - Org settings support keys: `stat_beneficiaries`, `stat_volunteers`, `stat_events_held`, `stat_donations`, `stat_years_active`.
  - Managed via `PATCH /admin/ngo` and returned in `GET /ngo`.
- **Event Update Safety**:
  - Event update modifies scalar fields directly via GORM `Select("Title", "Description", "UpdatedAt").Updates(...)` to prevent re-inserting stale preloaded associations after image deletion.

---

## 17. Pagination & Notification Brand Theme

- **Pagination Query**:
  - `PaginationQuery` in `dto/common_dto.go` defaults `Limit` to 20 (max 100).
  - List endpoints (`GET /donations`, `GET /id-cards`, `GET /users`, `GET /my/donations`, `GET /my/id-cards`) return `{ data: [...], pagination: { page, limit, total, totalPages } }`.
- **Notification Brand Palette**:
  - Rejection email templates in `donation_service.go` and `id_card_service.go` use the NGO website emerald brand color (`#065f46` header with `#059669` accents and `#fff1f2` rejection reason alert box).

---

## 18. Server-Side List Search & Route Aliases

- **Server-Side Search & Filter Query Parameters**:
  - `GET /api/v1/users`: supports `blood_group` and `search` (searches `name`, `phone`, `email`, `blood_group`, `designation` with SQL `ILIKE`/`LIKE`).
  - `GET /api/v1/donations`: supports `status` and `search` (searches `donor_name`, `phone`, `email`, `utr_number`, `certificate_number`).
  - `GET /api/v1/id-cards`: supports `status` and `search` (searches `user_name`, `phone`, `email`, `unique_card_number`, `designation`).
- **Resilient Route Aliases (`routes.go`)**:
  - Added aliases under `/api/v1` and root `r` to prevent 404s:
    - `/config`, `/ngo/config`, `/ngo` -> `GetConfig` / `UpdateConfig`
    - `/profile`, `/user/profile`, `/my/profile` -> `GetMyProfile` / `UpdateMyProfile`

---

## 19. Cleanup Service (OOP Background Worker)

- **OOP Architecture (`internal/service/cleanup_service.go`)**:
  - `CleanupService` encapsulates periodic purging of expired temporary records with configurable execution intervals and retention periods.
  - Dependencies: `IdempotencyRepository`, `OTPRepository`.
  - Methods: `NewCleanupService`, `Run(ctx context.Context)`, `PerformCleanup()`.
- **24-Hour Unified Retention**:
  - **Idempotency Keys**: Purged if `created_at < NOW() - 24 hours` (`idempotencyRepo.Cleanup()`).
  - **OTPs**: Purged if `created_at < NOW() - 24 hours` (`otpRepo.CleanupOlderThan(24 * time.Hour)`). Safely cleans expired OTPs while preserving the 10-minute rate-limit window.
- **Execution Schedule**:
  - Runs on server startup and every 1 hour via background ticker in `main.go`.

---

## 20. Single-API Global Statistics on Donation & ID Card Lists

- **Global Stats SQL Aggregations**:
  - `DonationRepository.GetStats()`: Runs single SQL query returning `total`, `pending`, `approved`, `rejected`, and `total_collected` (sum of approved amounts).
  - `IDCardRepository.GetStats()`: Runs single SQL query returning `total`, `pending`, `approved`, and `rejected`.
- **Single-API Response Envelope**:
  - `GET /api/v1/donations`: Returns `{ data: [...], pagination: {...}, stats: { total, pending, approved, rejected, totalCollected } }`.
  - `GET /api/v1/id-cards`: Returns `{ data: [...], pagination: {...}, stats: { total, pending, approved, rejected } }`.
  - 0 additional network calls; runs in <1ms alongside page query.

---

## 21. Health Service & WhatsApp 13-Minute Keep-Alive Worker

- **OOP Health Architecture (`internal/service/health_service.go`)**:
  - `HealthService` manages DB connectivity checking, WhatsApp microservice health probing, and keep-alive ping loops.
  - Dependencies: `*gorm.DB`, `whatsAppURL string`, `pingInterval time.Duration`, `httpClient *http.Client`.
  - Methods: `CheckDatabase(ctx)`, `CheckWhatsAppService(ctx)`, `GetOverallHealth(ctx)`, `StartKeepAliveWorker(ctx)`.
- **13-Minute Anti-Sleep Ping**:
  - Automatically pings `{WHATSAPP_LOCAL_URL}/api/health` every 13 minutes via background ticker loop in `main.go`. Keeps free tier Render instances awake and operational.
- **Health Endpoints**:
  - `GET /healthz`, `GET /health`, `GET /api/health`: Liveness probe (HTTP 200 OK).
  - `GET /readyz`: Overall readiness report (`database`, `whatsapp` status, HTTP code, latency).
  - `GET /health/whatsapp` & `GET /api/v1/health/whatsapp`: Real-time probe against the WhatsApp microservice.

---

## 22. Date Range Filtering on Donations and ID Cards

- **Date Filtering Query Parameters**:
  - `GET /api/v1/donations` and `GET /api/v1/id-cards` accept optional `start_date` (`startDate`) and `end_date` (`endDate`) query parameters (format: `YYYY-MM-DD` or RFC3339).
- **Day Boundary Coverage**:
  - `startDate` filters with `requested_at >= start 00:00:00 UTC`.
  - `endDate` filters with `requested_at <= end 23:59:59.999999999 UTC` so records created during the entire end date are included.
- **Repository Implementation**:
  - `DonationRepository.ListPaginated(offset, limit int, status, search, startDate, endDate string)`.
  - `IDCardRepository.ListPaginated(offset, limit int, status, search, startDate, endDate string)`.

---

## 23. ID Card Contribution Amount & Database Migration

- **Database Migration (`000016_add_amount_to_id_cards`)**:
  - Added `amount NUMERIC(12, 2) NOT NULL DEFAULT 0` column to `id_cards` table.
- **Model & DTO Updates**:
  - `models.IDCard`: Added `Amount float64` (`gorm:"column:amount;not null;default:0" json:"amount"`).
  - `dto.CreateIDCardRequest`: Added `Amount float64` (`json:"amount" form:"amount"`).
- **Service Notification**:
  - `IDCardService.notifyManagerNewIDCard`: Includes the applicant's declared donation / fee amount (`INR %.0f`) in the WhatsApp notification to the manager.








