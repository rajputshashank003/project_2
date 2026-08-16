# Client Knowledge Transfer (KT)

> **Maintained by:** Frontend Team
> **Last Updated:** 2026-08-14
> **Framework:** React (Vite) — `client/`

---

## 1. Overview

React single-page application for the NGO Platform. Connects to the Go backend at `/api/v1/`.
Manages: authentication (OTP via phone), admin panel (donations, ID cards, gallery, events, notices, team, config), and public-facing pages (about, gallery, events, contact).

---

## 2. Tech Stack

| Technology | Notes |
|---|---|
| React 18 | UI library |
| Vite | Build tool + dev server |
| React Router v6 | Client-side routing |
| Context API | Global auth state |
| CSS Modules / Vanilla CSS | Styling |
| Cloudinary | Images fetched from CDN URLs returned by API |
| jsPDF / html2canvas | Client-side PDF generation (certificates, ID cards) |

---

## 3. Screen Pattern

Every screen follows the 4-file structure under `src/screens/ScreenName/`:

```
screens/
  ScreenName/
    ScreenName.tsx     Main component (renders sub-components)
    useScreenName.ts   Custom hook (all state, API calls, handlers)
    context.ts         React context (avoids prop-drilling into sub-components)
    components/        Sub-components, consume context via useContext()
```

### Hook → API Function Mapping

| Screen Hook | API Functions Used |
|---|---|
| `useLogin` | `sendOtp`, `verifyOtp` |
| `useHome` | `getNotices`, `getGalleryImages` |
| `useAbout` | `getTeamMembers` |
| `useEvents` | `getEvents` |
| `useGallery` | `getGalleryImages` |
| `useDonate` | `createDonation` |
| `useIDGenerate` | `createIdCardRequest` |
| `useCertificateView` | `getDonationById` |
| `useIDCardView` | `getIdCardById` |
| `useAdminRequestDonation` | `getDonations`, `updateDonationStatus` |
| `useAdminRequestIdCard` | `getIdCardRequests`, `updateIdCardStatus`, `uploadSignature`, `deleteSignature` |
| `useAdminNoticeboard` | `getNotices`, `createNotice`, `toggleNoticeActive`, `deleteNotice` |
| `useAdminGallery` | `getGalleryImages`, `uploadGalleryImage`, `deleteGalleryImage` |
| `useAdminEvents` | `getEvents`, `createEvent`, `updateEvent`, `deleteEvent` |
| `useAdminTeam` | `getTeamMembers`, `updateTeamMember`, `clearTeamMember`, `addTeamSlot`, `removeTeamSlot` |
| `useAdminUsers` | `getUsers`, `updateUserDesignation` |
| `useAdminSettings` | `updateNgoConfig`, `uploadSignature`, `deleteSignature` |
| `useUserProfile` | `getMyDonations`, `getMyIdCards` |
| `ProfileCompletionModal` | `updateMyProfile` |

---

## 4. API Layer

All HTTP calls go through `src/utils/api_request/`:
- `request(config)` — centralized Axios wrapper with automatic Bearer token injection and error handling
- Base URL: `VITE_API_BASE_URL` env var (must be `http://localhost:3000/api/v1` in dev, backend URL in prod)
- Auth token stored in `localStorage` as `ngo_token`, passed as `Authorization: Bearer <token>`
- Idempotency-Key: generated once per form submit (uuid), stored in React state, sent as header for `POST /donations` and `POST /id-cards`
- Mandatory onboarding: `PATCH /my/profile` handles user self-update for full name and email.
- Deep links & redirection: `ProtectedRoute` captures `from` location state, and `useLogin` supports `?redirect=` param for automatic post-auth routing.

---

## 5. Screen Inventory

