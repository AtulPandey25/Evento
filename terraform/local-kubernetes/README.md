# Evento Local Kubernetes Terraform

This Terraform project applies the Kubernetes base in `../../k8s/base` to the current kubeconfig context.

Build the local images first:

```sh
docker compose build api-gateway auth-service events-service tickets-service notifications-service client db-setup
```

Then deploy to the current Kubernetes context:

```sh
terraform -chdir=terraform/local-kubernetes init
terraform -chdir=terraform/local-kubernetes apply
```

The default base exposes:

- Client: `http://localhost:30040/events`
- API gateway: `http://localhost:30080`

For clusters that do not use the local Docker image cache, push the images to a registry and override image names with Kustomize before applying.
