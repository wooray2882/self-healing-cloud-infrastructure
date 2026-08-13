variable "environment" {
  description = "Environment name"
  type        = string
}

variable "oidc_provider_arn" {
  description = "OIDC Provider ARN from the EKS cluster"
  type        = string
}

variable "cluster_name" {
  description = "EKS Cluster Name"
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace where the backend service account will reside"
  type        = string
  default     = "default"
}

variable "service_account_name" {
  description = "Kubernetes service account name for the backend"
  type        = string
  default     = "healops-backend-sa"
}