| Screen | Route | Auth | Notes |
|---|---|---|---|
| Home | `/` | Public | Landing page |
| About | `/about` | Public | Team members from `/api/v1/team` |
| Gallery | `/gallery` | Public | Paginated from `/api/v1/gallery` |
| Events | `/events` | Public | Paginated from `/api/v1/events` |
| Notices | `/notices` | Public | Paginated from `/api/v1/notices` |
| Contact | `/contact` | Public | NGO config from `/api/v1/ngo/config` |
| Login | `/login` | Public | Phone → OTP via WhatsApp → JWT stored in localStorage |
| UserProfile | `/profile` | Auth | User overview showing all donations, certificates, and ID cards |
| DonateForm | `/donate` | Auth | POST `/donations` with Idempotency-Key |
| IDCardForm | `/id-generate` | Auth | POST `/id-cards` with Idempotency-Key |
| AdminDashboard | `/admin` | Admin | Stats overview |
| AdminDonations | `/admin/donations` | Admin | List + approve/reject |
| AdminIDCards | `/admin/id-cards` | Admin | List + approve with validityYears |
| AdminGallery | `/admin/gallery` | Admin | Upload + delete |
| AdminEvents | `/admin/events` | Admin | Create + update + delete |
| AdminNotices | `/admin/notices` | Admin | Create + toggle + delete |
| AdminTeam | `/admin/team` | Admin | Slot management |
| AdminConfig | `/admin/config` | Admin | NGO config partial update |
| AdminUsers | `/admin/users` | Admin | List + promote/demote |

---

## 6. Auth Flow

```
Login screen
  → user enters phone
  → POST /api/v1/auth/send-otp {phone}
  → user receives 6-digit OTP on WhatsApp
  → POST /api/v1/auth/verify-otp {phone, otp}
  → response: {token, user}
  → stored in localStorage: ngo_token, ngo_user
  → AuthContext updated
  → redirect to /dashboard (user) or /admin (admin)
```

Logout: clear localStorage, reset AuthContext, redirect to `/login`.

---

## 7. Certificate / ID Card Generation

Both are **100% client-side** — no PDFs stored on the server.

- **Certificate:** User visits `/my-certificates`, selects a donation with `status=approved`, clicks "Download". `jsPDF` generates a PDF using the `certificate_number` and NGO config (logo, signature, president_name etc.) fetched from API.
- **ID Card:** User visits `/my-id-card`, clicks "Download". `jsPDF` generates a card using `unique_card_number`, `issue_date`, `expiry_date`, passport photo URL, and NGO details.

Backend stores only: `certificate_number`, `unique_card_number`, `issue_date`, `expiry_date`. No PDFs in DB or Cloudinary.

---

## 8. Image Uploads (Admin)

All images are sent as **Base64** in JSON body:
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

The API strips the `data:...;base64,` prefix automatically before uploading to Cloudinary. The API returns a `imageUrl` (Cloudinary CDN URL) which the client displays.

**Body limit:** API enforces 20 MB cap. Client should validate file size before encoding.

---

## 9. Idempotency (Donation & ID Card)

Before submitting the donation or ID card form:
1. Generate a UUID once (`crypto.randomUUID()`)
2. Store it in React state (so it survives re-renders but not page refresh)
3. Send as `Idempotency-Key: <uuid>` header on `POST /donations` or `POST /id-cards`

If the user hits "Submit" twice (network retry), the second request returns the cached response (no duplicate in DB).

---

## 10. Pagination

All list API calls accept `?page=1&limit=20`. Response:
```json
{ "data": [...], "pagination": { "page": 1, "limit": 20, "total": 147, "totalPages": 8 } }
```

Implement "Load More" or numbered pages using `pagination.totalPages`.

---

## 11. ID Card Approval (Admin) — Validity Field

`AdminIDCards` screen must include a **Validity** selector in the approval modal:

```
Validity: [ Lifetime ] [ 1 Year ] [ 2 Years ] [ Custom: ___ years ]
```

Sends `validityYears: number` in the PATCH body (`0` = Lifetime, `N` = N years).

---

## 12. Environment Variables

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

In production, set to your Render/backend URL.

---

## 13. Code Conventions

- All API calls in `src/utils/api_request/*.ts` — never inline fetch/axios in components or hooks
- Global auth state in `AuthContext` only — no prop-drilling of token/user
- **File Uploads**: Always use `FormData` with raw browser `File` objects for network transfer; use `URL.createObjectURL(file)` for instant UI previews (never convert to base64 for network requests)
- Images displayed using Cloudinary CDN URLs — never embed Base64 in UI
- Error responses always in `{error: {code, message}}` shape — parse `error.code` for user-facing messages
- Loading + error states required on every API call

---

## 14. Run Locally

```bash
cd client
cp .env.example .env   # set VITE_API_BASE_URL
npm install
npm run dev            # http://localhost:5173
```

---

## 15. Gotchas

