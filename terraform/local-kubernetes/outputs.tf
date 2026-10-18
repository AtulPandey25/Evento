output "evento_urls" {
  description = "Default local-cluster NodePort URLs after the Kubernetes base is applied."
  value = {
    client      = "http://localhost:30040/events"
    api_gateway = "http://localhost:30080"
  }
}
