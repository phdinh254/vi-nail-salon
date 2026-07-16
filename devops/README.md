# WEBAPP-NAIL DevOps

Development infrastructure for the project: PostgreSQL, the NestJS `backend`
API, and the Next.js `frontend`, orchestrated through Docker Compose. `nginx`
reverse-proxies both services behind a single origin in production
(`/api/*` → backend, everything else → frontend).

## Local development

1. Copy the root env file: `cp .env.example .env` (repo root) and adjust
   values if needed.
2. Start everything from the repository root:
   `docker compose --env-file .env -f devops/docker-compose.dev.yml up -d`.
   The `--env-file` flag is required so Compose resolves `${POSTGRES_USER}`
   etc. from the root `.env` — without it Compose looks for `.env` next to
   the compose file instead and the backend fails to authenticate against
   Postgres.
3. The backend applies pending Prisma migrations automatically on container
   start (`prisma migrate deploy`) before booting.
4. Services:
   - Postgres: `localhost:5432`
   - Backend API: `http://localhost:3001/api`
   - Frontend: `http://localhost:3000`

To seed sample data into the containerized database, run:

```
docker compose -f devops/docker-compose.dev.yml exec backend npm run prisma:seed
```

## Production

`docker-compose.prod.yml` adds an `nginx` service in front of `backend` and
`frontend`, listening on port 80. Backend and frontend containers are not
published directly; only `nginx` is exposed. Set `JWT_SECRET` to a strong
random value in the production `.env` — the example default is for local
development only.

## Running the backend outside Docker

For day-to-day backend development, it's often faster to keep only Postgres
in Docker and run NestJS directly on the host:

```
docker compose -f devops/docker-compose.dev.yml up -d postgres
cd backend && npm run start:dev
```

This requires `backend/.env` (copy from `backend/.env.example`) with
`DATABASE_URL` pointing at `localhost:5432`.