- `VITE_API_BASE_URL` must end with `/api/v1` (no trailing slash) — API calls append `/donations` etc.
- In dev mode, use phone `ADMIN_PHONE` (from backend `.env`) + OTP `123456` to log in as admin
- Cloudinary images may take 1-2s to propagate CDN on first upload — show loading state
- `jsPDF` generation is synchronous and blocking for large content — consider `Web Worker` for heavy cards
- Team slots are 1-indexed and re-indexed after deletion — always use `slot` number from API response, not array index
- `pagination.totalPages` can be 0 if there are no records — handle empty state in UI

---

## 16. API Layer Architecture

### Central Utility (`src/utils/api_request/utils.ts`)

| Export | Purpose |
|---|---|
| `axiosInstance` | Axios instance with baseURL, 15s timeout, auto-attaches Bearer token |
| `request<T>()` | Generic request wrapper; shows error toast on failure; throws for caller |
| `unwrap<T>()` | Extracts `.data` from `{data: T}` backend envelope |
| `ApiResponse<T>` | Type: `{data: T}` — single item response |
| `PaginatedResponse<T>` | Type: `{data: T[], pagination: {...}}` — list response |

**Auth & FormData:** `axiosInstance` reads `localStorage[STORAGE_KEYS.AUTH_TOKEN]` and adds `Authorization: Bearer <token>`. When `config.data instanceof FormData`, it deletes `'Content-Type'` so Axios and the browser automatically set `multipart/form-data` with proper boundary headers instead of attempting to JSON-stringify the FormData.

**401 handling:** Interceptor clears auth, redirects to `/login` automatically.

**Error handling:** `request()` reads `response.data.error.message` from the backend error envelope and calls `toast.error()`. Hooks use empty `catch {}` to avoid double-toasting.

### API Function Files (`src/utils/api_request/*.ts`)

10 files: `auth`, `donations`, `id_cards`, `my`, `ngo`, `notices`, `events`, `gallery`, `team_members`, `users`

**Response pattern:**
- Paginated lists: return `PaginatedResponse<T>` directly (caller extracts `.data`)
- Single items: `await request<ApiResponse<T>>({...})` then `unwrap(res)` before returning
- void operations (delete): `await request<unknown>({...})`

### Services (`src/services/`)

| Service | Purpose |
|---|---|
| `notification_service.ts` | SMS via `axiosInstance.post('/notify/sms')`, Email via `axiosInstance.post('/notify/email')`. Uses axiosInstance so Bearer token is attached. |
| `storage_service.ts` | `localStorage` helpers for `ngo_token` / `ngo_user` |

### Global Contexts

| Context | Source File | Provides |
|---|---|---|
| `AuthContext` | `src/context/AuthContext.tsx` | `user`, `isAdmin`, `login()`, `logout()` |
| `AppContext` | `src/context/AppContext.tsx` | `ngoConfig` (fetched on app startup from `GET /ngo/config`), `setNgoConfig()` |

**AppContext** is critical: `ngoConfig` (name, logo, signature, etc.) is used by multiple screens (ID card approval, certificate generation). It is fetched once on mount and shared globally.

---

## 17. Login Access Restrictions (`VITE_STOP_LOGIN`)

- `VITE_STOP_LOGIN` in `client/.env` controls phone-based login access.
- Accepts a comma-separated list of allowed phone numbers (e.g. `VITE_STOP_LOGIN="1242342, 4124342, 2423423"`).
- If set, any user attempting to request an OTP with a number not present in the list receives `toast.error('Feature under maintenance')` and the API call is prevented.
- If empty or set to `"false"`, all valid 10-digit mobile numbers are permitted to log in.
- Normalized and validated via `isLoginAllowedForPhone(phone)` in `src/utils/helpers.ts`.

---

## 18. Staged Uploads, Blood Group & App Polish

- **Staged Uploads**:
  - `AdminSettings`: Logo and signature files are staged locally and submitted together on "Save All Settings" via `updateNgoConfig()`. Form inputs are never wiped on asset selection.
  - `AdminGallery`: Selected file is previewed with a remove button and uploaded only when clicking "Submit / Upload Photo".
- **Blood Group Support**:
  - Added to `ProfileCompletionModal`, `AdminUsers` table with filtering dropdown, and `UserProfile` with editing.
