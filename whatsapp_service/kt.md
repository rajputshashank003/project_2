# whatsapp_service — Knowledge Transfer (KT)

> **Maintained by:** Backend Team  
> **Last Updated:** 2026-08-15  
> **Module:** `github.com/shashankrajput/whatsapp_service`

---

## 1. Overview

Standalone Go microservice that wraps `whatsmeow` (unofficial WhatsApp Web multi-device protocol client).  
Exposes a simple REST API so any backend (N_P, future projects) can send WhatsApp messages  
without coupling to `whatsmeow` directly.

**Why standalone?**
- Keeps `whatsmeow` dependency isolated from the main API
- Can be reused by multiple projects via HTTP
- Independently deployable (Docker, VPS, Railway)
- QR code session lifecycle managed separately from business logic

---

## 2. Tech Stack

| Tech | Version | Purpose |
|---|---|---|
| Go | 1.22+ | Language |
| Gin | v1.10 | HTTP server |
| whatsmeow | latest | WhatsApp Web multi-device client |
| go-sqlite3 | v1.14 | Session persistence (CGO required) |
| zerolog | v1.33 | Structured logging |

---

## 3. Directory Structure

```
whatsapp_service/
├── cmd/
│   └── main.go              Entry point — HTTP server + DI
├── internal/
│   ├── config/
│   │   └── config.go        Env var loader
│   ├── wa/
│   │   ├── client.go        WAClient — lifecycle (connect, QR, reconnect, events)
│   │   └── sender.go        WAClient.Send() — formats JID + sends message
│   └── handler/
│       ├── send_handler.go  POST /send
│       ├── status_handler.go GET /status
│       └── qr_handler.go   GET /qr (HTML page with QR image)
├── store/
│   └── store.go             SQLite container for whatsmeow session
├── kt.md                    This file
├── prompts/
│   └── 001.md               Initial prompt + implementation log
├── go.mod
├── .env.example
├── Dockerfile
└── README.md
```

---

## 4. API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/send` | None (internal) | Send a WhatsApp message |
| `GET` | `/status` | None | Connection state |
| `GET` | `/qr` | None | HTML page with QR code |
| `GET` | `/healthz` | None | Liveness probe |

### POST /send
```json
// Request
{ "phone": "8279991230", "message": "Your OTP is 123456" }

// Success (200)
{ "data": { "message": "sent" } }

// Error (503) — not connected
{ "error": { "code": "SEND_FAILED", "message": "wa: not connected (status: qr_pending)" } }
```

---

## 5. Phone Number Format

| Input | Internal JID (whatsmeow) |
|---|---|
| `"8279991230"` | `+918279991230@s.whatsapp.net` |

Always pass raw 10-digit Indian numbers. Country code `+91` is added automatically.

---

## 6. Session Lifecycle

```
First run:
  app starts → WAClient.Connect() → no session in SQLite → QR event fires
  → GET /qr → admin scans from WhatsApp (Linked Devices → Link a Device)
  → Connected event → session saved to store/whatsapp.db

Subsequent runs:
  app starts → WAClient.Connect() → session loaded from SQLite → auto-reconnects
  → no QR needed
```

Session is valid as long as:
- The linked device is **not removed** from WhatsApp (Settings → Linked Devices)
- The phone that owns the WhatsApp account is not factory reset

---

## 7. Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | HTTP server port |
| `WHATSAPP_DB_PATH` | `store/whatsapp.db` | SQLite path for session |
| `DEV_MODE` | `false` | If true, logs sends without calling WhatsApp |
| `LOG_LEVEL` | `info` | Zerolog level |

---

## 8. Running Locally

```bash
cp .env.example .env
go mod tidy
go run cmd/main.go

# First time only:
# Open http://localhost:8080/qr in browser
# Scan QR from WhatsApp → Linked Devices → Link a Device
# Service is now active
```

---

## 9. Docker

```bash
docker build -t whatsapp-service .
docker run -p 8080:8080 -v $(pwd)/store:/app/store whatsapp-service

# First run: open http://localhost:8080/qr to scan QR
# store/ volume persists session across container restarts
```

---

## 10. Production Notes

- **No Meta/WhatsApp approval needed** — uses WhatsApp Web protocol (same as scanning from browser)
- **Free** — no per-message cost, no API fees
- **Ban risk** — very low for legitimate use (OTP, notifications to real users who opted in).  
  Avoid bulk marketing messages.
- **Reliability** — depends on your server uptime and WhatsApp session staying active.  
  If the phone that holds the session loses internet for >14 days, re-scan QR.

---

## 11. Integration with N_P

N_P sets `MESSAGING_TYPE=whatsapp_local` and `WHATSAPP_LOCAL_URL=http://localhost:8080`.  
N_P's `WhatsAppLocalService.Send()` calls `POST http://localhost:8080/send`.  
No `whatsmeow` dependency in N_P itself.

```
N_P Backend → HTTP POST /send → whatsapp_service → whatsmeow → WhatsApp
```
