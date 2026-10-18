terraform {
  required_version = ">= 1.5.0"
}

locals {
  manifest_files = fileset(var.kustomize_path, "**/*.yaml")
  manifest_hash = sha256(join("", [
    for file_name in local.manifest_files : filesha256("${var.kustomize_path}/${file_name}")
  ]))
  kubectl_context_arg = var.kube_context == "" ? "" : "--context ${var.kube_context} "
}

resource "terraform_data" "evento_kubernetes_base" {
  input = {
    kube_context_arg = local.kubectl_context_arg
    kustomize_path   = var.kustomize_path
    manifest_hash    = local.manifest_hash
  }

  provisioner "local-exec" {
    command = "kubectl ${self.input.kube_context_arg}apply -k ${self.input.kustomize_path}"
  }

  provisioner "local-exec" {
    when    = destroy
    command = "kubectl ${self.input.kube_context_arg}delete -k ${self.input.kustomize_path} --ignore-not-found=true"
  }
}
