# PADINIG Backend (Express + Prisma + SQLite)

## Quick start

1) Create env file:

- Copy `.env.example` → `.env`
- Ensure:
  - `DATABASE_URL="file:./dev.db"`
  - `JWT_SECRET` is set
  - `CORS_ORIGINS` includes your Vite dev URL (default `http://localhost:5173`)

2) Install and generate Prisma client:

```bash
npm install
npm run prisma:generate
```

3) Apply migrations and seed:

```bash
npm run prisma:migrate
npm run seed
```

4) Run the API:

```bash
npm run dev
```

Server defaults to `http://localhost:4000`.

## API overview

All responses follow:

```json
{ "success": true, "data": "...", "error": null }
```

or

```json
{ "success": false, "data": null, "error": { "message": "...", "code": "..." } }
```

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me` (requires `Authorization: Bearer <token>`)

### Users (ADMIN only)

- `GET /users`
  - Query: `page`, `pageSize`, `q`, `role`, `isActive`
- `GET /users/:id`
- `PATCH /users/:id`
  - Body: `{ "isActive": true|false, "role": "ADMIN"|"RESIDENT" }`

### Announcements

- Public:
  - `GET /announcements/public`
    - Query: `page`, `pageSize`, `category`, `isEmergency`
- Admin:
  - `GET /announcements`
    - Query: `page`, `pageSize`, `status`, `category`, `isEmergency`, `from`, `to`
  - `GET /announcements/:id`
  - `POST /announcements`
  - `PATCH /announcements/:id`
  - `DELETE /announcements/:id`

### Notifications

- `GET /notifications` (current user; ADMIN can pass `userId=...`)
- `PATCH /notifications/:id/read`
  - Body: `{ "isRead": true }` (defaults to `true`)

## Frontend integration notes (React/Vite)

- Use an env var like `VITE_API_URL=http://localhost:4000`.
- Store the JWT in memory or `localStorage` (simpler for prototypes).
- Send `Authorization: Bearer <token>` on protected requests.
- Ensure `CORS_ORIGINS` includes your frontend origin (Vite dev: `http://localhost:5173`).

## Manual test plan (curl)

### 1) Login with seeded admin

```bash
curl -s -X POST "http://localhost:4000/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@padinig.local\",\"password\":\"Admin123!\"}"
```

Copy the `token` from the response into `TOKEN`.

### 2) Who am I?

```bash
curl -s "http://localhost:4000/auth/me" ^
  -H "Authorization: Bearer %TOKEN%"
```

### 3) List announcements (public)

```bash
curl -s "http://localhost:4000/announcements/public?page=1&pageSize=10"
```

### 4) Create announcement (admin)

```bash
curl -s -X POST "http://localhost:4000/announcements" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Test\",\"message\":\"Hello\",\"category\":\"GENERAL\",\"status\":\"PENDING\"}"
```

## Switching SQLite → Postgres later

You can keep the same route/controllers and Prisma models.

Typical changes:
- In `prisma/schema.prisma`, change `provider = "sqlite"` → `provider = "postgresql"`
- Update `DATABASE_URL` to a Postgres connection string
- Run `prisma migrate` against the new database

