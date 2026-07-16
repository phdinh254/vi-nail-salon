# Vi-Nail-Salon DevOps

Infrastructure and operations guide for **Vi Nail** — PostgreSQL, the NestJS
`backend` API, and the Next.js `frontend`, orchestrated through Docker
Compose. `nginx` reverse-proxies both services behind a single origin in
production (`/api/*` → backend, everything else → frontend).

## Requirements

- Docker Desktop (or Docker Engine + Compose v2) for the containerized
  workflow.
- Node.js 22.x and npm if running `backend` or `frontend` directly on the
  host.
- Ports `3000` (frontend), `3001` (backend), `5432` (Postgres) and `80`
  (nginx, production only) free on the host.

## Environment configuration

Three `.env.example` files exist — copy each to its real `.env` and adjust
values:

| File | Copy to | Used by |
|---|---|---|
| `.env.example` (repo root) | `.env` | Docker Compose (Postgres credentials, `JWT_SECRET`, `CORS_ORIGIN`) |
| `backend/.env.example` | `backend/.env` | Backend running directly on the host (`npm run start:dev`) |
| `frontend/.env.example` | `frontend/.env.local` | Frontend running directly on the host (`npm run dev`) |

```
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Key variables:

- `JWT_SECRET` — signs all JWTs (login sessions, OTP booking sessions, guest
  access tokens). Backend **fails to start** if this is missing.
- `CORS_ORIGIN` — comma-separated list of origins allowed to call the API.
  Backend **fails to start** if this is missing *and* `NODE_ENV=production`;
  in development it defaults to `http://localhost:3000`.
- `ALLOW_CONSOLE_SMS_IN_PROD` — the project has no real SMS/Zalo ZNS
  provider yet; OTP codes are logged to the backend console
  (`ConsoleSmsProvider`). The backend refuses to start with
  `NODE_ENV=production` unless this is explicitly set to `true`. Only do
  this for a controlled internal demo/UAT deployment with restricted log
  access — replace `ConsoleSmsProvider` with a real provider
  (`backend/src/auth/sms/`) before handling real customer traffic.
- `NEXT_PUBLIC_API_URL` (frontend) — base URL the **browser** uses to call
  the API. Baked in at Docker build time via `--build-arg`.

## Local development (Docker Compose)

Start everything from the repository root:

```
docker compose --env-file .env -f devops/docker-compose.dev.yml up -d
```

The `--env-file` flag is required — without it Compose looks for `.env`
next to the compose file (`devops/.env`) instead of the repo root, and the
backend fails to authenticate against Postgres.

Services:

- Postgres: `localhost:5432`
- Backend API: `http://localhost:3001/api`
- Backend health check: `http://localhost:3001/api/health`
- Frontend: `http://localhost:3000`

The backend container applies pending Prisma migrations automatically on
start (`prisma migrate deploy`) before it begins accepting traffic; `nginx`
and the frontend only depend on services once their Docker healthcheck
reports healthy.

Seed sample data into the containerized database:

```
docker compose -f devops/docker-compose.dev.yml exec backend npm run prisma:seed
```

Seeding is idempotent — running it again does not create duplicates.

Stop the stack (containers only, **data is preserved**):

```
docker compose -f devops/docker-compose.dev.yml down
```

Stop and **permanently delete** all data (Postgres volume included):

```
docker compose -f devops/docker-compose.dev.yml down -v
```

## Production (`docker-compose.prod.yml`)

Adds an `nginx` service in front of `backend` and `frontend`, listening on
port 80. Backend, frontend and Postgres are **not** published directly —
only `nginx` is exposed to the host.

```
docker compose --env-file .env -f devops/docker-compose.prod.yml up -d --build
```

Before running in production:

- Set `JWT_SECRET` to a strong random value — the example default
  (`change-me`) is for local development only.
- Set `CORS_ORIGIN` to your real frontend origin(s).
- Set `ALLOW_CONSOLE_SMS_IN_PROD=true` only if you accept OTP codes being
  logged (see above) — otherwise integrate a real SMS provider first.