- **Canvas Generation & Loaders**:
  - `IDCardCanvas` and `CertificateCanvas` show spinners during export (`isDownloadingPng`, `isDownloadingPdf`).
  - Disables `cacheBust: true` to prevent Cloudinary 404s/CORS issues.
  - Download buttons only display on approved cards/certificates in admin review modals.
- **SEO & Dynamic Import Resilience**:
  - `index.html` includes full OpenGraph, Twitter card, theme-color, and meta descriptions.
  - `App.tsx` wraps route chunks with `lazyWithRetry` to handle deployment mismatches cleanly.

---

## 19. Responsive Canvas Aspect-Ratio Scaling & ID Card Validity

- **Certificate Canvas Scaling (`CertificateCanvas`)**:
  - Automatically calculates scale `scale = Math.min(1, containerWidth / 794)` using a container `ResizeObserver`.
  - Outer container dynamically sizes to `794 * scale` x `562 * scale` with `transform: scale(scale)` centered in the layout flow.
  - Preserves standard A4 landscape aspect ratio across mobile viewports (360px–414px) and admin modals with zero horizontal scrollbars or cropping.
  - PNG/PDF downloads export unscaled `794px x 562px` at `pixelRatio: 2.5` (`1985x1405px`) for ultra-high-resolution output.
- **ID Card Canvas Scaling (`IDCardCanvas`)**:
  - Calculates responsive scale `scale = Math.min(1, containerWidth / baseWidth)` (baseWidth: 320px stacked on `<680px`, 656px side-by-side on `>=680px`).
  - Scales cleanly inside narrow phone viewports and modal bodies.
  - PNG/PDF downloads export unscaled `320px x 200px` cards at `pixelRatio: 2.5`.
- **ID Card Validity Display (`expiryDate`)**:
  - `useIDCardView.ts` and `IdCardRequestComponents.tsx` map `expiryDate: data.expiryDate` into `cardData`.
  - `IDCardCanvas` displays `Valid till: <Formatted Date>` (e.g. `Valid till: 16 Aug 2027`) when validity > 0, and `Valid till: Lifetime` when validity is 0.

---

## 20. Certificate Flex Layout, Single-Line Mobile Tabs & DB Profile Sync

- **Certificate Canvas Proportional Flex Layout (`CertificateCanvas`)**:
  - `#certificate-print-area` uses `flex flex-col justify-between` within `794px` x `562px` canvas (`padding: 22px 48px 18px`).
  - Balanced element heights and line-heights ensure the President signature block, President title, and Certificate Number sit comfortably `~25px` above the bottom green border with zero overflow under all conditions (with/without logo, with/without purpose).
- **Admin Modal Mobile Single-Line Tabs (`DonationRequestComponents.tsx`)**:
  - Tab buttons use `px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap gap-1.5 sm:gap-2 flex-1 sm:flex-initial justify-center` so "Payment Screenshot" and "Certificate Preview" remain on a single line on mobile screens.
  - Matches public certificate data by providing `ngoLogo` and `purpose`.
- **Live User Profile & Role from DB (`AuthContext`)**:
  - Calls `GET /api/v1/my/profile` via `refreshUser()` on app load and on `/profile` screen mount.
  - Updates `user` state and `localStorage` so role badges (`Admin` / `Member`) and designations reflect database truth in real time.

---

## 21. Form Email Auto-Fill & Profile Designation Badge Fix

- **Email Auto-Fill in Forms (`useIDGenerate.ts` & `useDonate.ts`)**:
  - Auto-fills `email: user.email` in ID Card generation and Donation/Certificate forms on mount and when `user` updates from DB.
  - Users are fully able to edit or change the email in the input field prior to submitting.
- **Profile Designation Badge (`UserProfile.tsx`)**:
  - Corrected badge display so user's actual designation (`user.designation`, e.g. "Secretary") is always shown.
  - Adds an `Admin` badge alongside designation when `user.role === "admin" && user.designation !== "admin"`.

---

## 22. Enhanced Rejection Email Templates & UI/UX

- **Rejection Notification Templates (`notification_service.ts`)**:
  - Updated `buildDonationRejectionMessages` and `buildIdCardRejectionMessages` with a structured layout, dark NGO branded header, styled rejection reason callout box (`#fff1f2` with `#e11d48` border), and action button linking directly to `/donate` or `/id-card/generate`.




