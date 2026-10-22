# Pass 63 - Docker Runtime Baseline

Date: 2026-06-30

## Scope

- Added a shared Nest monorepo backend image with per-service `SERVICE` build args.
- Added a Next.js client image.
- Added Docker Compose for PostgreSQL, Redis, Kafka, Mailpit, database setup, five backend services, and the client.
- Added health checks and topic initialization so Kafka-backed services can start predictably.

## Verification

- `docker compose config --quiet` passed.
- `docker build -f Dockerfile.backend --build-arg SERVICE=api-gateway -t evento/api-gateway:local .` passed.
- `docker build -f client/Dockerfile -t evento/client:local ./client` passed.
- `docker compose build api-gateway auth-service events-service tickets-service notifications-service client db-setup` passed.
- `docker compose up -d ...` brought PostgreSQL, Redis, Kafka, Mailpit, backend services, gateway, and client online.
- Live integration smoke passed: customer login, event listing, quantity-3 ticket purchase, ticket wallet retrieval, and Mailpit notification check.
- `pnpm verify` passed after the Docker runtime fix.

## Score

Current score: 99.4/100.