- The frontend image bakes `NEXT_PUBLIC_API_URL=/api` at build time so the
  browser calls the API through the `nginx` reverse proxy on the same
  origin (avoids CORS entirely for browser traffic). Server-side rendering
  inside the frontend container uses a separate `API_INTERNAL_URL`
  (`http://backend:3001/api`, Docker-internal DNS) since a relative path or
  `localhost` is not reachable from server-rendering code running inside
  the frontend container itself.

## Running the backend or frontend outside Docker

For day-to-day development it's often faster to keep only Postgres in
Docker and run the app directly on the host:

```
docker compose -f devops/docker-compose.dev.yml up -d postgres
cd backend && npm run start:dev
```

This requires `backend/.env` (see Environment configuration above) with
`DATABASE_URL` pointing at `localhost:5432`.

For the frontend:

```
cd frontend && npm run dev
```

`frontend/.env.local` should set `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
to reach the host-run (or Dockerized) backend.

## Demo accounts

Seeded by `backend/prisma/seed.ts` (`npm run prisma:seed`), password
`change-me-123` for all:

| Role | Phone |
|---|---|
| Admin | `0900112233` |
| Staff | `0911111111`, `0955001122` |
| Customer | `0909111222` |

These are **demo credentials with a known password** — do not seed them
into a database that is reachable by real users without rotating the
passwords first.

## Tests

Backend (from `backend/`):

```
npm run typecheck   # tsc --noEmit
npm run test:e2e    # Jest + Supertest against a real Postgres (needs DATABASE_URL)
npm run build       # nest build
```

`test:e2e` requires a running Postgres reachable via the `DATABASE_URL` in
`backend/.env` — start it with
`docker compose -f devops/docker-compose.dev.yml up -d postgres` first. It
is safe to run repeatedly against the same database (uses run-scoped unique
phone numbers/timestamps).

There is no ESLint configuration for the backend yet — `npm run typecheck`
and `npm run test:e2e` are the available automated checks.

Frontend (from `frontend/`):

```
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm test             # vitest unit tests
npm run build        # next build (production build)
npm run test:e2e     # Playwright, against a running frontend (starts one via npm run dev if none is up)
```

`guest-booking-flow.spec.ts` requires a real OTP code and is not runnable
without either reading the code from backend logs or a test-mode bypass —
it's a known gap, not exercised in CI as-is. All other Playwright specs run
against the real backend API.

## Backup and restore (PostgreSQL)

Backup (from the repository root, stack running):

```
docker compose -f devops/docker-compose.dev.yml exec postgres pg_dump -U postgres vi_nail_salon > backup.sql
```

Restore into a running instance (⚠️ this does not drop existing data first —
restoring on top of a non-empty database can conflict; restore into a fresh
database or `down -v` first if you want a clean slate):

```
cat backup.sql | docker compose -f devops/docker-compose.dev.yml exec -T postgres psql -U postgres -d vi_nail_salon
```

## Common issues

- **Backend crash-loops immediately with a `CORS_ORIGIN`/`JWT_SECRET`
  error** — the corresponding env var is missing. Check `.env` and that you
  passed `--env-file .env` to `docker compose`.
- **Backend crash-loops with a `ConsoleSmsProvider` error** —
  `NODE_ENV=production` is set but `ALLOW_CONSOLE_SMS_IN_PROD` isn't (see
  Environment configuration above).
- **`docker compose up` warns `"POSTGRES_USER" variable is not set"` and the
  backend can't authenticate to Postgres** — you forgot `--env-file .env`.
- **Frontend container is `unhealthy`** — rebuild the frontend image; older
  images built before this fix bind Next.js's standalone server to Docker's
  auto-injected `HOSTNAME` instead of all interfaces.
- **Frontend pages that need live data (e.g. `/services`) fail to build the
  Docker image** — a page doing a build-time server fetch needs
  `export const dynamic = "force-dynamic"` so it renders per-request instead
  of at build time (when no backend is reachable yet).
- **OTP not received** — no real SMS provider is configured; the code is
  logged by the backend (`docker compose ... logs backend | grep OTP`), not
  sent as an actual SMS.
