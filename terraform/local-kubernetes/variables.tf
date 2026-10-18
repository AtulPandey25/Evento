variable "kube_context" {
  description = "Optional kubeconfig context to target. Leave blank to use the current context."
  type        = string
  default     = ""
}

variable "kustomize_path" {
  description = "Path to the Evento Kubernetes base."
  type        = string
  default     = "../../k8s/base"
}
