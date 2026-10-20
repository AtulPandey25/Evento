# Evento DevOps Runbook

## Local Docker Stack

Start the complete stack:

```sh
docker compose up -d --build
```

Open the app:

- Customer and organizer UI: `http://localhost:4000/events`
- API gateway: `http://localhost:3000`
- Mailpit inbox: `http://localhost:8025`

Seeded accounts:

- Customer: `customer@evento.local`
- Organizer: `organizer@evento.local`
- Admin: `admin@evento.local`
- Password for all accounts: `Evento@123`

Useful checks:

```sh
docker compose ps
docker compose logs -f api-gateway auth-service events-service tickets-service notifications-service
```

## CI

GitHub Actions runs the same verification chain used locally:

```sh
pnpm verify
```

That includes product readiness checks, backend unit tests, backend e2e tests, Nest build, client typecheck, lint, production build, and Playwright e2e.

## Kubernetes

Build the local images first:

```sh
docker compose build api-gateway auth-service events-service tickets-service notifications-service client db-setup
```

Render the Kubernetes base:

```sh
kubectl kustomize k8s/base
```

Apply to the current Kubernetes context:

```sh
kubectl apply -k k8s/base
```

Default NodePort URLs:

- Client: `http://localhost:30040/events`
- API gateway: `http://localhost:30080`

## Terraform

Terraform wraps the same Kubernetes base for an IaC demo:

```sh
terraform -chdir=terraform/local-kubernetes init
terraform -chdir=terraform/local-kubernetes plan
terraform -chdir=terraform/local-kubernetes apply
```

Use a named kube context:

```sh
terraform -chdir=terraform/local-kubernetes apply -var='kube_context=your-context'
```

Destroy:

```sh
terraform -chdir=terraform/local-kubernetes destroy
```
