output "backend_iam_role_arn" {
  description = "ARN of the IAM role for the backend service account"
  value       = module.iam_eks_role.iam_role_arn
}
