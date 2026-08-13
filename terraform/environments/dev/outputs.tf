output "configure_kubectl" {
  description = "Command to configure kubectl for the new EKS cluster"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.compute.cluster_name}"
}

output "ecr_repository_urls" {
  description = "ECR Repository URLs"
  value       = module.storage.repository_urls
}

output "backend_iam_role_arn" {
  description = "ARN for the Backend Service Account to assume"
  value       = module.iam.backend_iam_role_arn
}
